/**
 * BAG/PDOK Provider — Building Information
 *
 * Step 1: PDOK Locatieserver reverse geocode → bouwjaar
 * Step 2: BAG WFS verblijfsobject via BBOX + RD → gebruiksdoel, oppervlakte
 *
 * Auth: None (public API)
 */

import type { BAGBuildingInfo } from "../types";
import { getCached, setCache } from "../cache";
import { wgs84ToRD } from "../geo-utils";

const TIMEOUT = 8000;

// Building functions that indicate horeca suitability
const HORECA_FUNCTIES = [
  "bijeenkomstfunctie",
  "logiesfunctie",
  "winkelfunctie",
];

/**
 * Fetch BAG building info for a location
 */
export async function fetchBAGInfo(
  lat: number,
  lng: number,
): Promise<BAGBuildingInfo | null> {
  const cached = await getCached<BAGBuildingInfo>(lat, lng, "bag", 0);
  if (cached) return cached;

  try {
    // Fetch from PDOK locatieserver + BAG WFS in parallel
    const [pdokResult, wfsResult] = await Promise.allSettled([
      fetchFromPDOKLocatieserver(lat, lng),
      fetchFromBAGWFS(lat, lng),
    ]);

    const pdokData =
      pdokResult.status === "fulfilled" ? pdokResult.value : null;
    const wfsData =
      wfsResult.status === "fulfilled" ? wfsResult.value : null;

    if (!pdokData && !wfsData) return null;

    // Merge: PDOK provides bouwjaar reliably, WFS provides gebruiksdoel + oppervlakte
    const bouwjaar = pdokData?.bouwjaar ?? wfsData?.bouwjaar ?? null;
    const gebruiksdoel = wfsData?.gebruiksdoel ?? pdokData?.gebruiksdoel ?? [];
    const oppervlakte = wfsData?.oppervlakte ?? pdokData?.oppervlakte ?? null;
    const status = wfsData?.status ?? pdokData?.status ?? "onbekend";

    const isHorecaGeschikt = gebruiksdoel.some((doel) =>
      HORECA_FUNCTIES.some((f) => doel.toLowerCase().includes(f)),
    );

    const result: BAGBuildingInfo = {
      bouwjaar,
      gebruiksdoel,
      oppervlakte,
      status,
      isHorecaGeschikt,
    };

    await setCache(lat, lng, "bag", 0, result);
    return result;
  } catch (error) {
    console.error("[bag] Error fetching building info:", error);
    return null;
  }
}

/**
 * PDOK Locatieserver reverse geocode — fast, returns bouwjaar
 */
async function fetchFromPDOKLocatieserver(
  lat: number,
  lng: number,
): Promise<Partial<BAGBuildingInfo> | null> {
  try {
    const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/reverse?lat=${lat}&lon=${lng}&type=adres&rows=1&fl=bouwjaar,gebruiksdoel,oppervlakte,adresseerbaarobject_id,weergavenaam`;
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!res.ok) return null;

    const data = await res.json();
    const doc = data?.response?.docs?.[0];
    if (!doc) return null;

    const bouwjaar = doc.bouwjaar ? Number(doc.bouwjaar) : null;
    const gebruiksdoel: string[] = doc.gebruiksdoel
      ? Array.isArray(doc.gebruiksdoel)
        ? doc.gebruiksdoel
        : [doc.gebruiksdoel]
      : [];
    const oppervlakte = doc.oppervlakte ? Number(doc.oppervlakte) : null;

    return { bouwjaar, gebruiksdoel, oppervlakte, status: "inGebruik" };
  } catch {
    return null;
  }
}

/**
 * BAG WFS with BBOX + RD coordinates → gebruiksdoel, oppervlakte, bouwjaar
 */
async function fetchFromBAGWFS(
  lat: number,
  lng: number,
): Promise<Partial<BAGBuildingInfo> | null> {
  try {
    const rd = wgs84ToRD(lat, lng);
    const delta = 30; // 30m bbox

    // Fetch VBO + pand in parallel
    const [vboResult, pandResult] = await Promise.allSettled([
      fetchVBOByBBOX(rd.x, rd.y, delta),
      fetchPandByBBOX(rd.x, rd.y, delta),
    ]);

    const vboData = vboResult.status === "fulfilled" ? vboResult.value : null;
    const pandData = pandResult.status === "fulfilled" ? pandResult.value : null;

    if (!vboData && !pandData) return null;

    return {
      bouwjaar: pandData?.bouwjaar ?? null,
      gebruiksdoel: vboData?.gebruiksdoel ?? [],
      oppervlakte: vboData?.oppervlakte ?? null,
      status: vboData?.status ?? pandData?.status ?? "onbekend",
    };
  } catch {
    return null;
  }
}

/**
 * Fetch VBO (verblijfsobject) via BBOX
 */
async function fetchVBOByBBOX(
  rdX: number,
  rdY: number,
  delta: number,
): Promise<{
  gebruiksdoel: string[];
  oppervlakte: number | null;
  status: string;
} | null> {
  const params = new URLSearchParams({
    service: "WFS",
    version: "2.0.0",
    request: "GetFeature",
    typeName: "bag:verblijfsobject",
    outputFormat: "application/json",
    bbox: `${rdX - delta},${rdY - delta},${rdX + delta},${rdY + delta},EPSG:28992`,
    count: "5",
  });

  const url = `https://service.pdok.nl/lv/bag/wfs/v2_0?${params}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
  if (!res.ok) return null;

  const data = await res.json();
  if (!data?.features?.length) return null;

  // Prefer active VBOs
  const feature =
    data.features.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (f: any) =>
        f.properties?.status === "Verblijfsobject in gebruik" ||
        f.properties?.status === "Verblijfsobject in gebruik (niet ingemeten)",
    ) ?? data.features[0];

  const props = feature.properties;
  const gebruiksdoel: string[] = Array.isArray(props.gebruiksdoel)
    ? props.gebruiksdoel
    : props.gebruiksdoel
      ? [props.gebruiksdoel]
      : [];

  return {
    gebruiksdoel,
    oppervlakte: props.oppervlakte ? Number(props.oppervlakte) : null,
    status: props.status || "onbekend",
  };
}

/**
 * Fetch pand via BBOX for bouwjaar
 */
async function fetchPandByBBOX(
  rdX: number,
  rdY: number,
  delta: number,
): Promise<{ bouwjaar: number | null; status: string } | null> {
  const params = new URLSearchParams({
    service: "WFS",
    version: "2.0.0",
    request: "GetFeature",
    typeName: "bag:pand",
    outputFormat: "application/json",
    bbox: `${rdX - delta},${rdY - delta},${rdX + delta},${rdY + delta},EPSG:28992`,
    count: "1",
  });

  const url = `https://service.pdok.nl/lv/bag/wfs/v2_0?${params}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) return null;

  const data = await res.json();
  const feature = data?.features?.[0];
  if (!feature?.properties) return null;

  return {
    bouwjaar: feature.properties.bouwjaar
      ? Number(feature.properties.bouwjaar)
      : null,
    status: feature.properties.status || "onbekend",
  };
}
