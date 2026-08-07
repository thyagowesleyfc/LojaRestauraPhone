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
import { bannerInputSchema, storeSettingsInputSchema } from "@/schemas/settings";

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

function parseBannerFormData(formData: FormData) {
  return bannerInputSchema.safeParse({
    redirectUrl: getStringValue(formData, "redirectUrl"),
    altText: getStringValue(formData, "altText"),
    displayOrder: getStringValue(formData, "displayOrder") || "0",
    active: getCheckboxValue(formData, "active")
  });
}

function parseStoreSettingsFormData(formData: FormData) {
  return storeSettingsInputSchema.safeParse({
    tradeName: getStringValue(formData, "tradeName"),
    cnpj: getStringValue(formData, "cnpj"),
    phone: getStringValue(formData, "phone"),
    email: getStringValue(formData, "email"),
    address: getStringValue(formData, "address"),
    mapEmbedUrl: getStringValue(formData, "mapEmbedUrl"),
    aboutText: getStringValue(formData, "aboutText"),
    whatsappNumber: getStringValue(formData, "whatsappNumber"),
    whatsappInitialMessage: getStringValue(formData, "whatsappInitialMessage"),
    lightPrimaryColor: getStringValue(formData, "lightPrimaryColor"),
    lightBackgroundColor: getStringValue(formData, "lightBackgroundColor"),
    lightTextColor: getStringValue(formData, "lightTextColor"),
    darkPrimaryColor: getStringValue(formData, "darkPrimaryColor"),
    darkBackgroundColor: getStringValue(formData, "darkBackgroundColor"),
    darkTextColor: getStringValue(formData, "darkTextColor")
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
  if (!image) {
    return;
  }

  await Promise.allSettled([deleteCatalogImage(image.publicId)]);
}

export async function createBannerAction(formData: FormData) {
  const parsed = parseBannerFormData(formData);

  if (!parsed.success) {
    redirectWithError(
      "/admin/banners/novo",
      parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  const image = getImageFile(formData, "image");

  if (!image) {
    redirectWithError("/admin/banners/novo", "Envie a imagem do banner.");
  }

  const uploadedImage = await uploadImageOrRedirect(image, "/admin/banners/novo");

  try {
    await prisma.banner.create({
      data: {
        imageUrl: uploadedImage.url,
        imagePublicId: uploadedImage.publicId,
        redirectUrl: parsed.data.redirectUrl,
        altText: parsed.data.altText,
        displayOrder: parsed.data.displayOrder,
        active: parsed.data.active
      }
    });
  } catch (error) {
    await deleteImageQuietly(uploadedImage);
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}

export async function updateBannerAction(formData: FormData) {
  const id = getStringValue(formData, "id");
  const parsed = parseBannerFormData(formData);

  if (!id || !parsed.success) {
    redirectWithError(
      `/admin/banners/${id}/editar`,
      parsed.success
        ? "Banner invalido."
        : parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  const banner = await prisma.banner.findUnique({ where: { id } });

  if (!banner) {
    redirectWithError("/admin/banners", "Banner nao encontrado.");
  }

  const image = getImageFile(formData, "image");
  const uploadedImage = image
    ? await uploadImageOrRedirect(image, `/admin/banners/${id}/editar`)
    : null;

  try {
    await prisma.banner.update({
      where: { id },
      data: {
        imageUrl: uploadedImage?.url ?? banner.imageUrl,
        imagePublicId: uploadedImage?.publicId ?? banner.imagePublicId,
        redirectUrl: parsed.data.redirectUrl,
        altText: parsed.data.altText,
        displayOrder: parsed.data.displayOrder,
        active: parsed.data.active
      }
    });
  } catch (error) {
    await deleteImageQuietly(uploadedImage);
    throw error;
  }

  if (uploadedImage) {
    await deleteImageQuietly({
      url: banner.imageUrl,
      publicId: banner.imagePublicId
    });
  }

  revalidatePath("/");
  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}

export async function deleteBannerAction(formData: FormData) {
  const id = getStringValue(formData, "id");

  if (!id) {
    redirectWithError("/admin/banners", "Banner invalido.");
  }

  const banner = await prisma.banner.findUnique({ where: { id } });

  if (!banner) {
    redirectWithError("/admin/banners", "Banner nao encontrado.");
  }

  await prisma.banner.delete({ where: { id } });
  await deleteImageQuietly({
    url: banner.imageUrl,
    publicId: banner.imagePublicId
  });

  revalidatePath("/");
  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}

export async function updateStoreSettingsAction(formData: FormData) {
  const parsed = parseStoreSettingsFormData(formData);

  if (!parsed.success) {
    redirectWithError(
      "/admin/configuracoes",
      parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  const currentSettings = await prisma.storeSettings.findUnique({
    where: { id: 1 }
  });
  const logo = getImageFile(formData, "logo");
  const uploadedLogo = logo
    ? await uploadImageOrRedirect(logo, "/admin/configuracoes")
    : null;

  try {
    await prisma.storeSettings.upsert({
      where: { id: 1 },
      update: {
        ...parsed.data,
        logoUrl: uploadedLogo?.url ?? currentSettings?.logoUrl,
        logoPublicId: uploadedLogo?.publicId ?? currentSettings?.logoPublicId
      },
      create: {
        id: 1,
        ...parsed.data,
        logoUrl: uploadedLogo?.url,
        logoPublicId: uploadedLogo?.publicId
      }
    });
  } catch (error) {
    await deleteImageQuietly(uploadedLogo);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirectWithError("/admin/configuracoes", "Configuracao duplicada.");
    }

    throw error;
  }

  if (uploadedLogo && currentSettings?.logoPublicId) {
    await deleteImageQuietly({
      url: currentSettings.logoUrl ?? "",
      publicId: currentSettings.logoPublicId
    });
  }

  revalidatePath("/");
  revalidatePath("/quem-somos");
  revalidatePath("/admin/configuracoes");
  redirect("/admin/configuracoes");
}
