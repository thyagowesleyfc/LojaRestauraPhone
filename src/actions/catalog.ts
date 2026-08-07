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
import { slugify } from "@/lib/slug";
import {
  categoryInputSchema,
  productImageAltSchema,
  productInputSchema
} from "@/schemas/catalog";

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
    .filter((value): value is string => typeof value === "string" && value.length > 0);
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
    const parsedAlt = productImageAltSchema.safeParse(
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

async function getUniqueCategorySlug(name: string, currentId?: string) {
  const baseSlug = slugify(name) || "categoria";
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } });

    if (!existing || existing.id === currentId) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function getUniqueProductSlug(description: string, currentId?: string) {
  const baseSlug = slugify(description) || "produto";
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });

    if (!existing || existing.id === currentId) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function parseCategoryFormData(formData: FormData) {
  return categoryInputSchema.safeParse({
    name: getStringValue(formData, "name"),
    displayOrder: getStringValue(formData, "displayOrder") || "0",
    active: getCheckboxValue(formData, "active")
  });
}

function parseProductFormData(formData: FormData) {
  return productInputSchema.safeParse({
    description: getStringValue(formData, "description"),
    specification: getStringValue(formData, "specification"),
    categoryId: getStringValue(formData, "categoryId"),
    price: getStringValue(formData, "price").replace(",", "."),
    active: getCheckboxValue(formData, "active")
  });
}

function getPriceInCents(price: number) {
  return Math.round(price * 100);
}

async function uploadProductImages(files: File[], altValues: string[]) {
  const uploadedImages: Array<UploadedImage & { altText?: string }> = [];

  for (const [index, file] of files.entries()) {
    const uploaded = await uploadCatalogImage(file);
    const parsedAlt = productImageAltSchema.parse(altValues[index] ?? "");

    uploadedImages.push({
      ...uploaded,
      altText: parsedAlt
    });
  }

  return uploadedImages;
}

async function cleanupUploadedImages(images: UploadedImage[]) {
  await Promise.allSettled(
    images.map((image) => deleteCatalogImage(image.publicId))
  );
}

async function uploadProductImagesOrRedirect(
  files: File[],
  altValues: string[],
  errorPath: string
) {
  try {
    return await uploadProductImages(files, altValues);
  } catch (error) {
    redirectWithError(
      errorPath,
      error instanceof Error ? error.message : "Falha ao enviar imagens."
    );
  }
}

