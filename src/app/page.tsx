"use client";

import { useState } from "react";
import { recipes } from "@/data/recipes";
import { storeProducts, ingredientToProduct } from "@/data/store-products";
import { generateShoppingList } from "@/lib/shopping-list";
import {
  scanDietaryWarnings,
  getWarningColor,
  getWarningIcon,
} from "@/lib/dietary-warnings";
import { Recipe, ShoppingList, DietaryWarning } from "@/data/types";

export default function Home() {
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(
    new Set()
  );
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);

  function toggleRecipe(id: string) {
    setSelectedRecipeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setShoppingList(null);
  }

  function generate() {
    const selected = recipes.filter((r) => selectedRecipeIds.has(r.id));
    if (selected.length === 0) return;
    setShoppingList(generateShoppingList(selected));
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Matarkostur
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Eldum Rétt vs. store — what does it actually cost?
          </p>
          <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
            Standard package: 10.966 kr for 2 meals of 3 portions (3 meals
            available)
          </div>
        </header>

        {/* Recipe Selection */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
            Recipes
          </h2>
          <div className="space-y-4">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                selected={selectedRecipeIds.has(recipe.id)}
                onToggle={() => toggleRecipe(recipe.id)}
              />
            ))}
          </div>
          {recipes.length === 0 && (
            <p className="text-zinc-500 italic">
              No recipes added yet. Paste recipe data to get started.
            </p>
          )}
        </section>

        {/* Generate Button */}
        {selectedRecipeIds.size > 0 && (
          <button
            onClick={generate}
            className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors mb-8"
          >
            Generate Shopping List ({selectedRecipeIds.size}{" "}
            {selectedRecipeIds.size === 1 ? "recipe" : "recipes"})
          </button>
        )}

        {/* Shopping List */}
        {shoppingList && <ShoppingListView list={shoppingList} />}
      </div>
    </div>
  );
}

