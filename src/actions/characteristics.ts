"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import {
  categoryCharacteristicInputSchema,
  characteristicInputSchema,
  characteristicOptionInputSchema
} from "@/schemas/catalog";

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

function parseCharacteristicFormData(formData: FormData) {
  const name = getStringValue(formData, "name");

  return characteristicInputSchema.safeParse({
    name,
    slug: getStringValue(formData, "slug") || slugify(name),
    displayOrder: getStringValue(formData, "displayOrder") || "0",
    active: getCheckboxValue(formData, "active")
  });
}

function parseExistingOptions(formData: FormData) {
  const options = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("optionName:") || typeof value !== "string") {
      continue;
    }

    const id = key.replace("optionName:", "");
    const parsed = characteristicOptionInputSchema.safeParse({
      id,
      name: value,
      slug: getStringValue(formData, `optionSlug:${id}`),
      displayOrder: getStringValue(formData, `optionOrder:${id}`) || "0",
      active: getCheckboxValue(formData, `optionActive:${id}`)
    });

    if (!parsed.success) {
      return parsed;
    }

    options.push(parsed.data);
  }

  return characteristicOptionInputSchema.array().safeParse(options);
}

function parseNewOptions(formData: FormData) {
  const names = formData.getAll("newOptionName");
  const slugs = formData.getAll("newOptionSlug");
  const orders = formData.getAll("newOptionOrder");
  const activeValues = new Set(
    formData
      .getAll("newOptionActive")
      .filter((value): value is string => typeof value === "string")
  );
  const options = [];

  for (const [index, value] of names.entries()) {
    const name = typeof value === "string" ? value.trim() : "";

    if (!name) {
      continue;
    }

    const slugValue = slugs[index];
    const orderValue = orders[index];
    const parsed = characteristicOptionInputSchema.safeParse({
      name,
      slug:
        (typeof slugValue === "string" && slugValue.trim()) || slugify(name),
      displayOrder:
        (typeof orderValue === "string" && orderValue.trim()) || `${index}`,
      active: activeValues.has(`${index}`)
    });

    if (!parsed.success) {
      return parsed;
    }

    options.push(parsed.data);
  }

  return characteristicOptionInputSchema.array().safeParse(options);
}

function getRemovedOptionIds(formData: FormData) {
  return formData
    .getAll("removeOptionId")
    .filter(
      (value): value is string => typeof value === "string" && value.length > 0
    );
}

function parseCategoryCharacteristicInputs(formData: FormData) {
  const inputs = [];

  for (const characteristicId of formData.getAll("characteristicId")) {
    if (typeof characteristicId !== "string" || !characteristicId) {
      continue;
    }

    const parsed = categoryCharacteristicInputSchema.safeParse({
      characteristicId,
      displayOrder:
        getStringValue(formData, `categoryCharacteristicOrder:${characteristicId}`) ||
        "0",
      required: getCheckboxValue(
        formData,
        `categoryCharacteristicRequired:${characteristicId}`
      )
    });

    if (!parsed.success) {
      return parsed;
    }

    inputs.push(parsed.data);
  }

  return categoryCharacteristicInputSchema.array().safeParse(inputs);
}

