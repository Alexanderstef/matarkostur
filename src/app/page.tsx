"use client";

import { useState, useEffect } from "react";
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
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowSticky(window.scrollY > 300);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggleRecipe(id: string) {
    setSelectedRecipeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setShoppingList(null);
  }

  function selectAll() {
    setSelectedRecipeIds(new Set(recipes.map((r) => r.id)));
    setShoppingList(null);
  }

  function deselectAll() {
    setSelectedRecipeIds(new Set());
    setShoppingList(null);
  }

  function generate() {
    const selected = recipes.filter((r) => selectedRecipeIds.has(r.id));
    if (selected.length === 0) return;
    setShoppingList(generateShoppingList(selected));
  }

  const allSelected = selectedRecipeIds.size === recipes.length;
  const someSelected = selectedRecipeIds.size > 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              M
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Matarkostur
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Eldum Rétt vs. store — what does it actually cost?
              </p>
            </div>
          </div>
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Standard package: 10.966 kr for 2 meals of 3 portions
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Recipe Selection */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-800 dark:text-zinc-200">
              Choose recipes
            </h2>
            <button
              onClick={allSelected ? deselectAll : selectAll}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                selected={selectedRecipeIds.has(recipe.id)}
                onToggle={() => toggleRecipe(recipe.id)}
              />
            ))}
          </div>
        </section>

        {/* Inline Generate Button */}
        {someSelected && (
          <div className="mb-8">
            <button
              onClick={generate}
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              Generate Shopping List ({selectedRecipeIds.size}{" "}
              {selectedRecipeIds.size === 1 ? "recipe" : "recipes"})
            </button>
          </div>
        )}

        {/* Shopping List */}
        {shoppingList && (
          <div className="animate-fade-in">
            <ShoppingListView list={shoppingList} />
          </div>
        )}
      </main>

      {/* Sticky bottom bar on scroll */}
      {someSelected && showSticky && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border-t border-zinc-200 dark:border-zinc-800 sticky-shadow p-3 sm:p-4 animate-fade-in">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {selectedRecipeIds.size} {selectedRecipeIds.size === 1 ? "recipe" : "recipes"} selected
            </span>
            <button
              onClick={generate}
              className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl transition-all shadow-sm text-sm"
            >
              Generate List
            </button>
          </div>
        </div>
      )}
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
      className={`rounded-xl border-2 transition-all ${
        selected
          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm"
          : seedOilWarnings.length > 0
            ? "border-red-200 dark:border-red-900/60 bg-white dark:bg-zinc-900 hover:border-red-300 dark:hover:border-red-800"
            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
      }`}
    >
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={onToggle}
      >
        {/* Checkbox */}
        <div
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
            selected
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-zinc-300 dark:border-zinc-600"
          }`}
        >
          {selected && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
            {recipe.nameIs}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {recipe.name}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
              {recipe.portions} portions
            </span>
            {recipe.priceIsk && (
              <span className="inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg>
                {recipe.priceIsk.toLocaleString("is-IS")} kr
              </span>
            )}
            {hasUnmappedIngredients && (
              <span className="text-amber-600 dark:text-amber-400">
                Specialty items
              </span>
            )}
          </div>

          {/* Dietary warnings */}
          {warnings.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
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
      </div>

      {/* Expand toggle */}
      <div className="px-4 pb-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors flex items-center gap-1"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
          {expanded ? "Hide ingredients" : "Show ingredients"}
        </button>
      </div>

      {/* Expanded ingredient list */}
      {expanded && (
        <div className="animate-slide-down border-t border-zinc-100 dark:border-zinc-800 px-4 pb-4 pt-3">
          <div className="space-y-1.5">
            {recipe.ingredients.map((ing, i) => {
              const mapped = ingredientToProduct[ing.nameIs];
              const product = mapped
                ? storeProducts.find((p) => p.id === mapped[0])
                : null;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {ing.nameIs}
                    </span>
                    <span className="text-zinc-400 ml-1 text-xs">
                      ({ing.name})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-zinc-500">
                      {ing.amount} {ing.unit}
                    </span>
                    {product ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title={product.nameIs} />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400" title="No store match" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {recipe.needAtHome.length > 0 && (
            <p className="mt-3 text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg px-3 py-2">
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
    <section className="space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-zinc-800 dark:text-zinc-200">
        Shopping List
      </h2>

      {/* Items with store matches — table on desktop, cards on mobile */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        {/* Desktop table */}
        <div className="hidden sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-left text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium text-right">Need</th>
                <th className="px-4 py-3 font-medium text-right">Package</th>
                <th className="px-4 py-3 font-medium text-right">Qty</th>
                <th className="px-4 py-3 font-medium text-right">Leftover</th>
                <th className="px-4 py-3 font-medium text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              {matched.map((item, i) => (
                <tr
                  key={i}
                  className="border-t border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-4 py-2.5 text-zinc-800 dark:text-zinc-200 font-medium">
                    {item.ingredient.nameIs}
                    <span className="text-zinc-400 text-xs ml-1 font-normal hidden lg:inline">
                      {item.storeProduct!.store}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-zinc-500 dark:text-zinc-400">
                    {item.quantityNeeded} {item.ingredient.unit}
                  </td>
                  <td className="px-4 py-2.5 text-right text-zinc-500 dark:text-zinc-400">
                    {item.storeProduct!.amount} {item.storeProduct!.unit}
                  </td>
                  <td className="px-4 py-2.5 text-right text-zinc-600 dark:text-zinc-300 font-medium">
                    {item.packagesToBuy}x
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {item.leftover > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400 text-xs">
                        +{item.leftover} {item.ingredient.unit}
                      </span>
                    ) : (
                      <span className="text-zinc-300 dark:text-zinc-700">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-zinc-800 dark:text-zinc-200">
                    {item.costIsk > 0
                      ? `${item.costIsk.toLocaleString("is-IS")} kr`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
          {matched.map((item, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start justify-between mb-1.5">
                <div>
                  <div className="font-medium text-zinc-800 dark:text-zinc-200 text-sm">
                    {item.ingredient.nameIs}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {item.storeProduct!.store}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
                    {item.costIsk > 0
                      ? `${item.costIsk.toLocaleString("is-IS")} kr`
                      : "—"}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {item.packagesToBuy}x ({item.storeProduct!.amount}{item.storeProduct!.unit})
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Need {item.quantityNeeded} {item.ingredient.unit}</span>
                {item.leftover > 0 && (
                  <span className="text-amber-600 dark:text-amber-400">
                    +{item.leftover} {item.ingredient.unit} leftover
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unmatched / specialty items */}
      {unmatched.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4">
          <h3 className="font-semibold text-amber-800 dark:text-amber-300 text-sm mb-2">
            Specialty items (from Eldum Rétt kit)
          </h3>
          <div className="space-y-1.5">
            {unmatched.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-amber-700 dark:text-amber-400">
                  {item.ingredient.nameIs}
                </span>
                <span className="text-amber-500 text-xs">
                  {item.quantityNeeded} {item.ingredient.unit}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-600/70 dark:text-amber-500/70 mt-3">
            These are pre-made mixes from the kit. You&apos;d need to find substitutes.
          </p>
        </div>
      )}

      {/* Cost comparison */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-5">
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-4 text-sm uppercase tracking-wider">
            Cost Comparison
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Eldum Rétt</span>
              <p className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mt-1">
                {list.eldumRettCostIsk.toLocaleString("is-IS")}
                <span className="text-sm font-normal text-zinc-400 ml-1">kr</span>
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Store estimate</span>
              <p className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mt-1">
                {list.totalCostIsk > 0 ? (
                  <>
                    {list.totalCostIsk.toLocaleString("is-IS")}
                    <span className="text-sm font-normal text-zinc-400 ml-1">kr</span>
                  </>
                ) : (
                  <span className="text-sm font-normal text-zinc-400">Add prices</span>
                )}
              </p>
            </div>
          </div>

          {list.totalCostIsk > 0 && (
            <div className={`mt-4 rounded-lg p-4 text-center ${
              list.savingsIsk > 0
                ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50"
                : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50"
            }`}>
              <span className="text-xs text-zinc-500 uppercase tracking-wider">
                {list.savingsIsk > 0 ? "You save" : "Extra cost"}
              </span>
              <p className={`text-2xl font-bold mt-0.5 ${
                list.savingsIsk > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}>
                {Math.abs(list.savingsIsk).toLocaleString("is-IS")} kr
              </p>
            </div>
          )}

          {list.totalCostIsk === 0 && (
            <p className="text-xs text-zinc-400 mt-3">
              Store prices are set to 0 — fill in real prices in
              store-products.ts to see the comparison.
            </p>
          )}
        </div>
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
