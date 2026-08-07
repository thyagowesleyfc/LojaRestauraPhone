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
    bannerTransitionSeconds:
      getStringValue(formData, "bannerTransitionSeconds") || "5",
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
  if (!image?.publicId) {
    return;
  }

  await Promise.allSettled([deleteCatalogImage(image.publicId)]);
}

async function uploadRequiredBannerImages(formData: FormData, errorPath: string) {
  const desktopImage = getImageFile(formData, "desktopImage");
  const mobileImage = getImageFile(formData, "mobileImage");

  if (!desktopImage) {
    redirectWithError(errorPath, "Envie a imagem desktop do banner.");
  }

  if (!mobileImage) {
    redirectWithError(errorPath, "Envie a imagem mobile do banner.");
  }

  let uploadedDesktop: UploadedImage | null = null;

  try {
    uploadedDesktop = await uploadCatalogImage(desktopImage);
    const uploadedMobile = await uploadCatalogImage(mobileImage);

    return {
      desktop: uploadedDesktop,
      mobile: uploadedMobile
    };
  } catch (error) {
    await deleteImageQuietly(uploadedDesktop);
    redirectWithError(
      errorPath,
      error instanceof Error ? error.message : "Falha ao enviar imagens."
    );
  }
}

export async function createBannerAction(formData: FormData) {
  const parsed = parseBannerFormData(formData);

  if (!parsed.success) {
    redirectWithError(
      "/admin/banners/novo",
      parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  const uploadedImages = await uploadRequiredBannerImages(
    formData,
    "/admin/banners/novo"
  );

  try {
    await prisma.banner.create({
      data: {
        imageUrl: uploadedImages.desktop.url,
        imagePublicId: uploadedImages.desktop.publicId,
        mobileImageUrl: uploadedImages.mobile.url,
        mobileImagePublicId: uploadedImages.mobile.publicId,
        redirectUrl: parsed.data.redirectUrl,
        altText: parsed.data.altText,
        displayOrder: parsed.data.displayOrder,
        active: parsed.data.active
      }
    });
  } catch (error) {
    await Promise.all([
      deleteImageQuietly(uploadedImages.desktop),
      deleteImageQuietly(uploadedImages.mobile)
    ]);
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

  const desktopImage = getImageFile(formData, "desktopImage");
  const mobileImage = getImageFile(formData, "mobileImage");
  const uploadedDesktop = desktopImage
    ? await uploadImageOrRedirect(desktopImage, `/admin/banners/${id}/editar`)
    : null;
  const uploadedMobile = mobileImage
    ? await uploadImageOrRedirect(mobileImage, `/admin/banners/${id}/editar`)
    : null;

  try {
    await prisma.banner.update({
      where: { id },
      data: {
        imageUrl: uploadedDesktop?.url ?? banner.imageUrl,
        imagePublicId: uploadedDesktop?.publicId ?? banner.imagePublicId,
        mobileImageUrl: uploadedMobile?.url ?? banner.mobileImageUrl,
        mobileImagePublicId:
          uploadedMobile?.publicId ?? banner.mobileImagePublicId,
        redirectUrl: parsed.data.redirectUrl,
        altText: parsed.data.altText,
        displayOrder: parsed.data.displayOrder,
        active: parsed.data.active
      }
    });
  } catch (error) {
    await Promise.all([
      deleteImageQuietly(uploadedDesktop),
      deleteImageQuietly(uploadedMobile)
    ]);
    throw error;
  }

  if (uploadedDesktop) {
    await deleteImageQuietly({
      url: banner.imageUrl,
      publicId: banner.imagePublicId
    });
  }

  if (uploadedMobile && banner.mobileImagePublicId) {
    await deleteImageQuietly({
      url: banner.mobileImageUrl ?? "",
      publicId: banner.mobileImagePublicId
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
  await Promise.all([
    deleteImageQuietly({
      url: banner.imageUrl,
      publicId: banner.imagePublicId
    }),
    deleteImageQuietly(
      banner.mobileImagePublicId
        ? {
            url: banner.mobileImageUrl ?? "",
            publicId: banner.mobileImagePublicId
          }
        : null
    )
  ]);

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