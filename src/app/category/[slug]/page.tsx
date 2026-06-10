import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import RatingStars from "@/components/RatingStars";
import CategoryFilters from "@/components/CategoryFilters";
import { MapPin, Briefcase, Award, ArrowLeft, Star, Heart, CheckCircle2 } from "lucide-react";

interface CategoryPageProps {
  params: { slug: string };
  searchParams: {
    district?: string;
    maxPrice?: string;
    minRating?: string;
    minExp?: string;
  };
}

export const revalidate = 0; // Fresh data on request

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  // 1. Fetch Category
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category) {
    notFound();
  }

  // 2. Extract and build filter query
  const district = searchParams.district;
  const maxPrice = searchParams.maxPrice;
  const minRating = searchParams.minRating;
  const minExp = searchParams.minExp;

  const where: any = {
    categories: {
      some: {
        id: category.id,
      },
    },
  };

  if (district) {
    where.districts = {
      has: district,
    };
  }

  if (maxPrice) {
    where.basePrice = {
      lte: parseFloat(maxPrice),
    };
  }

  if (minRating) {
    where.rating = {
      gte: parseFloat(minRating),
    };
  }

  if (minExp) {
    where.experienceYears = {
      gte: parseInt(minExp),
    };
  }

  // 3. Query masters (VIP first, then priority score, then rating)
  const masters = await prisma.masterProfile.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: [
      { isVip: "desc" },
      { searchPriority: "desc" },
      { rating: "desc" },
    ],
  });

  // Helper function to get mock avatars (consistent based on master names)
  const getAvatarUrl = (name: string) => {
    if (name.includes("Аскар")) return "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=120&q=80";
    if (name.includes("Диас")) return "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=120&q=80";
    if (name.includes("Сергей")) return "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80";
    if (name.includes("Бауыржан")) return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80";
    if (name.includes("Канат")) return "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80";
    if (name.includes("Владимир")) return "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80";
    return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80";
  };

  return (
    <div className="bg-cream-light/30 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-purpleBrand transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Вернуться на главную</span>
          </Link>
        </div>

        {/* Category Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-6 border-b border-cream-dark/20 gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-obsidian">{category.name}</h1>
            <p className="text-xs text-gray-500 font-semibold mt-1 uppercase tracking-wide">
              Найдено специалистов: {masters.length} в Астане
            </p>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Sidebar Filters */}
          <div className="lg:col-span-1">
            <CategoryFilters
              initialDistrict={district}
              initialMaxPrice={maxPrice}
              initialMinRating={minRating}
              initialMinExp={minExp}
            />
          </div>

          {/* Right listing cards */}
          <div className="lg:col-span-3 space-y-6">
            {masters.length === 0 ? (
              <div className="bg-white rounded-2xl border border-cream-dark/20 p-12 text-center">
                <p className="text-base text-gray-500 font-semibold">Не найдено мастеров по заданным фильтрам.</p>
                <p className="text-xs text-gray-400 mt-2">Попробуйте смягчить требования фильтрации.</p>
              </div>
            ) : (
              masters.map((master) => {
                const avatar = getAvatarUrl(master.user.name);
                return (
                  <div
                    key={master.id}
                    className={`relative bg-white rounded-2xl border p-6 transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row gap-6 ${
                      master.isVip 
                        ? "border-purpleBrand bg-purpleBrand/5/5" 
                        : "border-cream-dark/20"
                    }`}
                  >
                    {/* VIP Ribbon badge */}
                    {master.isVip && (
                      <span className="absolute top-4 right-4 bg-purpleBrand text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wider flex items-center gap-1 shadow-sm">
                        <Star className="h-3 w-3 fill-current" />
                        VIP
                      </span>
                    )}

                    {/* Master Profile Photo */}
                    <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden relative border border-cream-dark/15 self-start">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatar}
                        alt={master.user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info text details */}
                    <div className="flex-grow space-y-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-bold text-obsidian hover:text-purpleBrand transition-colors">
                            <Link href={`/master/${master.id}`}>{master.user.name}</Link>
                          </h3>
                          {master.isVip && (
                            <span className="text-[10px] text-greenBrand bg-greenBrand/15 px-2 py-0.5 rounded font-bold uppercase">
                              Проверен
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">Возраст: {master.age} лет</p>
                      </div>

                      {/* Rating details component */}
                      <RatingStars rating={master.rating} reviewsCount={master.reviewsCount} />

                      {/* Description snippet */}
                      <p className="text-xs text-obsidian/75 leading-relaxed font-medium line-clamp-2">
                        {master.description}
                      </p>

                      {/* Credentials list */}
                      <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-600 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4 text-purpleBrand" />
                          <span>Стаж работы: {master.experienceYears} лет</span>
                        </div>
                        <div className="flex items-start gap-1.5 max-w-[280px]">
                          <MapPin className="h-4 w-4 text-red-500 shrink-0" />
                          <span className="truncate">Районы: {master.districts.join(", ")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Price CTA panel */}
                    <div className="shrink-0 md:w-48 flex flex-col justify-between border-t md:border-t-0 md:border-l border-cream-dark/15 pt-4 md:pt-0 md:pl-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Выезд & диагностика</p>
                        <p className="text-2xl font-black text-obsidian">
                          от {master.basePrice.toLocaleString()} ₸
                        </p>
                      </div>

                      <div className="mt-4 md:mt-0 space-y-2">
                        <Link
                          href={`/master/${master.id}`}
                          className="w-full flex items-center justify-center gap-1.5 bg-obsidian text-cream hover:bg-obsidian-light py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
                        >
                          Подробнее
                        </Link>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
