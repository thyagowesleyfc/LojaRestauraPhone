"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getNextDisplayOrder, getUniqueSlug, slugify } from "@/lib/slug";
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
      slug:
        getStringValue(formData, `optionSlug:${id}`) || slugify(value),
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

async function getUniqueCharacteristicSlug(name: string, currentId?: string) {
  const baseSlug = slugify(name) || "caracteristica";
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await prisma.characteristic.findUnique({
      where: { slug }
    });

    if (!existing || existing.id === currentId) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function getNextCharacteristicDisplayOrder() {
  const lastCharacteristic = await prisma.characteristic.findFirst({
    orderBy: { displayOrder: "desc" },
    select: { displayOrder: true }
  });

  return getNextDisplayOrder(lastCharacteristic?.displayOrder);
}

export async function createCharacteristicAction(formData: FormData) {
  const parsed = parseCharacteristicFormData(formData);
  const newOptions = parseNewOptions(formData);

  if (!parsed.success) {
    redirectWithError(
      "/admin/caracteristicas/nova",
      parsed.error.issues[0]?.message ?? "Dados inválidos."
    );
  }

  if (!newOptions.success) {
    redirectWithError(
      "/admin/caracteristicas/nova",
      newOptions.error.issues[0]?.message ?? "Dados inválidos."
    );
  }

  const slug = await getUniqueCharacteristicSlug(parsed.data.name);
  const displayOrder = await getNextCharacteristicDisplayOrder();
  const usedOptionSlugs = new Set<string>();
  const options = newOptions.data.map((option, index) => {
    const optionSlug = getUniqueSlug(
      option.name,
      usedOptionSlugs,
      "opcao"
    );
    usedOptionSlugs.add(optionSlug);

    return {
      active: option.active,
      displayOrder: index,
      name: option.name,
      slug: optionSlug
    };
  });

  try {
    await prisma.characteristic.create({
      data: {
        name: parsed.data.name,
        slug,
        displayOrder,
        active: parsed.data.active,
        options: {
          create: options
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
        "Característica ou opção já cadastrada."
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
        ? parsed.error.issues[0]?.message ?? "Dados inválidos."
        : !existingOptions.success
          ? existingOptions.error.issues[0]?.message ?? "Dados inválidos."
          : !newOptions.success
            ? newOptions.error.issues[0]?.message ?? "Dados inválidos."
            : "Característica inválida."
    );
  }

  const characteristic = await prisma.characteristic.findUnique({
    where: { id },
    select: {
      name: true,
      slug: true,
      options: {
        select: {
          id: true,
          name: true,
          slug: true,
          displayOrder: true
        }
      }
    }
  });

  if (!characteristic) {
    redirectWithError("/admin/caracteristicas", "CaracterÃ­stica nÃ£o encontrada.");
  }

  const characteristicSlug =
    characteristic.name === parsed.data.name
      ? characteristic.slug
      : await getUniqueCharacteristicSlug(parsed.data.name, id);
  const removedOptionIdSet = new Set(removedOptionIds);
  const usedOptionSlugs = new Set(
    characteristic.options
      .filter((option) => !removedOptionIdSet.has(option.id))
      .map((option) => option.slug)
  );
  const optionData = existingOptions.data
    .filter((option) => option.id && !removedOptionIdSet.has(option.id))
    .map((option) => {
      const currentOption = characteristic.options.find(
        (item) => item.id === option.id
      );
      const nameChanged = currentOption?.name !== option.name;

      if (nameChanged && currentOption) {
        usedOptionSlugs.delete(currentOption.slug);
      }

      const optionSlug = nameChanged
        ? getUniqueSlug(option.name, usedOptionSlugs, "opcao")
        : currentOption?.slug ?? getUniqueSlug(option.name, usedOptionSlugs, "opcao");
      usedOptionSlugs.add(optionSlug);

      return {
        active: option.active,
        id: option.id as string,
        name: option.name,
        slug: optionSlug
      };
    });
  let nextOptionOrder = getNextDisplayOrder(
    Math.max(
      -1,
      ...characteristic.options
        .filter((option) => !removedOptionIdSet.has(option.id))
        .map((option) => option.displayOrder)
    )
  );
  const newOptionData = newOptions.data.map((option) => {
    const optionSlug = getUniqueSlug(option.name, usedOptionSlugs, "opcao");
    usedOptionSlugs.add(optionSlug);

    const data = {
      active: option.active,
      displayOrder: nextOptionOrder,
      name: option.name,
      slug: optionSlug
    };
    nextOptionOrder += 1;
    return data;
  });

  if (removedOptionIds.length > 0) {
    const usedOptions = await prisma.productVariantValue.count({
      where: { characteristicOptionId: { in: removedOptionIds } }
    });

    if (usedOptions > 0) {
      redirectWithError(
        errorPath,
        "Não remova opções já usadas por variantes. Inative a opção."
      );
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.characteristic.update({
        where: { id },
        data: {
          name: parsed.data.name,
          slug: characteristicSlug,
          active: parsed.data.active
        }
      });

      if (removedOptionIds.length > 0) {
        await tx.characteristicOption.deleteMany({
          where: {
            id: { in: removedOptionIds },
            characteristicId: id
          }
        });
      }

      for (const option of optionData) {
        await tx.characteristicOption.updateMany({
          where: { id: option.id, characteristicId: id },
          data: {
            name: option.name,
            slug: option.slug,
            active: option.active
          }
        });
      }

      if (newOptions.data.length > 0) {
        await tx.characteristicOption.createMany({
          data: newOptionData.map((option) => ({
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
      redirectWithError(errorPath, "Característica ou opção já cadastrada.");
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
    redirectWithError("/admin/caracteristicas", "Característica inválida.");
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
    redirectWithError("/admin/caracteristicas", "Característica não encontrada.");
  }

  if (
    characteristic._count.categories > 0 ||
    characteristic._count.options > 0 ||
    characteristic._count.values > 0
  ) {
    redirectWithError(
      "/admin/caracteristicas",
      "Característica vinculada a opção, categoria ou SKU. Remova os vínculos antes de excluir."
    );
  }

  await prisma.characteristic.delete({ where: { id } });

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
        ? "Categoria inválida."
        : parsed.error.issues[0]?.message ?? "Dados inválidos."
    );
  }

  const current = await prisma.categoryCharacteristic.findMany({
    where: { categoryId },
    select: { characteristicId: true, displayOrder: true }
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
        "Não remova características já usadas por variantes desta categoria."
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

    let nextDisplayOrder = getNextDisplayOrder(
      Math.max(-1, ...current.map((item) => item.displayOrder))
    );

    for (const item of parsed.data) {
      const existing = current.find(
        (currentItem) => currentItem.characteristicId === item.characteristicId
      );

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
          displayOrder: existing?.displayOrder ?? nextDisplayOrder++,
          required: item.required
        },
        update: {
          required: item.required
        }
      });
    }
  });

  revalidatePath(errorPath);
  revalidatePath("/admin/categorias");
  redirect(errorPath);
}
