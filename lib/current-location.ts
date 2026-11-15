import type { AddressInput } from "@/lib/api/addresses";

/**
 * A place picked by GPS or search. `title`/`subtitle` drive the summary card;
 * `fields` prefill the form. Flat / house number (line1) is never guessed —
 * the person types it, like Blinkit's "Enter complete address" step.
 */
export type PickedPlace = {
  id: string;
  title: string;
  subtitle: string;
  fields: Pick<AddressInput, "line2" | "city" | "state" | "pincode">;
};

/** Why the lookup failed — `denied` lets the UI offer a way into Settings. */
export type LocationErrorReason = "denied" | "unavailable" | "lookup";

export class LocationError extends Error {
  constructor(
    message: string,
    readonly reason: LocationErrorReason,
  ) {
    super(message);
  }
}

type Parts = {
  road?: string | null;
  area?: string | null;
  locality?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
};

const clean = (v?: string | null) => (v ?? "").trim();
const unique = (...parts: (string | null | undefined)[]) =>
  parts.map(clean).filter((p, i, all) => p && all.indexOf(p) === i);

function toPlace(id: string, p: Parts, name?: string | null): PickedPlace {
  const pincode = clean(p.pincode).replace(/\s+/g, "");
  const city = clean(p.city);
  const state = clean(p.state);
  const line2 = unique(name, p.road, p.area, p.locality).filter((x) => x !== city).join(", ");
  const title = unique(name, p.area, p.locality, p.road, city)[0] ?? "Selected location";
  const subtitle = unique(p.road, p.area, p.locality, city, state)
    .filter((x) => x !== title)
    .join(", ")
    .concat(pincode ? ` ${pincode}` : "");
  return { id, title, subtitle: subtitle.trim(), fields: { line2, city, state, pincode } };
}

/** OpenStreetMap's reverse geocoder — turns GPS coordinates into an address. */
async function reverseWithNominatim(latitude: number, longitude: number): Promise<PickedPlace> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&accept-language=en&lat=${latitude}&lon=${longitude}`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) throw new Error(String(response.status));
  const a = ((await response.json()) as { address?: Record<string, string> }).address ?? {};
  return toPlace("gps", {
    road: a.road,
    area: a.neighbourhood || a.suburb,
    locality: a.suburb !== (a.neighbourhood || a.suburb) ? a.suburb : a.city_district,
    city: a.city || a.town || a.village || a.county || a.state_district,
    state: a.state,
    pincode: a.postcode,
  });
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new LocationError("Your browser can't share your location. Search for your area instead.", "unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) =>
        reject(
          err.code === err.PERMISSION_DENIED
            ? new LocationError("Location access is blocked. Allow it from the icon in your browser's address bar, or search for your area instead.", "denied")
            : new LocationError("Couldn't detect your location. Please try again.", "unavailable"),
        ),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  });
}

/** Asks the browser for the current position and turns it into a place. Needs HTTPS (or localhost). */
export async function getCurrentPlace(): Promise<PickedPlace> {
  const { latitude, longitude } = (await getPosition()).coords;
  try {
    return await reverseWithNominatim(latitude, longitude);
  } catch {
    throw new LocationError("We found you, but couldn't match an address. Search for your area or add it manually.", "lookup");
  }
}

type PhotonFeature = { properties: Record<string, string | undefined> };

/** Type-ahead search for areas and streets in India (Photon, OpenStreetMap data). */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PickedPlace[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const response = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=en&bbox=68.1,6.5,97.5,35.7`,
    { headers: { Accept: "application/json" }, signal },
  );
  if (!response.ok) throw new Error(String(response.status));
  const features = ((await response.json()) as { features?: PhotonFeature[] }).features ?? [];

  const seen = new Set<string>();
  return features
    .map((f) => f.properties)
    .filter((p) => p.countrycode === "IN")
    .map((p, i) =>
      toPlace(`search-${i}`, {
        road: p.street,
        area: p.locality || p.district,
        locality: p.locality ? p.district : undefined,
        city: p.city || p.county,
        state: p.state,
        pincode: p.postcode,
      }, p.housenumber && p.street ? `${p.housenumber} ${p.street}` : p.name),
    )
    .filter((place) => {
      const key = `${place.title}|${place.subtitle}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6);
}
