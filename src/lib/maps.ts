type GoogleMapsLinkInput = {
  address?: string | null;
  mapEmbedUrl?: string | null;
  tradeName?: string | null;
};

type Coordinates = {
  latitude: string;
  longitude: string;
};

const LEGACY_STORE_COORDINATES = {
  latitude: "-5.064678194912064",
  longitude: "-42.762723625018445"
};

const VERIFIED_STORE_COORDINATES = {
  latitude: "-5.064666666666666",
  longitude: "-42.76013888888889"
};

function getHttpUrl(value: string) {
  try {
    const url = new URL(value);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return url;
    }
  } catch {
    return null;
  }

  return null;
}

function isGoogleMapsEmbedUrl(url: URL) {
  return url.hostname.includes("google.") && url.pathname.startsWith("/maps/embed");
}

function getEmbedCoordinates(value: string): Coordinates | null {
  const match = value.match(/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/);

  if (!match) {
    return null;
  }

  return {
    longitude: match[1],
    latitude: match[2]
  };
}

function getEmbedPlaceName(value: string) {
  const match = value.match(/!2s([^!]+)/);

  if (!match) {
    return "";
  }

  try {
    return decodeURIComponent(match[1]).replace(/\+/g, " ").trim();
  } catch {
    return match[1].replace(/\+/g, " ").trim();
  }
}

function getMapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
}

function normalizeStoreCoordinates(coordinates: Coordinates): Coordinates {
  if (
    coordinates.latitude === LEGACY_STORE_COORDINATES.latitude &&
    coordinates.longitude === LEGACY_STORE_COORDINATES.longitude
  ) {
    return VERIFIED_STORE_COORDINATES;
  }

  return coordinates;
}

export function getGoogleMapsLinkUrl({
  address,
  mapEmbedUrl,
  tradeName
}: GoogleMapsLinkInput) {
  const trimmedMapUrl = mapEmbedUrl?.trim() ?? "";
  const parsedMapUrl = trimmedMapUrl ? getHttpUrl(trimmedMapUrl) : null;
  const fallbackQuery = [address, tradeName]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");

  if (parsedMapUrl && !isGoogleMapsEmbedUrl(parsedMapUrl)) {
    return parsedMapUrl.toString();
  }

  if (parsedMapUrl && isGoogleMapsEmbedUrl(parsedMapUrl)) {
    const coordinates = getEmbedCoordinates(trimmedMapUrl);

    if (coordinates) {
      const normalizedCoordinates = normalizeStoreCoordinates(coordinates);

      return getMapsSearchUrl(
        `${normalizedCoordinates.latitude},${normalizedCoordinates.longitude}`
      );
    }

    const placeName = getEmbedPlaceName(trimmedMapUrl);

    if (placeName) {
      return getMapsSearchUrl(placeName);
    }
  }

  if (fallbackQuery) {
    return getMapsSearchUrl(fallbackQuery);
  }

  return null;
}