export async function createCharacteristicAction(formData: FormData) {
  const parsed = parseCharacteristicFormData(formData);
  const newOptions = parseNewOptions(formData);

  if (!parsed.success) {
    redirectWithError(
      "/admin/caracteristicas/nova",
      parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  if (!newOptions.success) {
    redirectWithError(
      "/admin/caracteristicas/nova",
      newOptions.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  try {
    await prisma.characteristic.create({
      data: {
        ...parsed.data,
        options: {
          create: newOptions.data.map((option) => ({
            name: option.name,
            slug: option.slug,
            displayOrder: option.displayOrder,
            active: option.active
          }))
        }
      }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirectWithError(
        "/admin/caracteristicas/nova",
        "Caracteristica ou opcao ja cadastrada."
      );
    }

    throw error;
  }

  revalidatePath("/admin/caracteristicas");
  redirect("/admin/caracteristicas");
}

export async function updateCharacteristicAction(formData: FormData) {
  const id = getStringValue(formData, "id");
  const errorPath = `/admin/caracteristicas/${id}/editar`;
  const parsed = parseCharacteristicFormData(formData);
  const existingOptions = parseExistingOptions(formData);
  const newOptions = parseNewOptions(formData);
  const removedOptionIds = getRemovedOptionIds(formData);

  if (!id || !parsed.success || !existingOptions.success || !newOptions.success) {
    redirectWithError(
      errorPath,
      !parsed.success
        ? parsed.error.issues[0]?.message ?? "Dados invalidos."
        : !existingOptions.success
          ? existingOptions.error.issues[0]?.message ?? "Dados invalidos."
          : !newOptions.success
            ? newOptions.error.issues[0]?.message ?? "Dados invalidos."
            : "Caracteristica invalida."
    );
  }

  if (removedOptionIds.length > 0) {
    const usedOptions = await prisma.productVariantValue.count({
      where: { characteristicOptionId: { in: removedOptionIds } }
    });

    if (usedOptions > 0) {
      redirectWithError(
        errorPath,
        "Nao remova opcoes ja usadas por variantes. Inative a opcao."
      );
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.characteristic.update({
        where: { id },
        data: parsed.data
      });

      if (removedOptionIds.length > 0) {
        await tx.characteristicOption.deleteMany({
          where: {
            id: { in: removedOptionIds },
            characteristicId: id
          }
        });
      }

      for (const option of existingOptions.data) {
        if (!option.id || removedOptionIds.includes(option.id)) {
          continue;
        }

        await tx.characteristicOption.updateMany({
          where: { id: option.id, characteristicId: id },
          data: {
            name: option.name,
            slug: option.slug,
            displayOrder: option.displayOrder,
            active: option.active
          }
        });
      }

      if (newOptions.data.length > 0) {
        await tx.characteristicOption.createMany({
          data: newOptions.data.map((option) => ({
            characteristicId: id,
            name: option.name,
            slug: option.slug,
            displayOrder: option.displayOrder,
            active: option.active
          }))
        });
      }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      redirectWithError(errorPath, "Caracteristica ou opcao ja cadastrada.");
    }

    throw error;
  }

  revalidatePath("/admin/caracteristicas");
  revalidatePath(errorPath);
  redirect("/admin/caracteristicas");
}

export async function deleteCharacteristicAction(formData: FormData) {
  const id = getStringValue(formData, "id");

  if (!id) {
    redirectWithError("/admin/caracteristicas", "Caracteristica invalida.");
  }

  const characteristic = await prisma.characteristic.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          categories: true,
          options: true,
          values: true
        }
      }
    }
  });

  if (!characteristic) {
    redirectWithError("/admin/caracteristicas", "Caracteristica nao encontrada.");
  }

  if (
    characteristic._count.categories > 0 ||
    characteristic._count.options > 0 ||
    characteristic._count.values > 0
  ) {
    await prisma.characteristic.update({
      where: { id },
      data: { active: false }
    });
  } else {
    await prisma.characteristic.delete({ where: { id } });
  }

  revalidatePath("/admin/caracteristicas");
  redirect("/admin/caracteristicas");
}

export async function updateCategoryCharacteristicsAction(formData: FormData) {
  const categoryId = getStringValue(formData, "categoryId");
  const errorPath = `/admin/categorias/${categoryId}/editar`;
  const parsed = parseCategoryCharacteristicInputs(formData);

  if (!categoryId || !parsed.success) {
    redirectWithError(
      errorPath,
      parsed.success
        ? "Categoria invalida."
        : parsed.error.issues[0]?.message ?? "Dados invalidos."
    );
  }

  const current = await prisma.categoryCharacteristic.findMany({
    where: { categoryId },
    select: { characteristicId: true }
  });
  const nextIds = new Set(parsed.data.map((item) => item.characteristicId));
  const removedIds = current
    .map((item) => item.characteristicId)
    .filter((id) => !nextIds.has(id));

  if (removedIds.length > 0) {
    const usedValues = await prisma.productVariantValue.count({
      where: {
        characteristicId: { in: removedIds },
        productVariant: { product: { categoryId } }
      }
    });

    if (usedValues > 0) {
      redirectWithError(
        errorPath,
        "Nao remova caracteristicas ja usadas por variantes desta categoria."
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.categoryCharacteristic.deleteMany({
      where: {
        categoryId,
        characteristicId: { notIn: parsed.data.map((item) => item.characteristicId) }
      }
    });

    for (const item of parsed.data) {
      await tx.categoryCharacteristic.upsert({
        where: {
          categoryId_characteristicId: {
            categoryId,
            characteristicId: item.characteristicId
          }
        },
        create: {
          categoryId,
          characteristicId: item.characteristicId,
          displayOrder: item.displayOrder,
          required: item.required
        },
        update: {
          displayOrder: item.displayOrder,
          required: item.required
        }
      });
    }
  });

  revalidatePath(errorPath);
  revalidatePath("/admin/categorias");
  redirect(errorPath);
}