function RecipeCard({
  recipe,
  selected,
  onToggle,
}: {
  recipe: Recipe;
  selected: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const hasUnmappedIngredients = recipe.ingredients.some(
    (ing) => !ingredientToProduct[ing.nameIs]
  );
  const warnings = scanDietaryWarnings(recipe);
  const seedOilWarnings = warnings.filter((w) => w.type === "seed_oil");
  const porkWarnings = warnings.filter((w) => w.type === "pork");
  const chickenWarnings = warnings.filter((w) => w.type === "chicken");

  return (
    <div
      className={`border rounded-lg p-4 transition-colors cursor-pointer ${
        selected
          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
          : seedOilWarnings.length > 0
            ? "border-red-300 dark:border-red-900 bg-white dark:bg-zinc-900"
            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
      }`}
    >
      <div className="flex items-start justify-between" onClick={onToggle}>
        <div className="flex-1">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {recipe.nameIs}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {recipe.name}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span>{recipe.portions} portions</span>
            {recipe.priceIsk && (
              <span>
                {recipe.priceIsk.toLocaleString("is-IS")} kr (Eldum Rétt)
              </span>
            )}
            {hasUnmappedIngredients && (
              <span className="text-amber-600 dark:text-amber-400">
                Some specialty items
              </span>
            )}
          </div>

          {/* Dietary warnings */}
          {warnings.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {seedOilWarnings.length > 0 && (
                <WarningBadge
                  warnings={seedOilWarnings}
                  label={`Seed oils: ${seedOilWarnings.map((w) => w.label).join(", ")}`}
                />
              )}
              {porkWarnings.length > 0 && (
                <WarningBadge
                  warnings={porkWarnings}
                  label={`Pork: ${porkWarnings.map((w) => w.label).join(", ")}`}
                />
              )}
              {chickenWarnings.length > 0 && (
                <WarningBadge
                  warnings={chickenWarnings}
                  label={`Chicken: ${chickenWarnings.map((w) => w.label).join(", ")}`}
                />
              )}
            </div>
          )}
        </div>
        <div
          className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
            selected
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-zinc-300 dark:border-zinc-600"
          }`}
        >
          {selected && "✓"}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mt-2"
      >
        {expanded ? "Hide ingredients" : "Show ingredients"}
      </button>

      {expanded && (
        <div className="mt-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="pb-1 font-medium">Ingredient</th>
                <th className="pb-1 font-medium text-right">Amount</th>
                <th className="pb-1 font-medium text-right">Store match</th>
              </tr>
            </thead>
            <tbody>
              {recipe.ingredients.map((ing, i) => {
                const mapped = ingredientToProduct[ing.nameIs];
                const product = mapped
                  ? storeProducts.find((p) => p.id === mapped[0])
                  : null;
                return (
                  <tr
                    key={i}
                    className="border-t border-zinc-50 dark:border-zinc-800/50"
                  >
                    <td className="py-1 text-zinc-700 dark:text-zinc-300">
                      {ing.nameIs}
                      <span className="text-zinc-400 ml-1 text-xs">
                        ({ing.name})
                      </span>
                    </td>
                    <td className="py-1 text-right text-zinc-600 dark:text-zinc-400">
                      {ing.amount} {ing.unit}
                    </td>
                    <td className="py-1 text-right">
                      {product ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {product.nameIs}
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 text-xs">
                          No match
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {recipe.needAtHome.length > 0 && (
            <p className="mt-2 text-xs text-zinc-500">
              <span className="font-medium">Need at home:</span>{" "}
              {recipe.needAtHome.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ShoppingListView({ list }: { list: ShoppingList }) {
  const matched = list.items.filter((item) => item.storeProduct);
  const unmatched = list.items.filter((item) => !item.storeProduct);

  return (
    <section>
      <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
        Shopping List
      </h2>

      {/* Items with store matches */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-left text-zinc-600 dark:text-zinc-400">
              <th className="px-4 py-2 font-medium">Buy</th>
              <th className="px-4 py-2 font-medium text-right">Need</th>
              <th className="px-4 py-2 font-medium text-right">Store pkg</th>
              <th className="px-4 py-2 font-medium text-right">Qty</th>
              <th className="px-4 py-2 font-medium text-right">Leftover</th>
              <th className="px-4 py-2 font-medium text-right">Cost</th>
            </tr>
          </thead>
          <tbody>
            {matched.map((item, i) => (
              <tr
                key={i}
                className="border-t border-zinc-100 dark:border-zinc-800"
              >
                <td className="px-4 py-2 text-zinc-800 dark:text-zinc-200">
                  {item.ingredient.nameIs}
                </td>
                <td className="px-4 py-2 text-right text-zinc-600 dark:text-zinc-400">
                  {item.quantityNeeded} {item.ingredient.unit}
                </td>
                <td className="px-4 py-2 text-right text-zinc-600 dark:text-zinc-400">
                  {item.storeProduct!.amount} {item.storeProduct!.unit}
                </td>
                <td className="px-4 py-2 text-right text-zinc-600 dark:text-zinc-400">
                  {item.packagesToBuy}x
                </td>
                <td className="px-4 py-2 text-right">
                  {item.leftover > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400">
                      {item.leftover} {item.ingredient.unit}
                    </span>
                  ) : (
                    <span className="text-emerald-600">—</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right font-medium text-zinc-800 dark:text-zinc-200">
                  {item.costIsk > 0
                    ? `${item.costIsk.toLocaleString("is-IS")} kr`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Unmatched / specialty items */}
      {unmatched.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-amber-800 dark:text-amber-300 mb-2">
            Specialty items (hard to buy separately)
          </h3>
          <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
            {unmatched.map((item, i) => (
              <li key={i}>
                {item.ingredient.nameIs} — {item.quantityNeeded}{" "}
                {item.ingredient.unit}
                <span className="text-amber-500 ml-1">
                  ({item.ingredient.name})
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
            These are pre-made mixes from Eldum Rétt. You&apos;d need to find
            recipes or substitutes for these.
          </p>
        </div>
      )}

      {/* Cost comparison */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
        <h3 className="font-medium text-zinc-800 dark:text-zinc-200 mb-3">
          Cost Comparison
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-500">Eldum Rétt price</span>
            <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              {list.eldumRettCostIsk.toLocaleString("is-IS")} kr
            </p>
          </div>
          <div>
            <span className="text-zinc-500">Store estimate</span>
            <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              {list.totalCostIsk > 0
                ? `${list.totalCostIsk.toLocaleString("is-IS")} kr`
                : "Add prices to compare"}
            </p>
          </div>
        </div>
        {list.totalCostIsk > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-zinc-500 text-sm">
              {list.savingsIsk > 0 ? "Savings" : "Extra cost"}
            </span>
            <p
              className={`text-lg font-bold ${
                list.savingsIsk > 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {Math.abs(list.savingsIsk).toLocaleString("is-IS")} kr
              {list.savingsIsk > 0 ? " saved" : " more"}
            </p>
          </div>
        )}
        {list.totalCostIsk === 0 && (
          <p className="text-xs text-zinc-400 mt-2">
            Store prices are set to 0 — fill in real prices in
            store-products.ts to see the comparison.
          </p>
        )}
      </div>
    </section>
  );
}

function WarningBadge({
  warnings,
  label,
}: {
  warnings: DietaryWarning[];
  label: string;
}) {
  const type = warnings[0].type;
  const colorClass = getWarningColor(type);
  const icon = getWarningIcon(type);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
      title={warnings.map((w) => `${w.label}: found "${w.detail}"`).join("\n")}
    >
      <span className="font-bold">{icon}</span>
      {label}
    </span>
  );
}
