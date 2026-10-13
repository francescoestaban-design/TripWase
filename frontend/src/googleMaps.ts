import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
export const googleMapsReady = Boolean(googleMapsApiKey);

export type VerifiedDestination = {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId: string;
};

let geocoderPromise: Promise<google.maps.Geocoder> | null = null;

function getGeocoder(): Promise<google.maps.Geocoder> {
  if (!googleMapsApiKey) {
    return Promise.reject(new Error("Falta configurar VITE_GOOGLE_MAPS_API_KEY."));
  }

  if (!geocoderPromise) {
    setOptions({ key: googleMapsApiKey, v: "weekly" });
    geocoderPromise = importLibrary("geocoding")
      .then((library) => new library.Geocoder())
      .catch((error: unknown) => {
        geocoderPromise = null;
        throw error;
      });
  }

  return geocoderPromise;
}

export async function geocodeDestination(query: string): Promise<VerifiedDestination | null> {
  const geocoder = await getGeocoder();
  const { results } = await geocoder.geocode({ address: query });
  const result = results.find((item) =>
    item.types.some((type) =>
      type === "country" ||
      type === "locality" ||
      type === "administrative_area_level_1" ||
      type === "administrative_area_level_2" ||
      type === "administrative_area_level_3" ||
      type === "sublocality",
    ),
  );

  if (!result) return null;

  return {
    formattedAddress: result.formatted_address,
    latitude: result.geometry.location.lat(),
    longitude: result.geometry.location.lng(),
    placeId: result.place_id,
  };
}

export function getGoogleMapsEmbedUrl(destination: string, placeId?: string): string | null {
  if (!googleMapsApiKey) return null;

  const params = new URLSearchParams({
    key: googleMapsApiKey,
    q: placeId ? `place_id:${placeId}` : destination,
  });
  return `https://www.google.com/maps/embed/v1/place?${params}`;
}
