import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import StreamArray from "stream-json/streamers/StreamArray.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Download bulk "Default Cards" file from https://scryfall.com/docs/api/bulk-data
const INPUT_FILE = "bulk/default-cards.json";
const OUTPUT_FILE = "bulk/processed-cards.ndjson";
const SETS_FILE = "data/sets.json";
const SETS_DIR = "data/sets";

type Rarity = "common" | "uncommon" | "rare" | "mythic";
const ALLOWED_RARITIES = new Set<Rarity>(["common", "uncommon", "rare", "mythic"]);
const EXCLUDED_LAYOUTS = new Set<string>([
  "token", "double_faced_token", "emblem", "art_series", "scheme", "vanguard", "planar"
]);

type SetStats = {
  name: string;
  total: number;
  common_land: number;
  common: number;
  uncommon: number;
  rare: number;
  mythic: number;
};

function transformCard(card: any) {
  if (card.lang !== "en") return null;
  if (card.digital === true) return null;
  if (card.booster === false) return null;
  if (EXCLUDED_LAYOUTS.has(card.layout)) return null;

  const rarity = card.rarity as Rarity;
  if (!ALLOWED_RARITIES.has(rarity)) return null;

  const img =
    card.image_uris?.normal ??
    card.card_faces?.[0]?.image_uris?.normal ??
    undefined;

  const out: any = {
    id: card.id,
    n: card.name,
    s: card.set,
    r: rarity,
    f: Array.isArray(card.finishes) ? card.finishes : [],
  };

  if (img) out.img = img;

  if (card. rices) {
    const { eur, usd, eur_foil, usd_foil } = card.prices;
    if (eur || usd || eur_foil || usd_foil) out.p = { eur, usd, eur_foil, usd_foil };
  }

  if (card.collector_number) out.cn = card.collector_number;

  return out;
}

async function processCards() {
  const inputPath = path.join(__dirname, "..", INPUT_FILE);
  const outputPath = path.join(__dirname, "..", OUTPUT_FILE);
  const setsPath = path.join(__dirname, "..", SETS_FILE);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.mkdirSync(path.join(__dirname, "..", SETS_DIR), { recursive: true });

  console.log(`Reading:  ${inputPath}`);
  console.log(`Writing:  ${outputPath}`);
  console.log(`Sets:     ${setsPath}`);

  const outStream = fs.createWriteStream(outputPath, { encoding: "utf8" });
  const setsMap = new Map<string, SetStats>();
  const setCards = new Map<string, Map<string, any>>(); // Track cards per set: set -> (id -> card)

  let read = 0, kept = 0, skipped = 0;

  // ✅ This internally creates Parser() correctly for stream-json v1
  const jsonStream = StreamArray.withParser();

  fs.createReadStream(inputPath)
    .pipe(jsonStream)
    .on("data", (data: { key: number; value: any }) => {
      read++;

      const card = data.value;
      
      const mini = transformCard(card);
      if (mini) {
        kept++;
        outStream.write(JSON.stringify(mini) + "\n");
        
        // Update set statistics
        if (card.set && card.set_name) {
          if (!setsMap.has(card.set)) {
            setsMap.set(card.set, {
              name: card.set_name,
              total: 0,
              common_land: 0,
              common: 0,
              uncommon: 0,
              rare: 0,
              mythic: 0
            });
          }
          if (!setCards.has(card.set)) {
            setCards.set(card.set, new Map());
          }
          const setMap = setCards.get(card.set)!;
          
          const id = card.oracle_id || card.id;
          
          // Only count if we haven't seen this oracle_id in this set before
          if (!setMap.has(id)) {
            setMap.set(id, mini);
            const stats = setsMap.get(card.set)!;
            stats.total++;
            
            // Check if it's a basic land
            const isBasicLand = card.rarity === "common" && (card.type_line?.startsWith("Basic Land") || card.type_line?.startsWith("Land"));
            
            if (isBasicLand) {
              stats.common_land++;
            } else {
              const rarity = mini.r as Rarity;
              stats[rarity]++;
            }
          }
        }
      } else {
        skipped++;
      }

      if (read % 10000 === 0) {
        console.log(
          `Read ${read.toLocaleString()} | kept ${kept.toLocaleString()} | skipped ${skipped.toLocaleString()}`
        );
      }
    })
    .on("end", () => {
      outStream.end();
      
      // Write sets to file
      const setsObject = Object.fromEntries(setsMap);
      fs.writeFileSync(setsPath, JSON.stringify(setsObject, null, 2), 'utf8');
      
      // Write individual set files
      console.log(`\nWriting individual set files...`);
      let setsWritten = 0;
      for (const [setCode, cardsMap] of setCards) {
        const setFilePath = path.join(__dirname, "..", SETS_DIR, `${setCode}.json`);
        const cardsObject = Object.fromEntries(cardsMap);
        fs.writeFileSync(setFilePath, JSON.stringify(cardsObject, null, 2), 'utf8');
        setsWritten++;
        
        if (setsWritten % 100 === 0) {
          console.log(`  Written ${setsWritten} set files...`);
        }
      }
      
      console.log("\n=== Done ===");
      console.log(`Total read:    ${read.toLocaleString()}`);
      console.log(`Total kept:    ${kept.toLocaleString()}`);
      console.log(`Total skipped: ${skipped.toLocaleString()}`);
      console.log(`Total sets:    ${setsMap.size.toLocaleString()}`);
      console.log(`Set files:     ${setsWritten.toLocaleString()}`);
      console.log(`Output size:   ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Sets size:     ${(fs.statSync(setsPath).size / 1024).toFixed(2)} KB`);
    })
    .on("error", (err: Error) => {
      outStream.end();
      console.error("Stream error:", err);
      process.exit(1);
    });

  outStream.on("error", (err) => {
    console.error("Write error:", err);
    process.exit(1);
  });
}

processCards().catch((err) => {
  console.error(err);
  process.exit(1);
});
