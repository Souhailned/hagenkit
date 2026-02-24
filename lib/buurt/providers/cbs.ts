/**
 * CBS Open Data Provider — Demographics
 *
 * Primary: PDOK CBS WijkenBuurten WFS with BBOX + RD coordinates
 * Fallback: PDOK Locatieserver reverse geocode → CBS OData
 *
 * Auth: None (public APIs)
 */

import type { CBSDemographics } from "../types";
import { getCached, setCache } from "../cache";
import { wgs84ToRD } from "../geo-utils";

const TIMEOUT = 8000;

/**
 * Fetch CBS demographics for a location
 */
export async function fetchCBSDemographics(
  lat: number,
  lng: number,
): Promise<CBSDemographics | null> {
  const cached = await getCached<CBSDemographics>(lat, lng, "cbs", 0);
  if (cached) return cached;

  try {
    // Convert to RD for spatial queries
    const rd = wgs84ToRD(lat, lng);

    // Try WFS with bbox (newest year first)
    const years = ["2023", "2022", "2021"];
    for (const year of years) {
      const result = await fetchCBSWFS(rd.x, rd.y, year);
      if (result) {
        await setCache(lat, lng, "cbs", 0, result);
        return result;
      }
    }

    // Fallback: PDOK reverse geocode → CBS OData
    const fallback = await fetchViaReverseGeocode(lat, lng);
    if (fallback) {
      await setCache(lat, lng, "cbs", 0, fallback);
      return fallback;
    }

    return null;
  } catch (error) {
    console.error("[cbs] Error fetching demographics:", error);
    return null;
  }
}

/**
 * Primary: PDOK CBS WijkenBuurten WFS with BBOX + RD coordinates
 */
async function fetchCBSWFS(
  rdX: number,
  rdY: number,
  year: string,
): Promise<CBSDemographics | null> {
  try {
    // Small bbox (±10m) to get the buurt containing the point
    const delta = 10;
    const params = new URLSearchParams({
      service: "WFS",
      version: "2.0.0",
      request: "GetFeature",
      typeName: "buurten",
      outputFormat: "application/json",
      bbox: `${rdX - delta},${rdY - delta},${rdX + delta},${rdY + delta},EPSG:28992`,
      count: "1",
    });

    const url = `https://service.pdok.nl/cbs/wijkenbuurten/${year}/wfs/v1_0?${params}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!res.ok) return null;

    const data = await res.json();
    const feature = data?.features?.[0];
    if (!feature?.properties) return null;

    const props = feature.properties;

    // Skip invalid results
    const buurtNaam = props.buurtnaam || "";
    if (buurtNaam === "Buitenland" || !buurtNaam) return null;

    return mapCBSWFSProperties(props);
  } catch {
    return null;
  }
}

/**
 * Fallback: PDOK Locatieserver → CBS OData
 */
async function fetchViaReverseGeocode(
  lat: number,
  lng: number,
): Promise<CBSDemographics | null> {
  try {
    const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/reverse?lat=${lat}&lon=${lng}&type=buurt&rows=1&fl=identificatie,buurtnaam,gemeentenaam`;
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!res.ok) return null;

    const data = await res.json();
    const doc = data?.response?.docs?.[0];
    if (!doc?.identificatie) return null;

    const buurtCode = doc.identificatie;
    const buurtNaam = doc.buurtnaam || "";
    const gemeenteNaam = doc.gemeentenaam || "";

    // Try CBS OData tables (newest first)
    const tables = ["86030NED", "85618NED", "85163NED", "85039NED"];
    for (const table of tables) {
      const result = await fetchCBSOData(table, buurtCode, buurtNaam, gemeenteNaam);
      if (result) return result;
    }

    return null;
  } catch {
    return null;
  }
}

async function fetchCBSOData(
  tableId: string,
  buurtCode: string,
  buurtNaam: string,
  gemeenteNaam: string,
): Promise<CBSDemographics | null> {
  try {
    const codeTrimmed = buurtCode.trim();
    const codePadded = codeTrimmed.padEnd(10, " ");
    const filter = encodeURIComponent(
      `WijkenEnBuurten eq '${codePadded}' or WijkenEnBuurten eq '${codeTrimmed}'`,
    );
    const url = `https://opendata.cbs.nl/ODataApi/odata/${tableId}/TypedDataSet?$filter=${filter}&$top=1`;

    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
    if (!res.ok) return null;

    const data = await res.json();
    const row = data?.value?.[0];
    if (!row) return null;

    return mapCBSODataRow(row, buurtCode, buurtNaam, gemeenteNaam);
  } catch {
    return null;
  }
}

