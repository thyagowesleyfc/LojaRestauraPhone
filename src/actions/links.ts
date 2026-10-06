"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  deleteCatalogImage,
  uploadCatalogImage,
  type UploadedImage
} from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { storeLinkInputSchema } from "@/schemas/links";

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

function getImageFile(formData: FormData, name: string) {
  const value = formData.get(name);
  return value instanceof File && value.size > 0 ? value : null;
}

function parseStoreLinkFormData(formData: FormData) {
  return storeLinkInputSchema.safeParse({
    title: getStringValue(formData, "title"),
    description: getStringValue(formData, "description"),
    redirectUrl: getStringValue(formData, "redirectUrl"),
    displayOrder: getStringValue(formData, "displayOrder") || "0",
    active: getCheckboxValue(formData, "active")
  });
}

async function uploadImageOrRedirect(file: File, errorPath: string) {
  try {
    return await uploadCatalogImage(file);
  } catch (error) {
    redirectWithError(
      errorPath,
      error instanceof Error ? error.message : "Falha ao enviar imagem."
    );
  }
}

async function deleteImageQuietly(image: UploadedImage | null) {
  if (!image?.publicId) {
    return;
  }

  await Promise.allSettled([deleteCatalogImage(image.publicId)]);
}

export async function createStoreLinkAction(formData: FormData) {
  const parsed = parseStoreLinkFormData(formData);

  if (!parsed.success) {
    redirectWithError(
      "/admin/links/novo",
      parsed.error.issues[0]?.message ?? "Dados inválidos."
    );
  }

  const image = getImageFile(formData, "image");
  const uploadedImage = image
    ? await uploadImageOrRedirect(image, "/admin/links/novo")
    : null;

  try {
    await prisma.storeLink.create({
      data: {
        ...parsed.data,
        imageUrl: uploadedImage?.url,
        imagePublicId: uploadedImage?.publicId
      }
    });
  } catch (error) {
    await deleteImageQuietly(uploadedImage);
    throw error;
  }

  revalidatePath("/links");
  revalidatePath("/admin/links");
  redirect("/admin/links");
}

export async function updateStoreLinkAction(formData: FormData) {
  const id = getStringValue(formData, "id");
  const parsed = parseStoreLinkFormData(formData);

  if (!id || !parsed.success) {
    redirectWithError(
      `/admin/links/${id}/editar`,
      parsed.success
        ? "Link inválido."
        : parsed.error.issues[0]?.message ?? "Dados inválidos."
    );
  }

  const link = await prisma.storeLink.findUnique({ where: { id } });

  if (!link) {
    redirectWithError("/admin/links", "Link não encontrado.");
  }

  const image = getImageFile(formData, "image");
  const uploadedImage = image
    ? await uploadImageOrRedirect(image, `/admin/links/${id}/editar`)
    : null;

  try {
    await prisma.storeLink.update({
      where: { id },
      data: {
        ...parsed.data,
        imageUrl: uploadedImage?.url ?? link.imageUrl,
        imagePublicId: uploadedImage?.publicId ?? link.imagePublicId
      }
    });
  } catch (error) {
    await deleteImageQuietly(uploadedImage);
    throw error;
  }

  if (uploadedImage && link.imagePublicId) {
    await deleteImageQuietly({
      url: link.imageUrl ?? "",
      publicId: link.imagePublicId
    });
  }

  revalidatePath("/links");
  revalidatePath("/admin/links");
  redirect("/admin/links");
}

export async function deleteStoreLinkAction(formData: FormData) {
  const id = getStringValue(formData, "id");

  if (!id) {
    redirectWithError("/admin/links", "Link inválido.");
  }

  const link = await prisma.storeLink.findUnique({ where: { id } });

  if (!link) {
    redirectWithError("/admin/links", "Link não encontrado.");
  }

  await prisma.storeLink.delete({ where: { id } });
  await deleteImageQuietly(
    link.imagePublicId
      ? {
          url: link.imageUrl ?? "",
          publicId: link.imagePublicId
        }
      : null
  );

  revalidatePath("/links");
  revalidatePath("/admin/links");
  redirect("/admin/links");
}