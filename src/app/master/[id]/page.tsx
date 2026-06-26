import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import RatingStars from "@/components/RatingStars";
import BookingForm from "@/components/BookingForm";
import { 
  MapPin, Briefcase, Award, ArrowLeft, Star, 
  ShieldCheck, Hammer, MessageSquare, Check, Calendar
} from "lucide-react";

interface MasterPageProps {
  params: { id: string };
}

export const revalidate = 0; // Refresh data on request

export default async function MasterPage({ params }: MasterPageProps) {
  // 1. Fetch Master Profile
  // 1. Fetch Master Profile
  let master: any = null;
  try {
    master = await prisma.masterProfile.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        categories: true,
        portfolio: true,
        reviews: {
          include: {
            client: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  } catch (e) {
    console.error("Failed to fetch master:", e);
  }

  if (master) {
    if (typeof master.districts === "string") {
      try { master.districts = JSON.parse(master.districts); } catch (e) { master.districts = []; }
    }
    if (typeof master.certificates === "string") {
      try { master.certificates = JSON.parse(master.certificates); } catch (e) { master.certificates = []; }
    }
  }

  if (!master) {
    const allMockMasters: Record<string, any> = {
      "master_askar": {
        id: "master_askar",
        userId: "user_askar",
        description: "Профессиональный сантехник со стажем более 12 лет. Устранение любых засоров, монтаж отопления, водоснабжения и теплых полов. Имею все необходимые инструменты. Работаю быстро, чисто и с гарантией.",
        age: 40,
        experienceYears: 12,
        basePrice: 5000,
        rating: 4.9,
        ordersCount: 142,
        reviewsCount: 3,
        districts: ["Есиль", "Нура", "Сарыарка"],
        certificates: ["Сертификат монтажника Rehau", "Диплом слесаря-сантехника V разряда"],
        isVip: true,
        categories: [{ name: "Сантехники", slug: "plumbers" }],
        portfolio: [
          { id: "p1", imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80", description: "Разводка труб водоснабжения REHAU" },
          { id: "p2", imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80", description: "Установка инсталляции" }
        ],
        reviews: [
          { id: "r1", client: { name: "Алия Сабитова" }, rating: 5, text: "Отличный мастер! Приехал вовремя, быстро определил проблему.", createdAt: new Date() }
        ],
        user: { name: "Аскар Ибраев", email: "askar@masterhub.kz", phone: "+7 (777) 111-22-33" }
      },
      "master_dias": {
        id: "master_dias",
        userId: "user_dias",
        description: "Электрик высшего разряда. Полная и частичная замена проводки в квартирах и офисах. Установка и ремонт розеток, выключателей, люстр, сборка электрощитов любой сложности. Соблюдение ПУЭ.",
        age: 34,
        experienceYears: 8,
        basePrice: 4000,
        rating: 4.8,
        ordersCount: 96,
        reviewsCount: 2,
        districts: ["Алматы", "Сарыарка", "Байконур"],
        certificates: ["IV группа допуска по электробезопасности"],
        isVip: false,
        categories: [{ name: "Электрики", slug: "electricians" }],
        portfolio: [],
        reviews: [],
        user: { name: "Диас Султанов", email: "dias@masterhub.kz", phone: "+7 (777) 222-33-44" }
      },
      "master_vladimir": {
        id: "master_vladimir",
        userId: "user_vladimir",
        description: "Инженер-электрик с высшим профильным образованием и 20-летним стажем. Разработка схем электроснабжения, монтаж сложных систем освещения и автоматизации, поиск скрытых обрывов проводки.",
        age: 52,
        experienceYears: 20,
        basePrice: 8000,
        rating: 5.0,
        ordersCount: 240,
        reviewsCount: 2,
        districts: ["Есиль", "Нура", "Алматы", "Сарыарка", "Байконур"],
        certificates: ["Диплом инженера-электрика АЭУ", "V группа допуска по электробезопасности (до и выше 1000В)"],
        isVip: true,
        categories: [{ name: "Электрики", slug: "electricians" }],
        portfolio: [],
        reviews: [],
        user: { name: "Владимир Козлов", email: "vladimir@masterhub.kz", phone: "+7 (777) 777-88-99" }
      },
      "master_sergey": {
        id: "master_sergey",
        userId: "user_sergey",
        description: "Ремонт стиральных и посудомоечных машин, холодильников, электроплит и духовок. Оригинальные запчасти в наличии, выезд во все районы Астаны. Диагностика бесплатная при выполнении ремонта.",
        age: 45,
        experienceYears: 15,
        basePrice: 6000,
        rating: 4.95,
        ordersCount: 310,
        reviewsCount: 2,
        districts: ["Есиль", "Нура", "Алматы", "Сарыарка", "Байконур"],
        certificates: ["Авторизованный мастер Bosch, Samsung, LG"],
        isVip: true,
        categories: [{ name: "Ремонт бытовой техники", slug: "appliances" }],
        portfolio: [],
        reviews: [],
        user: { name: "Сергей Петров", email: "sergey@masterhub.kz", phone: "+7 (777) 333-44-55" }
      },
      "master_bauyrzhan": {
        id: "master_bauyrzhan",
        userId: "user_bauyrzhan",
        description: "Экстренное аварийное вскрытие замков без повреждения двери. Замена и ремонт замков, личинок, ручек, установка задвижек. В наличии большой ассортимент замков от мировых брендов (Mottura, Cisa, Border).",
        age: 29,
        experienceYears: 6,
        basePrice: 5000,
        rating: 4.7,
        ordersCount: 82,
        reviewsCount: 2,
        districts: ["Алматы", "Сарыарка", "Есиль"],
        certificates: ["Сертификат соответствия слесарных работ по замкам"],
        isVip: false,
        categories: [{ name: "Замки и двери", slug: "locks" }],
        portfolio: [],
        reviews: [],
        user: { name: "Бауыржан Нурланов", email: "bauyrzhan@masterhub.kz", phone: "+7 (777) 444-55-66" }
      },
      "master_kanat": {
        id: "master_kanat",
        userId: "user_kanat",
        description: "Профессиональный монтаж, демонтаж, чистка и заправка кондиционеров фреоном. Устранение неприятных запахов, течи, ремонт электроники. Быстрый выезд в день обращения.",
        age: 31,
        experienceYears: 5,
        basePrice: 7000,
        rating: 4.65,
        ordersCount: 54,
        reviewsCount: 1,
        districts: ["Есиль", "Нура", "Алматы"],
        certificates: ["Сертификат специалиста климатического оборудования Daikin"],
        isVip: false,
        categories: [{ name: "Кондиционеры", slug: "ac" }],
        portfolio: [],
        reviews: [],
        user: { name: "Канат Сериков", email: "kanat@masterhub.kz", phone: "+7 (777) 555-66-77" }
      }
    };
    master = allMockMasters[params.id] || allMockMasters["master_askar"];
  }

  if (!master) {
    notFound();
  }

  // 2. Fetch Session to check if user can book
  const session = await getSession();
  const isClient = session?.role === "CLIENT";

  // Helper function to get mock avatars
  const getAvatarUrl = (name: string) => {
    if (name.includes("Аскар")) return "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=120&q=80";
    if (name.includes("Диас")) return "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=120&q=80";
    if (name.includes("Сергей")) return "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80";
    if (name.includes("Бауыржан")) return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80";
    if (name.includes("Канат")) return "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80";
    if (name.includes("Владимир")) return "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80";
    return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80";
  };

  const avatar = getAvatarUrl(master.user.name);
  const backSlug = master.categories[0]?.slug || "";

  return (
    <div className="bg-cream-light/30 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumbs */}
        <div className="mb-6">
          <Link
            href={backSlug ? `/category/${backSlug}` : "/"}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-purpleBrand transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Назад к списку мастеров</span>
          </Link>
        </div>

        {/* Master Profile Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main profile contents (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Header Detail Card */}
            <div className="bg-white rounded-3xl border border-cream-dark/20 p-6 sm:p-8 shadow-sm relative overflow-hidden">
              {master.isVip && (
                <div className="absolute top-0 right-0 bg-purpleBrand text-white text-[10px] font-bold uppercase px-3 py-1 rounded-bl-xl tracking-wider flex items-center gap-1 shadow-sm">
                  <Star className="h-3 w-3 fill-current" />
                  VIP Специалист
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 border border-cream-dark/15">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatar}
                    alt={master.user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-obsidian">{master.user.name}</h1>
                    <span className="text-[10px] text-greenBrand bg-greenBrand/15 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Проверен
                    </span>
                  </div>
                  
                  {/* Rating indicator */}
                  <RatingStars rating={master.rating} reviewsCount={master.reviewsCount} size={18} />

                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-500">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4 text-purpleBrand" />
                      Стаж работы: {master.experienceYears} лет
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-purpleBrand" />
                      Возраст: {master.age} лет
                    </span>
                    <span className="flex items-center gap-1">
                      <Hammer className="h-4 w-4 text-purpleBrand" />
                      Заказов выполнено: {master.ordersCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Description / Biography */}
            <div className="bg-white rounded-3xl border border-cream-dark/20 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-obsidian pb-3 border-b border-cream-dark/15 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purpleBrand" />
                О мастере
              </h2>
              <p className="text-sm text-obsidian/85 leading-relaxed font-medium whitespace-pre-line">
                {master.description}
              </p>
            </div>

            {/* 3. Certificates & Qualifications */}
            {master.certificates.length > 0 && (
              <div className="bg-white rounded-3xl border border-cream-dark/20 p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-obsidian pb-3 border-b border-cream-dark/15 flex items-center gap-2">
                  <Award className="h-5 w-5 text-purpleBrand" />
                  Сертификаты и дипломы
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {master.certificates.map((cert: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-cream-light/30 border border-cream-dark/10">
                      <Check className="h-4 w-4 text-greenBrand shrink-0 mt-0.5" />
                      <span className="text-xs text-obsidian/80 font-semibold leading-normal">{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 4. Portfolio Works Gallery */}
            <div className="bg-white rounded-3xl border border-cream-dark/20 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-obsidian pb-3 border-b border-cream-dark/15 flex items-center gap-2">
                <Hammer className="h-5 w-5 text-purpleBrand" />
                Примеры работ
              </h2>
              {master.portfolio.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Примеры работ еще не добавлены.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {master.portfolio.map((work: any) => (
                    <div key={work.id} className="group overflow-hidden rounded-2xl border border-cream-dark/15 bg-cream-light/10">
                      <div className="h-48 overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={work.imageUrl}
                          alt={work.description}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-350"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-obsidian font-semibold leading-relaxed line-clamp-2">{work.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Reviews List Section */}
            <div className="bg-white rounded-3xl border border-cream-dark/20 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-obsidian pb-3 border-b border-cream-dark/15 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purpleBrand" />
                Отзывы клиентов ({master.reviews.length})
              </h2>
              {master.reviews.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Отзывов об этом мастере пока нет. Будьте первыми!</p>
              ) : (
                <div className="space-y-4 divider-y">
                  {master.reviews.map((rev: any) => (
                    <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-2 border-b last:border-0 border-cream-dark/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purpleBrand/15 text-purpleBrand font-bold text-xs flex items-center justify-center">
                            {rev.client.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-obsidian">{rev.client.name}</h4>
                            <p className="text-[10px] text-gray-400 font-semibold">
                              {new Date(rev.createdAt).toLocaleDateString("ru-RU")}
                            </p>
                          </div>
                        </div>
                        <RatingStars rating={rev.rating} showText={false} size={12} />
                      </div>
                      <p className="text-xs text-obsidian/80 font-medium leading-relaxed italic pl-10">
                        «{rev.text}»
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Pricing Details & Booking Form Sidebar (Right Column) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-cream-dark/20 p-6 shadow-sm space-y-6">
              
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Стоимость выезда</span>
                <span className="text-3xl font-black text-obsidian">
                  от {master.basePrice.toLocaleString()} ₸
                </span>
                <span className="text-[10px] text-gray-500 font-semibold block pt-1">
                  *Включает консультацию и базовую диагностику на месте
                </span>
              </div>

              <div className="border-t border-cream-dark/15 pt-6">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">Зона обслуживания</span>
                <ul className="space-y-2 text-xs font-semibold text-gray-600">
                  <li className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-purpleBrand shrink-0 mt-0.5" />
                    <span>Районы: {master.districts.join(", ")}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <BookingForm
                  masterId={master.id}
                  masterName={master.user.name}
                  basePrice={master.basePrice}
                  isLoggedIn={!!session}
                />
                {!session && (
                  <p className="text-[10px] text-gray-500 text-center font-medium mt-3">
                    Пожалуйста, <Link href="/auth/login" className="text-purpleBrand font-bold hover:underline">войдите в систему</Link>, чтобы заказать услуги этого мастера.
                  </p>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
