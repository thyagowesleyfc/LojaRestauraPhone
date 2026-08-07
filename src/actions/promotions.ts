"use server";

import { Prisma, PromotionType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  deleteCatalogImage,
  uploadCatalogImage,
  type UploadedImage
} from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import {
  promotionImageAltSchema,
  promotionInputSchema,
  type PromotionInput
} from "@/schemas/promotions";

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
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function getImageAltValues(formData: FormData) {
  return formData
    .getAll("imageAlt")
    .map((value) => (typeof value === "string" ? value : ""));
}

function getRemovedImageIds(formData: FormData) {
  return formData
    .getAll("removeImageId")
    .filter(
      (value): value is string =>
        typeof value === "string" && value.length > 0
    );
}

function getExistingImageInputs(formData: FormData): ImageOrderInput[] {
  const imageInputs: ImageOrderInput[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("imageOrder:") || typeof value !== "string") {
      continue;
    }

    const id = key.replace("imageOrder:", "");
    const displayOrder = Number.parseInt(value, 10);
    const altValue = formData.get(`imageAlt:${id}`);
    const parsedAlt = promotionImageAltSchema.safeParse(
      typeof altValue === "string" ? altValue : ""
    );

    if (!id || Number.isNaN(displayOrder) || !parsedAlt.success) {
      continue;
    }

    imageInputs.push({
      id,
      displayOrder,
      altText: parsedAlt.data
    });
  }

  return imageInputs;
}

function parsePromotionFormData(formData: FormData) {
  return promotionInputSchema.safeParse({
    type: getStringValue(formData, "type"),
    description: getStringValue(formData, "description"),
    categoryId: getStringValue(formData, "categoryId"),
    percentage: getStringValue(formData, "percentage") || undefined,
    comboPrice:
      getStringValue(formData, "comboPrice").replace(",", ".") || undefined,
    productIds: formData
      .getAll("productId")
      .filter((value): value is string => typeof value === "string"),
    active: getCheckboxValue(formData, "active"),
    startsAt: getStringValue(formData, "startsAt"),
    endsAt: getStringValue(formData, "endsAt")
  });
}

function getPriceInCents(price: number) {
  return Math.round(price * 100);
}

