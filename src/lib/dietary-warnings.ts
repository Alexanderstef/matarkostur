import { DietaryWarning, Recipe } from "@/data/types";

// Seed oils and their common Icelandic/English names in ingredient lists
const SEED_OIL_PATTERNS: { pattern: RegExp; label: string }[] = [
  // Specific oils
  { pattern: /sólblómaolía/i, label: "Sunflower oil" },
  { pattern: /sunflower oil/i, label: "Sunflower oil" },
  { pattern: /repjuolía/i, label: "Rapeseed/canola oil" },
  { pattern: /canola oil/i, label: "Canola oil" },
  { pattern: /rapeseed oil/i, label: "Rapeseed oil" },
  { pattern: /maísolía/i, label: "Corn oil" },
  { pattern: /corn oil/i, label: "Corn oil" },
  { pattern: /sojaolía/i, label: "Soybean oil" },
  { pattern: /soybean oil/i, label: "Soybean oil" },
  { pattern: /soja\s*olía/i, label: "Soybean oil" },
  { pattern: /hörfræolía/i, label: "Linseed oil" },
  { pattern: /þrúguolía/i, label: "Grapeseed oil" },
  { pattern: /grapeseed oil/i, label: "Grapeseed oil" },
  { pattern: /safflower/i, label: "Safflower oil" },
  { pattern: /cottonseed/i, label: "Cottonseed oil" },
  { pattern: /bómullarfræolía/i, label: "Cottonseed oil" },
  // Mayo (almost always contains seed oils)
  { pattern: /majónes/i, label: "Mayonnaise (seed oils)" },
  { pattern: /mayo/i, label: "Mayonnaise (seed oils)" },
  // Generic vegetable oil
  { pattern: /jurtaolía/i, label: "Vegetable oil" },
  { pattern: /vegetable oil/i, label: "Vegetable oil" },
  // Corn syrup (often indicates processed seed-oil-containing products)
  { pattern: /maíssíróp/i, label: "Corn syrup" },
];

const PORK_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /svín/i, label: "Pork" },
  { pattern: /beikon/i, label: "Bacon" },
  { pattern: /bacon/i, label: "Bacon" },
  { pattern: /skinku/i, label: "Ham" },
  { pattern: /skinka/i, label: "Ham" },
  { pattern: /ham(?:\s|,|$)/i, label: "Ham" },
  { pattern: /pork/i, label: "Pork" },
  { pattern: /pylsu/i, label: "Sausage (may contain pork)" },
  { pattern: /pylsa/i, label: "Sausage (may contain pork)" },
  { pattern: /spæn/i, label: "Spare ribs" },
  { pattern: /grís/i, label: "Pork" },
  { pattern: /flæsk/i, label: "Pork belly" },
];

const CHICKEN_PATTERNS: { pattern: RegExp; label: string }[] = [
  // Match kjúkling/kjúkl but NOT kjúklingabaun (chickpea)
  { pattern: /kjúkling(?!abaun)/i, label: "Chicken" },
  { pattern: /chicken(?!pea| pea)/i, label: "Chicken" },
  { pattern: /kjúkl(?!ingabaun)/i, label: "Chicken" },
];

export function scanDietaryWarnings(recipe: Recipe): DietaryWarning[] {
  const warnings: DietaryWarning[] = [];
  const text = recipe.innihaldslysing;

  // Also check ingredient names
  const ingredientNames = recipe.ingredients
    .map((i) => `${i.name} ${i.nameIs}`)
    .join(" ");
  const fullText = `${text} ${ingredientNames}`;

  for (const { pattern, label } of SEED_OIL_PATTERNS) {
    const match = fullText.match(pattern);
    if (match) {
      // Avoid duplicate warning types with same label
      if (!warnings.some((w) => w.type === "seed_oil" && w.label === label)) {
        warnings.push({
          type: "seed_oil",
          label,
          detail: match[0],
        });
      }
    }
  }

  for (const { pattern, label } of PORK_PATTERNS) {
    const match = fullText.match(pattern);
    if (match) {
      if (!warnings.some((w) => w.type === "pork" && w.label === label)) {
        warnings.push({
          type: "pork",
          label,
          detail: match[0],
        });
      }
    }
  }

  for (const { pattern, label } of CHICKEN_PATTERNS) {
    const match = fullText.match(pattern);
    if (match) {
      if (!warnings.some((w) => w.type === "chicken" && w.label === label)) {
        warnings.push({
          type: "chicken",
          label,
          detail: match[0],
        });
      }
    }
  }

  return warnings;
}

export function getWarningColor(type: DietaryWarning["type"]): string {
  switch (type) {
    case "seed_oil":
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900";
    case "pork":
      return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900";
    case "chicken":
      return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900";
  }
}

export function getWarningIcon(type: DietaryWarning["type"]): string {
  switch (type) {
    case "seed_oil":
      return "!!";
    case "pork":
      return "!";
    case "chicken":
      return "i";
  }
}
