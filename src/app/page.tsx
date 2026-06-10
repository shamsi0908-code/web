import { prisma } from "@/lib/db";
import Link from "next/link";
import RatingStars from "@/components/RatingStars";
import { 
  Droplet, Zap, Key, Wrench, Wind, 
  CheckCircle2, Star, Clock, Users, 
  CheckSquare, MessageSquare, PhoneCall, ShieldCheck, ArrowRight
} from "lucide-react";

// Map Lucide icon string to actual React Component
const iconMap: Record<string, any> = {
  Droplet: Droplet,
  Zap: Zap,
  Key: Key,
  Wrench: Wrench,
  Wind: Wind,
};

export const revalidate = 0; // Ensure data stays fresh for testing

export default async function HomePage() {
  // 1. Fetch Categories with master counts and ratings
  const dbCategories = await prisma.category.findMany({
    include: {
      masters: {
        select: {
          rating: true,
        },
      },
      _count: {
        select: { masters: true },
      },
    },
  });

  const categories = dbCategories.map((cat) => {
    const totalRating = cat.masters.reduce((sum, m) => sum + m.rating, 0);
    const avgRating = cat.masters.length > 0 ? totalRating / cat.masters.length : 5.0;

    return {
      ...cat,
      masterCount: cat._count.masters,
      avgRating: parseFloat(avgRating.toFixed(1)),
    };
  });

  // 2. Fetch Active Promotions
  const promotions = await prisma.promotion.findMany({
    where: { isActive: true },
    include: { category: true },
    take: 3,
  });

  // 3. Fetch Testimonial Reviews (last 3 reviews with 5 stars)
  const reviews = await prisma.review.findMany({
    where: { rating: 5 },
    include: {
      client: true,
      master: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  // 4. Calculate Platform Statistics
  const mastersCount = await prisma.masterProfile.count();
  const completedOrdersCount = await prisma.order.count({
    where: { status: "COMPLETED" },
  });
  const totalReviewsCount = await prisma.review.count();
  
  const avgRatingAggregate = await prisma.masterProfile.aggregate({
    _avg: { rating: true },
  });
  const platformAvgRating = avgRatingAggregate._avg.rating 
    ? parseFloat(avgRatingAggregate._avg.rating.toFixed(2)) 
    : 4.85;

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Hero Block */}
      <section className="relative bg-cream-light py-20 lg:py-32 overflow-hidden border-b border-cream-dark/20">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#5B3A8E_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purpleBrand/10 text-purpleBrand text-xs font-semibold uppercase tracking-wider mb-6">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Гарантия качества и проверенные анкеты</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-obsidian tracking-tight leading-none mb-6">
              Найдите проверенного <br className="hidden sm:inline" />
              мастера за <span className="text-purpleBrand relative">5 минут</span>
            </h1>
            <p className="text-lg sm:text-xl text-obsidian/75 font-medium max-w-xl mb-8 leading-relaxed">
              Сантехники, электрики, ремонт бытовой техники и другие специалисты в Астане с реальными отзывами и рейтингом.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#catalog"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-obsidian text-cream hover:bg-obsidian-light font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <span>Найти мастера</span>
                <ArrowRight className="h-5 w-5 text-cream" />
              </a>
              <Link
                href="/master/dashboard"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-obsidian border border-cream-dark/30 hover:bg-cream-light font-bold rounded-xl transition-all duration-200"
              >
                <span>Стать мастером на платформе</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Catalog of Services */}
      <section id="catalog" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-obsidian sm:text-4xl">Каталог услуг</h2>
            <p className="mt-4 text-base text-gray-500 font-medium">
              Выберите категорию услуги, ознакомьтесь с анкетами мастеров, их отзывами и ценами.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon] || Wrench;
              return (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="group block rounded-2xl overflow-hidden border border-cream-dark/20 bg-cream-light/35 hover:bg-white transition-all duration-300 premium-card"
                >
                  <div className="h-40 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-white p-2 rounded-xl shadow-md">
                      <IconComponent className="h-5 w-5 text-purpleBrand" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-base text-obsidian group-hover:text-purpleBrand transition-colors line-clamp-1">
                      {category.name}
                    </h3>
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500 font-medium">
                      <span>{category.masterCount} доступно</span>
                      <div className="flex items-center gap-1 text-yellow-500 font-semibold">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{category.avgRating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Why Choose Us */}
      <section className="py-20 bg-cream-light/40 border-y border-cream-dark/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-obsidian">Почему выбирают MasterHub</h2>
            <p className="mt-4 text-base text-gray-500 font-medium">
              Мы создаем цивилизованный рынок бытовых услуг в столице.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl border border-cream-dark/20 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-purpleBrand/10 text-purpleBrand flex items-center justify-center mb-4 font-bold text-xl">
                ✓
              </div>
              <h3 className="font-bold text-obsidian text-base mb-2">Проверенные мастера</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">Каждый исполнитель проходит проверку документов и тестирование.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl border border-cream-dark/20 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-purpleBrand/10 text-purpleBrand flex items-center justify-center mb-4 font-bold text-xl">
                ★
              </div>
              <h3 className="font-bold text-obsidian text-base mb-2">Реальные отзывы</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">Отзывы оставляют только реальные клиенты после выполнения заказа.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl border border-cream-dark/20 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-purpleBrand/10 text-purpleBrand flex items-center justify-center mb-4 font-bold text-xl">
                ₸
              </div>
              <h3 className="font-bold text-obsidian text-base mb-2">Честные цены</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">Стоимость известна заранее, без накруток на месте.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-2xl border border-cream-dark/20 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-purpleBrand/10 text-purpleBrand flex items-center justify-center mb-4 font-bold text-xl">
                ◴
              </div>
              <h3 className="font-bold text-obsidian text-base mb-2">Быстрый выезд</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">Мастер приедет на вызов за 30-40 минут в любой район.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-2xl border border-cream-dark/20 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-purpleBrand/10 text-purpleBrand flex items-center justify-center mb-4 font-bold text-xl">
                ☏
              </div>
              <h3 className="font-bold text-obsidian text-base mb-2">Поддержка клиентов</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">Круглосуточный контроль качества и помощь в решении вопросов.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Active Promotions */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-obsidian">Выгодные предложения</h2>
              <p className="mt-2 text-base text-gray-500 font-medium">Скидки и акции от лучших специалистов города Астана.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="relative bg-greenBrand text-white p-8 rounded-3xl overflow-hidden flex flex-col justify-between h-64 shadow-md"
              >
                {/* Background Pattern */}
                <div className="absolute right-0 bottom-0 opacity-10 font-black text-9xl pointer-events-none select-none -mr-8 -mb-8">
                  %
                </div>
                
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-4">
                    Акция {promo.category ? `• ${promo.category.name}` : ""}
                  </span>
                  <h3 className="text-xl font-bold leading-tight mb-2">{promo.title}</h3>
                  <p className="text-xs text-white/70 font-medium leading-relaxed max-w-xs">{promo.description}</p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-3xl font-extrabold text-cream">{promo.discountText}</span>
                  {promo.category && (
                    <Link
                      href={`/category/${promo.category.slug}`}
                      className="px-4 py-2 bg-cream text-obsidian font-bold text-xs rounded-xl hover:bg-white transition-colors"
                    >
                      Заказать услугу
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Client Reviews */}
      <section className="py-20 bg-cream-light/40 border-t border-cream-dark/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-obsidian">Отзывы довольных клиентов</h2>
            <p className="mt-4 text-base text-gray-500 font-medium">
              Каждый отзыв содержит реальный опыт заказа на нашей платформе.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-6 rounded-2xl border border-cream-dark/20 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {/* Mock Client Avatar */}
                    <div className="w-10 h-10 rounded-full bg-purpleBrand/10 text-purpleBrand flex items-center justify-center font-bold text-sm">
                      {rev.client.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-obsidian">{rev.client.name}</h4>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {new Date(rev.createdAt).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                  </div>
                  <RatingStars rating={rev.rating} showText={false} size={14} />
                  <p className="text-xs text-obsidian/80 leading-relaxed font-medium mt-3 italic">
                    «{rev.text}»
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-cream-dark/15 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                  <span>Выполнил:</span>
                  <Link
                    href={`/master/${rev.masterId}`}
                    className="text-purpleBrand font-semibold hover:underline"
                  >
                    {rev.master.user.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Platform Statistics */}
      <section className="py-16 bg-obsidian text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            
            <div className="space-y-2">
              <div className="inline-flex p-3 bg-white/5 rounded-2xl mb-2">
                <Users className="h-6 w-6 text-purpleBrand" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-cream">{mastersCount}</p>
              <p className="text-xs sm:text-sm text-cream-light/60 font-semibold uppercase tracking-wider">Проверенных мастеров</p>
            </div>

            <div className="space-y-2">
              <div className="inline-flex p-3 bg-white/5 rounded-2xl mb-2">
                <CheckSquare className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-cream">{completedOrdersCount}</p>
              <p className="text-xs sm:text-sm text-cream-light/60 font-semibold uppercase tracking-wider">Выполненных заказов</p>
            </div>

            <div className="space-y-2">
              <div className="inline-flex p-3 bg-white/5 rounded-2xl mb-2">
                <Star className="h-6 w-6 text-yellow-500 fill-current" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-cream">{platformAvgRating} / 5</p>
              <p className="text-xs sm:text-sm text-cream-light/60 font-semibold uppercase tracking-wider">Средний рейтинг</p>
            </div>

            <div className="space-y-2">
              <div className="inline-flex p-3 bg-white/5 rounded-2xl mb-2">
                <MessageSquare className="h-6 w-6 text-blue-400" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-cream">{totalReviewsCount}</p>
              <p className="text-xs sm:text-sm text-cream-light/60 font-semibold uppercase tracking-wider">Настоящих отзывов</p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