async function getUniquePromotionSlug(description: string, currentId?: string) {
  const baseSlug = slugify(description) || "promocao";
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await prisma.promotion.findUnique({ where: { slug } });

    if (!existing || existing.id === currentId) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function uploadPromotionImages(files: File[], altValues: string[]) {
  const uploadedImages: Array<UploadedImage & { altText?: string }> = [];

  for (const [index, file] of files.entries()) {
    const uploaded = await uploadCatalogImage(file);
    const parsedAlt = promotionImageAltSchema.parse(altValues[index] ?? "");

    uploadedImages.push({
      ...uploaded,
      altText: parsedAlt
    });
  }

  return uploadedImages;
}

async function uploadPromotionImagesOrRedirect(
  files: File[],
  altValues: string[],
  errorPath: string
) {
  try {
    return await uploadPromotionImages(files, altValues);
  } catch (error) {
    redirectWithError(
      errorPath,
      error instanceof Error ? error.message : "Falha ao enviar imagens."
    );
  }
}

async function cleanupUploadedImages(images: UploadedImage[]) {
  await Promise.allSettled(
    images.map((image) => deleteCatalogImage(image.publicId))
  );
}

function getPromotionData(parsed: PromotionInput) {
  if (parsed.type === PromotionType.CATEGORY_PERCENTAGE) {
    return {
      type: parsed.type,
      description: parsed.description,
      categoryId: parsed.categoryId ?? null,
      percentage: parsed.percentage ?? null,
      comboPriceInCents: null,
      active: parsed.active,
      startsAt: parsed.startsAt,
      endsAt: parsed.endsAt
    };
  }

  return {
    type: parsed.type,
    description: parsed.description,
    categoryId: null,
    percentage: null,
    comboPriceInCents: getPriceInCents(parsed.comboPrice ?? 0),
    active: parsed.active,
    startsAt: parsed.startsAt,
    endsAt: parsed.endsAt
  };
}

export async function createPromotionAction(formData: FormData) {
  const parsed = parsePromotionFormData(formData);

  if (!parsed.success) {
    redirectWithError(
      "/admin/promocoes/nova",
      parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  const files = getImageFiles(formData);

  if (files.length < 1 || files.length > 6) {
    redirectWithError(
      "/admin/promocoes/nova",
      "Envie entre 1 e 6 imagens da promocao."
    );
  }

  const slug = await getUniquePromotionSlug(parsed.data.description);
  const uploadedImages = await uploadPromotionImagesOrRedirect(
    files,
    getImageAltValues(formData),
    "/admin/promocoes/nova"
  );

  try {
    await prisma.$transaction(async (tx) => {
      const promotion = await tx.promotion.create({
        data: {
          ...getPromotionData(parsed.data),
          slug
        }
      });

      if (parsed.data.type === PromotionType.PRODUCT_COMBO) {
        await tx.promotionProduct.createMany({
          data: [...new Set(parsed.data.productIds)].map(
            (productId, index) => ({
              promotionId: promotion.id,
              productId,
              displayOrder: index
            })
          )
        });
      }

      await tx.promotionImage.createMany({
        data: uploadedImages.map((image, index) => ({
          promotionId: promotion.id,
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
      redirectWithError("/admin/promocoes/nova", "Promocao ja cadastrada.");
    }

    throw error;
  }

  revalidatePath("/");
  revalidatePath("/promocoes");
  revalidatePath("/categorias");
  revalidatePath("/admin/promocoes");
  redirect("/admin/promocoes");
}

export async function updatePromotionAction(formData: FormData) {
  const id = getStringValue(formData, "id");
  const parsed = parsePromotionFormData(formData);

  if (!id || !parsed.success) {
    redirectWithError(
      `/admin/promocoes/${id}/editar`,
      parsed.success
        ? "Promocao invalida."
        : parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  const promotion = await prisma.promotion.findUnique({
    where: { id },
    include: {
      images: true
    }
  });

  if (!promotion) {
    redirectWithError("/admin/promocoes", "Promocao nao encontrada.");
  }

  const removeImageIds = new Set(getRemovedImageIds(formData));
  const remainingImages = promotion.images.filter(
    (image) => !removeImageIds.has(image.id)
  );
  const files = getImageFiles(formData);
  const totalImages = remainingImages.length + files.length;

  if (totalImages < 1 || totalImages > 6) {
    redirectWithError(
      `/admin/promocoes/${id}/editar`,
      "A promocao deve ficar com 1 a 6 imagens."
    );
  }

  const slug = await getUniquePromotionSlug(parsed.data.description, id);
  const uploadedImages = await uploadPromotionImagesOrRedirect(
    files,
    getImageAltValues(formData),
    `/admin/promocoes/${id}/editar`
  );
  const existingImageInputs = getExistingImageInputs(formData);
  const removedImages = promotion.images.filter((image) =>
    removeImageIds.has(image.id)
  );

  try {
    await prisma.$transaction(async (tx) => {
      await tx.promotion.update({
        where: { id },
        data: {
          ...getPromotionData(parsed.data),
          slug
        }
      });

      await tx.promotionProduct.deleteMany({
        where: { promotionId: id }
      });

      if (parsed.data.type === PromotionType.PRODUCT_COMBO) {
        await tx.promotionProduct.createMany({
          data: [...new Set(parsed.data.productIds)].map(
            (productId, index) => ({
              promotionId: id,
              productId,
              displayOrder: index
            })
          )
        });
      }

      if (removeImageIds.size > 0) {
        await tx.promotionImage.deleteMany({
          where: {
            id: { in: [...removeImageIds] },
            promotionId: id
          }
        });
      }

      for (const image of existingImageInputs) {
        if (removeImageIds.has(image.id)) {
          continue;
        }

        await tx.promotionImage.updateMany({
          where: {
            id: image.id,
            promotionId: id
          },
          data: {
            displayOrder: image.displayOrder,
            altText: image.altText
          }
        });
      }

      await tx.promotionImage.createMany({
        data: uploadedImages.map((image, index) => ({
          promotionId: id,
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
      redirectWithError(
        `/admin/promocoes/${id}/editar`,
        "Promocao ja cadastrada."
      );
    }

    throw error;
  }

  await Promise.allSettled(
    removedImages.map((image) => deleteCatalogImage(image.publicId))
  );

  revalidatePath("/");
  revalidatePath("/promocoes");
  revalidatePath(`/promocoes/${promotion.slug}`);
  revalidatePath(`/promocoes/${slug}`);
  revalidatePath("/categorias");
  revalidatePath("/admin/promocoes");
  redirect("/admin/promocoes");
}

export async function deletePromotionAction(formData: FormData) {
  const id = getStringValue(formData, "id");

  if (!id) {
    redirectWithError("/admin/promocoes", "Promocao invalida.");
  }

  const promotion = await prisma.promotion.findUnique({
    where: { id },
    include: {
      images: true
    }
  });

  if (!promotion) {
    redirectWithError("/admin/promocoes", "Promocao nao encontrada.");
  }

  await prisma.promotion.delete({ where: { id } });
  await Promise.allSettled(
    promotion.images.map((image) => deleteCatalogImage(image.publicId))
  );

  revalidatePath("/");
  revalidatePath("/promocoes");
  revalidatePath(`/promocoes/${promotion.slug}`);
  revalidatePath("/categorias");
  revalidatePath("/admin/promocoes");
  redirect("/admin/promocoes");
}