/**
 * Map PDOK CBS WFS properties to CBSDemographics
 *
 * Field names are camelCase in the 2023 WFS, e.g.:
 * - aantalInwoners, bevolkingsdichtheidInwonersPerKm2
 * - percentagePersonen0Tot15Jaar, percentagePersonen15Tot25Jaar, etc.
 * - aantalHuishoudens, percentageEenpersoonshuishoudens
 * - gemiddeldInkomenPerInwoner (often -99995 = suppressed)
 * - gemiddeldeWoningwaarde (WOZ, useful proxy)
 */
function mapCBSWFSProperties(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>,
): CBSDemographics {
  const inwoners = toNum(props.aantalInwoners) ?? 0;
  const inkomen = toNum(props.gemiddeldInkomenPerInwoner) ?? null;
  const dichtheid = toNum(props.bevolkingsdichtheidInwonersPerKm2) ?? null;
  const huishoudens = toNum(props.aantalHuishoudens) ?? null;

  // Age groups — WFS gives percentages directly
  const jongPct =
    (toNum(props.percentagePersonen0Tot15Jaar) ?? 0) +
    (toNum(props.percentagePersonen15Tot25Jaar) ?? 0);
  const werkPct =
    (toNum(props.percentagePersonen25Tot45Jaar) ?? 0) +
    (toNum(props.percentagePersonen45Tot65Jaar) ?? 0);
  const ouderPct = toNum(props.percentagePersonen65JaarEnOuder) ?? 0;

  const leeftijdsverdeling = {
    jong: jongPct,
    werkleeftijd: werkPct,
    ouder: ouderPct,
  };

  // percentageEenpersoonshuishoudens is already a percentage in WFS
  const eenpersoonsPercentage =
    toNum(props.percentageEenpersoonshuishoudens) ?? null;

  return {
    buurtCode: props.buurtcode || "",
    buurtNaam: props.buurtnaam || "",
    gemeenteNaam: props.gemeentenaam || "",
    inwoners,
    gemiddeldInkomen: inkomen,
    leeftijdsverdeling,
    dichtheid,
    huishoudens,
    percentageEenpersoonshuishoudens: eenpersoonsPercentage,
  };
}

function mapCBSODataRow(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: Record<string, any>,
  buurtCode: string,
  buurtNaam: string,
  gemeenteNaam: string,
): CBSDemographics {
  const inwoners = row.AantalInwoners_5 ?? 0;
  const inkomen = row.GemiddeldInkomenPerInwoner_66 ?? null;
  const huishoudens = row.HuishoudensNaarSamenstelling_28 ?? null;
  const eenpersoons = row.Eenpersoonshuishoudens_29 ?? null;
  const dichtheid = row.Bevolkingsdichtheid_33 ?? null;

  const jong024 = row.k_0Tot15Jaar_8 ?? 0;
  const jong1524 = row.k_15Tot25Jaar_9 ?? 0;
  const werk2544 = row.k_25Tot45Jaar_10 ?? 0;
  const werk4565 = row.k_45Tot65Jaar_11 ?? 0;
  const ouder65 = row.k_65JaarOfOuder_12 ?? 0;

  const totalAge = jong024 + jong1524 + werk2544 + werk4565 + ouder65;
  const leeftijdsverdeling =
    totalAge > 0
      ? {
          jong: Math.round(((jong024 + jong1524) / totalAge) * 100),
          werkleeftijd: Math.round(((werk2544 + werk4565) / totalAge) * 100),
          ouder: Math.round((ouder65 / totalAge) * 100),
        }
      : { jong: 0, werkleeftijd: 0, ouder: 0 };

  const eenpersoonsPercentage =
    eenpersoons != null && huishoudens != null && huishoudens > 0
      ? Math.round((eenpersoons / huishoudens) * 100)
      : null;

  return {
    buurtCode,
    buurtNaam,
    gemeenteNaam,
    inwoners,
    gemiddeldInkomen: inkomen,
    leeftijdsverdeling,
    dichtheid,
    huishoudens,
    percentageEenpersoonshuishoudens: eenpersoonsPercentage,
  };
}

/** Safely convert to number, treating CBS sentinel values as null */
function toNum(val: unknown): number | null {
  if (val == null) return null;
  const n = Number(val);
  if (isNaN(n)) return null;
  // CBS sentinel values: -99995 (geheim), -99997 (onbekend), -99999999 (geen data)
  if (n <= -99990) return null;
  return n;
}
