"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { SlidersHorizontal, Loader2 } from "lucide-react";

interface CategoryFiltersProps {
  initialDistrict?: string;
  initialMaxPrice?: string;
  initialMinRating?: string;
  initialMinExp?: string;
}

export default function CategoryFilters({
  initialDistrict = "",
  initialMaxPrice = "",
  initialMinRating = "",
  initialMinExp = "",
}: CategoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [district, setDistrict] = useState(initialDistrict);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [minRating, setMinRating] = useState(initialMinRating);
  const [minExp, setMinExp] = useState(initialMinExp);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (district) params.set("district", district);
    else params.delete("district");

    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    if (minRating) params.set("minRating", minRating);
    else params.delete("minRating");

    if (minExp) params.set("minExp", minExp);
    else params.delete("minExp");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setDistrict("");
    setMaxPrice("");
    setMinRating("");
    setMinExp("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const districts = ["Есиль", "Алматы", "Сарыарка", "Байконур", "Нура"];

  return (
    <div className="bg-white p-6 rounded-2xl border border-cream-dark/20 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-obsidian flex items-center gap-2 text-sm">
          <SlidersHorizontal className="h-4 w-4 text-purpleBrand" />
          Фильтры поиска
        </h3>
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-purpleBrand" />}
      </div>

      <div className="space-y-4">
        {/* District Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Район города
          </label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full rounded-xl border-cream-dark/30 bg-cream-light/30 text-sm p-3 focus:border-purpleBrand focus:bg-white focus:outline-none transition-colors border text-obsidian font-medium"
          >
            <option value="">Все районы</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Max Price Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Макс. стоимость выезда (₸)
          </label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Например: 5000"
            className="w-full rounded-xl border-cream-dark/30 bg-cream-light/30 text-sm p-3 focus:border-purpleBrand focus:bg-white focus:outline-none transition-colors border text-obsidian font-medium"
          />
        </div>

        {/* Min Rating Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Минимальный рейтинг
          </label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="w-full rounded-xl border-cream-dark/30 bg-cream-light/30 text-sm p-3 focus:border-purpleBrand focus:bg-white focus:outline-none transition-colors border text-obsidian font-medium"
          >
            <option value="">Любой рейтинг</option>
            <option value="4.8">4.8 ★ и выше</option>
            <option value="4.9">4.9 ★ и выше</option>
            <option value="5.0">5.0 ★ только отличники</option>
          </select>
        </div>

        {/* Min Experience Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Стаж работы (лет)
          </label>
          <select
            value={minExp}
            onChange={(e) => setMinExp(e.target.value)}
            className="w-full rounded-xl border-cream-dark/30 bg-cream-light/30 text-sm p-3 focus:border-purpleBrand focus:bg-white focus:outline-none transition-colors border text-obsidian font-medium"
          >
            <option value="">Любой стаж</option>
            <option value="5">Более 5 лет</option>
            <option value="10">Более 10 лет</option>
            <option value="15">Более 15 лет</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={applyFilters}
          disabled={isPending}
          className="w-full bg-obsidian text-cream py-3 rounded-xl hover:bg-obsidian-light font-bold text-sm shadow-sm transition-all"
        >
          Применить
        </button>
        <button
          onClick={clearFilters}
          disabled={isPending}
          className="w-full bg-transparent text-gray-500 hover:text-obsidian hover:bg-cream-light py-2 rounded-xl text-xs font-semibold transition-all"
        >
          Сбросить все
        </button>
      </div>
    </div>
  );
}