export async function createCategoryAction(formData: FormData) {
  const parsed = parseCategoryFormData(formData);

  if (!parsed.success) {
    redirectWithError(
      "/admin/categorias/nova",
      parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  const slug = await getUniqueCategorySlug(parsed.data.name);

  try {
    await prisma.category.create({
      data: {
        ...parsed.data,
        slug
      }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirectWithError("/admin/categorias/nova", "Categoria ja cadastrada.");
    }

    throw error;
  }

  revalidatePath("/");
  revalidatePath("/categorias");
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function updateCategoryAction(formData: FormData) {
  const id = getStringValue(formData, "id");
  const parsed = parseCategoryFormData(formData);

  if (!id || !parsed.success) {
    redirectWithError(
      `/admin/categorias/${id}/editar`,
      parsed.success
        ? "Categoria invalida."
        : parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  const slug = await getUniqueCategorySlug(parsed.data.name, id);

  try {
    await prisma.category.update({
      where: { id },
      data: {
        ...parsed.data,
        slug
      }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirectWithError(
        `/admin/categorias/${id}/editar`,
        "Categoria ja cadastrada."
      );
    }

    throw error;
  }

  revalidatePath("/");
  revalidatePath("/categorias");
  revalidatePath(`/categorias/${slug}`);
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function deleteCategoryAction(formData: FormData) {
  const id = getStringValue(formData, "id");

  if (!id) {
    redirectWithError("/admin/categorias", "Categoria invalida.");
  }

  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      slug: true,
      _count: {
        select: {
          products: true,
          promotions: true
        }
      }
    }
  });

  if (!category) {
    redirectWithError("/admin/categorias", "Categoria nao encontrada.");
  }

  if (category._count.products > 0 || category._count.promotions > 0) {
    await prisma.category.update({
      where: { id },
      data: { active: false }
    });
  } else {
    await prisma.category.delete({ where: { id } });
  }

  revalidatePath("/");
  revalidatePath("/categorias");
  revalidatePath(`/categorias/${category.slug}`);
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function createProductAction(formData: FormData) {
  const parsed = parseProductFormData(formData);

  if (!parsed.success) {
    redirectWithError(
      "/admin/produtos/novo",
      parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  const files = getImageFiles(formData);

  if (files.length < 1 || files.length > 6) {
    redirectWithError(
      "/admin/produtos/novo",
      "Envie entre 1 e 6 imagens do produto."
    );
  }

  const slug = await getUniqueProductSlug(parsed.data.description);
  const uploadedImages = await uploadProductImagesOrRedirect(
    files,
    getImageAltValues(formData),
    "/admin/produtos/novo"
  );

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          categoryId: parsed.data.categoryId,
          description: parsed.data.description,
          specification: parsed.data.specification,
          slug,
          priceInCents: getPriceInCents(parsed.data.price),
          active: parsed.data.active
        }
      });

      await tx.productImage.createMany({
        data: uploadedImages.map((image, index) => ({
          productId: product.id,
          url: image.url,
          publicId: image.publicId,
          altText: image.altText,
          displayOrder: index
        }))
      });
    });
  } catch (error) {
    await cleanupUploadedImages(uploadedImages);
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/categorias");
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export async function updateProductAction(formData: FormData) {
  const id = getStringValue(formData, "id");
  const parsed = parseProductFormData(formData);

  if (!id || !parsed.success) {
    redirectWithError(
      `/admin/produtos/${id}/editar`,
      parsed.success
        ? "Produto invalido."
        : parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true }
  });

  if (!product) {
    redirectWithError("/admin/produtos", "Produto nao encontrado.");
  }

  const removeImageIds = new Set(getRemovedImageIds(formData));
  const remainingImages = product.images.filter(
    (image) => !removeImageIds.has(image.id)
  );
  const files = getImageFiles(formData);
  const totalImages = remainingImages.length + files.length;

  if (totalImages < 1 || totalImages > 6) {
    redirectWithError(
      `/admin/produtos/${id}/editar`,
      "O produto deve ficar com 1 a 6 imagens."
    );
  }

  const slug = await getUniqueProductSlug(parsed.data.description, id);
  const uploadedImages = await uploadProductImagesOrRedirect(
    files,
    getImageAltValues(formData),
    `/admin/produtos/${id}/editar`
  );
  const existingImageInputs = getExistingImageInputs(formData);
  const removedImages = product.images.filter((image) =>
    removeImageIds.has(image.id)
  );

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          categoryId: parsed.data.categoryId,
          description: parsed.data.description,
          specification: parsed.data.specification,
          slug,
          priceInCents: getPriceInCents(parsed.data.price),
          active: parsed.data.active
        }
      });

      if (removeImageIds.size > 0) {
        await tx.productImage.deleteMany({
          where: {
            id: { in: [...removeImageIds] },
            productId: id
          }
        });
      }

      for (const image of existingImageInputs) {
        if (removeImageIds.has(image.id)) {
          continue;
        }

        await tx.productImage.updateMany({
          where: {
            id: image.id,
            productId: id
          },
          data: {
            displayOrder: image.displayOrder,
            altText: image.altText
          }
        });
      }

      await tx.productImage.createMany({
        data: uploadedImages.map((image, index) => ({
          productId: id,
          url: image.url,
          publicId: image.publicId,
          altText: image.altText,
          displayOrder: remainingImages.length + index
        }))
      });
    });
  } catch (error) {
    await cleanupUploadedImages(uploadedImages);
    throw error;
  }

  await Promise.allSettled(
    removedImages.map((image) => deleteCatalogImage(image.publicId))
  );

  revalidatePath("/");
  revalidatePath("/categorias");
  revalidatePath(`/produtos/${product.slug}`);
  revalidatePath(`/produtos/${slug}`);
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export async function deleteProductAction(formData: FormData) {
  const id = getStringValue(formData, "id");

  if (!id) {
    redirectWithError("/admin/produtos", "Produto invalido.");
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      _count: {
        select: {
          promotions: true
        }
      }
    }
  });

  if (!product) {
    redirectWithError("/admin/produtos", "Produto nao encontrado.");
  }

  if (product._count.promotions > 0) {
    await prisma.product.update({
      where: { id },
      data: { active: false }
    });
  } else {
    await prisma.product.delete({ where: { id } });
    await Promise.allSettled(
      product.images.map((image) => deleteCatalogImage(image.publicId))
    );
  }

  revalidatePath("/");
  revalidatePath("/categorias");
  revalidatePath(`/produtos/${product.slug}`);
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}
