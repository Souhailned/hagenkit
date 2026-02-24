/**
 * Test script for Buurtanalyse 2.0
 *
 * Run: npx tsx scripts/test-buurt-analysis.ts
 */

import { analyzeLocation } from "../lib/buurt/analyze";
import { checkConceptViability } from "../lib/buurt/concept-checker";

// Leidseplein, Amsterdam — known busy horeca area
const LAT = 52.3638;
const LNG = 4.8829;
const RADIUS = 500;

async function main() {
  console.log("=== Buurtanalyse 2.0 Test ===");
  console.log(`Location: Leidseplein, Amsterdam (${LAT}, ${LNG})`);
  console.log(`Radius: ${RADIUS}m\n`);

  // --- Full Analysis ---
  console.log("--- 1. Full Location Analysis ---");
  const start = Date.now();
  const analysis = await analyzeLocation(LAT, LNG, RADIUS);
  const elapsed = Date.now() - start;

  console.log(`Duration: ${elapsed}ms`);
  console.log(`Data sources: ${analysis.dataSources.join(", ")}`);
  console.log(`Data quality: ${analysis.dataQuality}`);
  console.log(`Bruisindex: ${analysis.bruisIndex}/10`);
  console.log(`Horeca count: ${analysis.stats.horecaCount}`);
  console.log(`Transport score: ${analysis.transportAnalysis?.score ?? analysis.stats.transportScore}/10`);
  console.log(`OV label: ${analysis.transportAnalysis?.bereikbaarheidOV ?? "n/a"}`);

  if (analysis.demographics) {
    console.log(`\n--- CBS Demographics ---`);
    console.log(`Buurt: ${analysis.demographics.buurtNaam} (${analysis.demographics.gemeenteNaam})`);
    console.log(`Inwoners: ${analysis.demographics.inwoners}`);
    console.log(`Gem. inkomen: €${analysis.demographics.gemiddeldInkomen}k`);
    console.log(`Leeftijd: ${analysis.demographics.leeftijdsverdeling.jong}% jong, ${analysis.demographics.leeftijdsverdeling.werkleeftijd}% werkleeftijd, ${analysis.demographics.leeftijdsverdeling.ouder}% 65+`);
    console.log(`Dichtheid: ${analysis.demographics.dichtheid} inw/km²`);
  } else {
    console.log("\nCBS: geen data");
  }

  if (analysis.building) {
    console.log(`\n--- BAG Building ---`);
    console.log(`Bouwjaar: ${analysis.building.bouwjaar}`);
    console.log(`Gebruiksdoel: ${analysis.building.gebruiksdoel.join(", ")}`);
    console.log(`Horeca geschikt: ${analysis.building.isHorecaGeschikt}`);
  } else {
    console.log("\nBAG: geen data");
  }

  if (analysis.transportAnalysis) {
    console.log(`\n--- Transport ---`);
    console.log(`Score: ${analysis.transportAnalysis.score}/10 (${analysis.transportAnalysis.bereikbaarheidOV})`);
    console.log(`Stops: ${analysis.transportAnalysis.stops.length}`);
    for (const stop of analysis.transportAnalysis.stops.slice(0, 5)) {
      console.log(`  ${stop.type} — ${stop.naam} (${stop.afstand}m)${stop.lijnen ? ` [${stop.lijnen.join(",")}]` : ""}`);
    }
  }

  if (analysis.passanten) {
    console.log(`\n--- Passanten ---`);
    console.log(`Schatting: ~${analysis.passanten.dagschatting}/dag`);
    console.log(`Confidence: ${analysis.passanten.confidence}`);
    console.log(`Bronnen: ${analysis.passanten.bronnen.join(", ")}`);
  }

  console.log(`\n--- Competitors (${analysis.competitors.length}) ---`);
  for (const comp of analysis.competitors.slice(0, 8)) {
    console.log(`  ${comp.naam} — ${comp.type} (${comp.afstand}m) [${comp.bron}]${comp.rating ? ` ★${comp.rating}` : ""}`);
  }

  console.log(`\n--- Summary ---`);
  console.log(analysis.summary);

  // --- Concept Check ---
  console.log("\n\n--- 2. Concept Check: Smoothiebar ---");
  const conceptStart = Date.now();
  const conceptResult = await checkConceptViability("smoothiebar", LAT, LNG, RADIUS);
  const conceptElapsed = Date.now() - conceptStart;

  console.log(`Duration: ${conceptElapsed}ms`);
  console.log(`Viability score: ${conceptResult.viabilityScore}/100`);
  console.log(`Directe concurrenten: ${conceptResult.competitionScan.directeCount}`);
  console.log(`Indirecte concurrenten: ${conceptResult.competitionScan.indirecteCount}`);
  console.log(`Doelgroep match: ${conceptResult.doelgroepMatch.score}/100`);
  console.log(`Gap analyse: ${conceptResult.gapAnalyse}`);
  console.log(`Kansen: ${conceptResult.kansen.join(" | ")}`);
  console.log(`Risico's: ${conceptResult.risicos.join(" | ")}`);

  if (conceptResult.aiInsight) {
    console.log(`\nAI Insight:\n${conceptResult.aiInsight}`);
  } else {
    console.log("\nAI Insight: niet beschikbaar (geen LLM API key)");
  }

  console.log("\n=== Test complete ===");
}

main().catch(console.error);
