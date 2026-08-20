"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  deleteCatalogImage,
  uploadCatalogImage,
  type UploadedImage
} from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import {
  buildOptionSignature,
  normalizeSku,
  suggestSku,
  type VariantOptionSelection
} from "@/lib/sku";
import { productImageAltSchema, productVariantInputSchema } from "@/schemas/catalog";

type ImageOrderInput = {
  id: string;
  displayOrder: number;
  altText?: string;
};

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?erro=${encodeURIComponent(message)}`);
}

function getCheckboxValue(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function getStringValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function getImageFiles(formData: FormData) {
  return formData
    .getAll("variantImages")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function getImageAltValues(formData: FormData) {
  return formData
    .getAll("variantImageAlt")
    .map((value) => (typeof value === "string" ? value : ""));
}

function getRemovedImageIds(formData: FormData) {
  return formData
    .getAll("removeVariantImageId")
    .filter(
      (value): value is string => typeof value === "string" && value.length > 0
    );
}

function getExistingImageInputs(formData: FormData): ImageOrderInput[] {
  const inputs: ImageOrderInput[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("variantImageOrder:") || typeof value !== "string") {
      continue;
    }

    const id = key.replace("variantImageOrder:", "");
    const displayOrder = Number.parseInt(value, 10);
    const altValue = formData.get(`variantImageAlt:${id}`);
    const parsedAlt = productImageAltSchema.safeParse(
      typeof altValue === "string" ? altValue : ""
    );

    if (!id || Number.isNaN(displayOrder) || !parsedAlt.success) {
      continue;
    }

    inputs.push({ id, displayOrder, altText: parsedAlt.data });
  }

  return inputs;
}

async function uploadVariantImages(files: File[], altValues: string[]) {
  const uploadedImages: Array<UploadedImage & { altText?: string }> = [];

  for (const [index, file] of files.entries()) {
    const uploaded = await uploadCatalogImage(file);
    const parsedAlt = productImageAltSchema.parse(altValues[index] ?? "");

    uploadedImages.push({ ...uploaded, altText: parsedAlt });
  }

  return uploadedImages;
}

async function cleanupUploadedImages(images: UploadedImage[]) {
  await Promise.allSettled(
    images.map((image) => deleteCatalogImage(image.publicId))
  );
}

async function uploadVariantImagesOrRedirect(
  files: File[],
  altValues: string[],
  errorPath: string
) {
  try {
    return await uploadVariantImages(files, altValues);
  } catch (error) {
    redirectWithError(
      errorPath,
      error instanceof Error ? error.message : "Falha ao enviar imagens."
    );
  }
}

function getVariantSelections(formData: FormData): VariantOptionSelection[] {
  const selections: VariantOptionSelection[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("variantOption:") || typeof value !== "string" || !value) {
      continue;
    }

    selections.push({
      characteristicId: key.replace("variantOption:", ""),
      characteristicOptionId: value
    });
  }

  return selections;
}

async function validateVariantSelection(
  productId: string,
  selections: VariantOptionSelection[],
  errorPath: string
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: {
        include: {
          characteristics: {
            orderBy: [{ displayOrder: "asc" }],
            include: {
              characteristic: {
                include: {
                  options: {
                    where: { active: true },
                    orderBy: [{ displayOrder: "asc" }, { name: "asc" }]
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!product) {
    redirectWithError("/admin/produtos", "Produto nao encontrado.");
  }

  const configured = product.category.characteristics;

  if (configured.length === 0) {
    redirectWithError(
      errorPath,
      "Configure caracteristicas na categoria antes de criar variantes."
    );
  }

  const selectedByCharacteristic = new Map(
    selections.map((selection) => [selection.characteristicId, selection])
  );
  const validSelections: VariantOptionSelection[] = [];
  const optionNames: string[] = [];

  for (const config of configured) {
    const selection = selectedByCharacteristic.get(config.characteristicId);

    if (!selection) {
      if (config.required) {
        redirectWithError(
          errorPath,
          `Selecione ${config.characteristic.name} para a variante.`
        );
      }

      continue;
    }

    const option = config.characteristic.options.find(
      (item) => item.id === selection.characteristicOptionId
    );

    if (!option) {
      redirectWithError(errorPath, "Opcao de caracteristica invalida.");
    }

    validSelections.push(selection);
    optionNames.push(option.name);
  }

  if (validSelections.length === 0) {
    redirectWithError(errorPath, "Selecione ao menos uma caracteristica.");
  }

  return {
    product,
    optionNames,
    optionSignature: buildOptionSignature(validSelections),
    selections: validSelections
  };
}

export async function createProductVariantAction(formData: FormData) {
  const productId = getStringValue(formData, "productId");
  const errorPath = `/admin/produtos/${productId}/editar`;
  const selections = getVariantSelections(formData);
  const validated = await validateVariantSelection(productId, selections, errorPath);
  const sku =
    normalizeSku(getStringValue(formData, "sku")) ||
    suggestSku(validated.product.description, validated.optionNames);
  const parsed = productVariantInputSchema.safeParse({
    productId,
    sku,
    active: getCheckboxValue(formData, "active")
  });

  if (!parsed.success) {
    redirectWithError(
      errorPath,
      parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  const files = getImageFiles(formData);

  if (files.length < 1 || files.length > 6) {
    redirectWithError(errorPath, "Envie entre 1 e 6 imagens para o SKU.");
  }

  const uploadedImages = await uploadVariantImagesOrRedirect(
    files,
    getImageAltValues(formData),
    errorPath
  );

  try {
    await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.create({
        data: {
          productId,
          sku: parsed.data.sku,
          optionSignature: validated.optionSignature,
          active: parsed.data.active
        }
      });

      await tx.productVariantValue.createMany({
        data: validated.selections.map((selection) => ({
          productVariantId: variant.id,
          characteristicId: selection.characteristicId,
          characteristicOptionId: selection.characteristicOptionId
        }))
      });

      await tx.productVariantImage.createMany({
        data: uploadedImages.map((image, index) => ({
          productVariantId: variant.id,
          url: image.url,
          publicId: image.publicId,
          altText: image.altText,
          displayOrder: index
        }))
      });
    });
  } catch (error) {
    await cleanupUploadedImages(uploadedImages);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirectWithError(errorPath, "SKU ou combinacao de caracteristicas ja existe.");
    }

    throw error;
  }

  revalidatePath(errorPath);
  revalidatePath("/admin/produtos");
  redirect(errorPath);
}

export async function updateProductVariantAction(formData: FormData) {
  const variantId = getStringValue(formData, "variantId");

  if (!variantId) {
    redirectWithError("/admin/produtos", "SKU invalido.");
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: {
      images: true,
      product: true
    }
  });

  if (!variant) {
    redirectWithError("/admin/produtos", "SKU nao encontrado.");
  }

  const productId = variant.productId;
  const errorPath = `/admin/produtos/${productId}/editar`;
  const selections = getVariantSelections(formData);
  const validated = await validateVariantSelection(productId, selections, errorPath);
  const sku =
    normalizeSku(getStringValue(formData, "sku")) ||
    suggestSku(validated.product.description, validated.optionNames);
  const parsed = productVariantInputSchema.safeParse({
    productId,
    sku,
    active: getCheckboxValue(formData, "active")
  });

  if (!parsed.success) {
    redirectWithError(
      errorPath,
      parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  const removeImageIds = new Set(getRemovedImageIds(formData));
  const remainingImages = variant.images.filter(
    (image) => !removeImageIds.has(image.id)
  );
  const files = getImageFiles(formData);
  const totalImages = remainingImages.length + files.length;

  if (totalImages < 1 || totalImages > 6) {
    redirectWithError(errorPath, "O SKU deve ficar com 1 a 6 imagens.");
  }

  const uploadedImages = await uploadVariantImagesOrRedirect(
    files,
    getImageAltValues(formData),
    errorPath
  );
  const existingImageInputs = getExistingImageInputs(formData);
  const removedImages = variant.images.filter((image) =>
    removeImageIds.has(image.id)
  );

  try {
    await prisma.$transaction(async (tx) => {
      await tx.productVariant.update({
        where: { id: variantId },
        data: {
          sku: parsed.data.sku,
          optionSignature: validated.optionSignature,
          active: parsed.data.active
        }
      });

      await tx.productVariantValue.deleteMany({
        where: { productVariantId: variantId }
      });

      await tx.productVariantValue.createMany({
        data: validated.selections.map((selection) => ({
          productVariantId: variantId,
          characteristicId: selection.characteristicId,
          characteristicOptionId: selection.characteristicOptionId
        }))
      });

      if (removeImageIds.size > 0) {
        await tx.productVariantImage.deleteMany({
          where: {
            id: { in: [...removeImageIds] },
            productVariantId: variantId
          }
        });
      }

      for (const image of existingImageInputs) {
        if (removeImageIds.has(image.id)) {
          continue;
        }

        await tx.productVariantImage.updateMany({
          where: {
            id: image.id,
            productVariantId: variantId
          },
          data: {
            displayOrder: image.displayOrder,
            altText: image.altText
          }
        });
      }

      await tx.productVariantImage.createMany({
        data: uploadedImages.map((image, index) => ({
          productVariantId: variantId,
          url: image.url,
          publicId: image.publicId,
          altText: image.altText,
          displayOrder: remainingImages.length + index
        }))
      });
    });
  } catch (error) {
    await cleanupUploadedImages(uploadedImages);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirectWithError(errorPath, "SKU ou combinacao de caracteristicas ja existe.");
    }

    throw error;
  }

  await Promise.allSettled(
    removedImages.map((image) => deleteCatalogImage(image.publicId))
  );

  revalidatePath(errorPath);
  revalidatePath("/admin/produtos");
  redirect(errorPath);
}

export async function deleteProductVariantAction(formData: FormData) {
  const variantId = getStringValue(formData, "variantId");

  if (!variantId) {
    redirectWithError("/admin/produtos", "SKU invalido.");
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { images: true }
  });

  if (!variant) {
    redirectWithError("/admin/produtos", "SKU nao encontrado.");
  }

  await prisma.productVariant.delete({ where: { id: variantId } });
  await Promise.allSettled(
    variant.images.map((image) => deleteCatalogImage(image.publicId))
  );

  const errorPath = `/admin/produtos/${variant.productId}/editar`;
  revalidatePath(errorPath);
  revalidatePath("/admin/produtos");
  redirect(errorPath);
}