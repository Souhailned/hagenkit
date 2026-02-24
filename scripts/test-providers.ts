import { config } from "dotenv";
config({ path: ".env.local" });

// Leidseplein, Amsterdam
const LAT = 52.3638;
const LNG = 4.8829;

// WGS84 → RD conversion (same as lib/buurt/geo-utils.ts)
function wgs84ToRD(lat: number, lng: number) {
  const dLat = 0.36 * (lat - 52.15517440);
  const dLng = 0.36 * (lng - 5.38720621);
  const x = 155000 + 190094.945 * dLng - 11832.228 * dLat * dLng - 114.221 * dLat * dLat * dLng;
  const y = 463000 + 309056.544 * dLat + 3638.893 * dLng * dLng + 73.077 * dLat * dLat - 157.984 * dLat * dLng * dLng + 59.788 * dLat * dLat * dLat;
  return { x: Math.round(x), y: Math.round(y) };
}

async function main() {
  const rd = wgs84ToRD(LAT, LNG);
  console.log(`=== Coordinate conversion ===`);
  console.log(`WGS84: (${LAT}, ${LNG})`);
  console.log(`RD:    (${rd.x}, ${rd.y})\n`);

  // --- 1. CBS via PDOK WFS with RD coordinates ---
  console.log("=== CBS via PDOK WijkenBuurten WFS (RD coords) ===");
  const years = ["2023", "2022", "2021"];
  for (const year of years) {
    try {
      const cbsUrl = `https://service.pdok.nl/cbs/wijkenbuurten/${year}/wfs/v1_0?` + new URLSearchParams({
        service: "WFS",
        version: "2.0.0",
        request: "GetFeature",
        typeName: "buurten",
        outputFormat: "application/json",
        CQL_FILTER: `INTERSECTS(geom,POINT(${rd.x} ${rd.y}))`,
        count: "1",
      });
      const cbsRes = await fetch(cbsUrl, { signal: AbortSignal.timeout(8000) });
      if (!cbsRes.ok) {
        console.log(`Year ${year}: HTTP ${cbsRes.status}`);
        continue;
      }
      const cbsData = await cbsRes.json();
      const featureCount = cbsData?.features?.length || 0;
      console.log(`Year ${year}: ${featureCount} features`);
      if (cbsData?.features?.[0]) {
        const props = cbsData.features[0].properties;
        console.log(`  Buurt: ${props.buurtnaam} (${props.gemeentenaam})`);
        console.log(`  Code: ${props.buurtcode}`);
        console.log(`  Inwoners: ${props.aantal_inwoners}`);
        console.log(`  Gem. inkomen: ${props.gemiddeld_inkomen_per_inwoner}`);
        console.log(`  Dichtheid: ${props.bevolkingsdichtheid}`);
        // Show a sample of available numeric fields
        const numFields = Object.entries(props)
          .filter(([, v]) => typeof v === "number" && v !== 0 && v > -99997)
          .slice(0, 10);
        console.log(`  Sample fields: ${numFields.map(([k, v]) => `${k}=${v}`).join(", ")}`);
        break;
      }
    } catch (e: any) {
      console.log(`Year ${year}: ${e.message?.slice(0, 80)}`);
    }
  }

  // --- 2. BAG via WFS with RD coordinates ---
  console.log("\n=== BAG VBO via WFS (RD coords) ===");
  try {
    const vboParams = new URLSearchParams({
      service: "WFS",
      version: "2.0.0",
      request: "GetFeature",
      typeName: "bag:verblijfsobject",
      outputFormat: "application/json",
      CQL_FILTER: `DWITHIN(geometrie,POINT(${rd.x} ${rd.y}),50,meters)`,
      count: "3",
    });
    const vboRes = await fetch(`https://service.pdok.nl/lv/bag/wfs/v2_0?${vboParams}`, { signal: AbortSignal.timeout(8000) });
    const vboData = await vboRes.json();
    console.log(`VBO features: ${vboData?.features?.length || 0}`);
    for (const f of (vboData?.features || []).slice(0, 2)) {
      const p = f.properties;
      console.log(`  VBO ${p.identificatie}: gebruiksdoel=${JSON.stringify(p.gebruiksdoel)}, opp=${p.oppervlakte}, status=${p.status}`);
    }
  } catch (e: any) {
    console.log(`VBO error: ${e.message}`);
  }

  console.log("\n=== BAG Pand via WFS (RD coords) ===");
  try {
    const pandParams = new URLSearchParams({
      service: "WFS",
      version: "2.0.0",
      request: "GetFeature",
      typeName: "bag:pand",
      outputFormat: "application/json",
      CQL_FILTER: `DWITHIN(geometrie,POINT(${rd.x} ${rd.y}),50,meters)`,
      count: "3",
    });
    const pandRes = await fetch(`https://service.pdok.nl/lv/bag/wfs/v2_0?${pandParams}`, { signal: AbortSignal.timeout(8000) });
    const pandData = await pandRes.json();
    console.log(`Pand features: ${pandData?.features?.length || 0}`);
    for (const f of (pandData?.features || []).slice(0, 2)) {
      const p = f.properties;
      console.log(`  Pand ${p.identificatie}: bouwjaar=${p.bouwjaar}, status=${p.status}`);
    }
  } catch (e: any) {
    console.log(`Pand error: ${e.message}`);
  }

  // --- 3. PDOK Locatieserver (for comparison) ---
  console.log("\n=== PDOK Locatieserver (WGS84 — always works) ===");
  try {
    const addrUrl = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/reverse?lat=${LAT}&lon=${LNG}&type=adres&rows=1&fl=bouwjaar,gebruiksdoel,oppervlakte,adresseerbaarobject_id,weergavenaam`;
    const addrRes = await fetch(addrUrl, { signal: AbortSignal.timeout(5000) });
    const addrData = await addrRes.json();
    const doc = addrData?.response?.docs?.[0];
    if (doc) {
      console.log(`  Adres: ${doc.weergavenaam}`);
      console.log(`  Bouwjaar: ${doc.bouwjaar}`);
      console.log(`  Gebruiksdoel: ${doc.gebruiksdoel}`);
      console.log(`  Oppervlakte: ${doc.oppervlakte}`);
      console.log(`  VBO ID: ${doc.adresseerbaarobject_id}`);
    }
  } catch (e: any) {
    console.log(`Locatieserver error: ${e.message}`);
  }

  // --- 4. Google Places (transport) ---
  console.log("\n=== Google Places (transport) ===");
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (apiKey) {
    const gRes = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.displayName,places.types,places.location",
      },
      body: JSON.stringify({
        includedTypes: ["train_station", "transit_station", "subway_station", "bus_station"],
        maxResultCount: 5,
        locationRestriction: { circle: { center: { latitude: LAT, longitude: LNG }, radius: 1000 } },
      }),
    });
    const gData = await gRes.json();
    console.log(`Transit stops: ${gData?.places?.length || 0}`);
    for (const p of gData?.places || []) {
      console.log(`  ${p.displayName?.text} — ${p.types?.slice(0, 3).join(", ")}`);
    }
  } else {
    console.log("  Skipped (no GOOGLE_PLACES_API_KEY)");
  }
}

main().catch(console.error);
