import { Recipe, StoreProduct, ShoppingListItem, ShoppingList } from "@/data/types";
import { storeProducts, ingredientToProduct } from "@/data/store-products";

function findBestProduct(
  ingredientNameIs: string,
  amountNeeded: number,
  unit: string
): { product: StoreProduct; packages: number; leftover: number } | null {
  const productIds = ingredientToProduct[ingredientNameIs];
  if (!productIds || productIds.length === 0) return null;

  const candidates = productIds
    .map((id) => storeProducts.find((p) => p.id === id))
    .filter((p): p is StoreProduct => p !== undefined && p.unit === unit);

  if (candidates.length === 0) return null;

  // Find the option with least waste (and cost if prices are set)
  let best: { product: StoreProduct; packages: number; leftover: number } | null = null;

  for (const product of candidates) {
    const packages = Math.ceil(amountNeeded / product.amount);
    const totalAmount = packages * product.amount;
    const leftover = totalAmount - amountNeeded;

    if (
      !best ||
      leftover < best.leftover ||
      (leftover === best.leftover && product.priceIsk < best.product.priceIsk)
    ) {
      best = { product, packages, leftover };
    }
  }

  return best;
}

export function generateShoppingList(selectedRecipes: Recipe[]): ShoppingList {
  // Aggregate ingredients across all selected recipes
  const aggregated = new Map<
    string,
    { amount: number; unit: string; ingredient: Recipe["ingredients"][0] }
  >();

  for (const recipe of selectedRecipes) {
    for (const ing of recipe.ingredients) {
      if (!ing.providedByKit) continue; // skip things not in the kit

      const key = ing.nameIs;
      const existing = aggregated.get(key);
      if (existing) {
        existing.amount += ing.amount;
      } else {
        aggregated.set(key, { amount: ing.amount, unit: ing.unit, ingredient: ing });
      }
    }
  }

  const items: ShoppingListItem[] = [];

  for (const [, { amount, ingredient }] of aggregated) {
    const match = findBestProduct(ingredient.nameIs, amount, ingredient.unit);

    items.push({
      ingredient,
      storeProduct: match?.product ?? null,
      quantityNeeded: amount,
      packagesToBuy: match?.packages ?? 0,
      leftover: match?.leftover ?? 0,
      costIsk: match ? match.packages * match.product.priceIsk : 0,
    });
  }

  const totalCostIsk = items.reduce((sum, item) => sum + item.costIsk, 0);
  const eldumRettCostIsk = selectedRecipes.reduce(
    (sum, r) => sum + (r.priceIsk ?? 0),
    0
  );

  return {
    recipes: selectedRecipes,
    items,
    totalCostIsk,
    eldumRettCostIsk,
    savingsIsk: eldumRettCostIsk - totalCostIsk,
  };
}
