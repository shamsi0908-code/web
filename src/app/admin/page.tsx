import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import Link from "next/link";
import RatingStars from "@/components/RatingStars";
import { 
  deleteReview, togglePromotion, createPromotion 
} from "@/app/actions";
import { 
  ShieldAlert, Users, Award, ClipboardList, Coins, 
  MessageSquare, Plus, Trash2, EyeOff, Eye, CheckCircle2, UserCheck
} from "lucide-react";

export const revalidate = 0; // Fresh data

export default async function AdminPage() {
  const session = await getSession();

  // Guard: Not logged in or not admin
  if (!session || session.role !== "ADMIN") {
    return (
      <div className="bg-cream-light/30 min-h-screen py-20 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-cream-dark/20 p-8 text-center space-y-4 shadow-sm">
          <ShieldAlert className="h-12 w-12 text-red-600 mx-auto" />
          <h1 className="text-xl font-bold text-obsidian">Доступ ограничен</h1>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Пожалуйста, выберите демо-роль <span className="font-semibold text-red-600">Администратор</span> в панели демо-аккаунта в правом верхнем углу сайта для просмотра этого кабинета.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-obsidian text-cream hover:bg-obsidian-light text-xs font-bold rounded-xl transition-all"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  // 1. Fetch System Metrics
  const usersCount = await prisma.user.count();
  const mastersCount = await prisma.masterProfile.count();
  const orders = await prisma.order.findMany({});
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const totalVolume = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const platformRevenue = totalVolume * 0.1; // 10% Platform fee commission

  // 2. Fetch Lists
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const reviews = await prisma.review.findMany({
    include: {
      client: true,
      master: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const promotions = await prisma.promotion.findMany({
    include: { category: true },
    orderBy: { id: "asc" },
  });

  const categories = await prisma.category.findMany({});

  // 3. Server Action wrapper handlers
  const handleTogglePromo = async (formData: FormData) => {
    "use server";
    const promoId = formData.get("promoId") as string;
    const isActiveStr = formData.get("isActive") as string;
    const isActive = isActiveStr === "true";
    await togglePromotion(promoId, !isActive);
  };

  const handleDeleteReview = async (formData: FormData) => {
    "use server";
    const reviewId = formData.get("reviewId") as string;
    await deleteReview(reviewId);
  };

  const handleCreatePromo = async (formData: FormData) => {
    "use server";
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const discountText = formData.get("discountText") as string;
    const categoryId = formData.get("categoryId") as string;
    
    if (title && description && discountText) {
      await createPromotion(title, description, discountText, categoryId || undefined);
    }
  };

  return (
    <div className="bg-cream-light/30 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="bg-white rounded-3xl border border-cream-dark/20 p-6 sm:p-8 shadow-sm mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-obsidian flex items-center gap-2">
              <ShieldAlert className="h-7 w-7 text-red-600" />
              Панель администратора
            </h1>
            <p className="text-xs text-gray-500 font-semibold mt-1 uppercase tracking-wide">
              Аналитика платформы MasterHub Astana
            </p>
          </div>
        </div>

        {/* 4 Stats counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-white p-5 rounded-2xl border border-cream-dark/20 shadow-sm text-center">
            <Coins className="h-5 w-5 text-greenBrand mx-auto mb-2" />
            <p className="text-lg font-black text-obsidian">₸ {platformRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Доход сервиса (комиссия 10%)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-dark/20 shadow-sm text-center">
            <ClipboardList className="h-5 w-5 text-purpleBrand mx-auto mb-2" />
            <p className="text-lg font-black text-obsidian">{completedOrders.length} / {orders.length}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Заказов (Выполнено / Всего)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-dark/20 shadow-sm text-center">
            <Users className="h-5 w-5 text-blue-500 mx-auto mb-2" />
            <p className="text-lg font-black text-obsidian">{usersCount}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Всего пользователей</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-dark/20 shadow-sm text-center">
            <UserCheck className="h-5 w-5 text-purpleBrand mx-auto mb-2" />
            <p className="text-lg font-black text-obsidian">{mastersCount}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Активных мастеров</p>
          </div>

        </div>

        {/* Main Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left: Reviews Moderation Queue (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Reviews list */}
            <div className="bg-white rounded-3xl border border-cream-dark/20 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-obsidian flex items-center gap-2 pb-4 border-b border-cream-dark/15">
                <MessageSquare className="h-5 w-5 text-purpleBrand" />
                Модерация отзывов ({reviews.length})
              </h2>

              {reviews.length === 0 ? (
                <p className="text-xs text-gray-400 italic font-medium">Отзывов на платформе пока нет.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl border border-cream-dark/10 bg-cream-light/10 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <p className="text-xs text-obsidian font-semibold">
                            Отправитель: <span className="font-bold">{rev.client.name}</span>
                          </p>
                          <p className="text-[10px] text-gray-400 font-semibold">
                            Получатель: <span className="font-bold text-purpleBrand">{rev.master.user.name}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <RatingStars rating={rev.rating} showText={false} size={12} />
                          <form action={handleDeleteReview}>
                            <input type="hidden" name="reviewId" value={rev.id} />
                            <button
                              type="submit"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-100 shadow-sm"
                              title="Удалить отзыв"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </form>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 italic leading-relaxed font-semibold bg-white p-3 rounded-lg border border-cream-dark/10">
                        «{rev.text}»
                      </p>
                      <p className="text-[9px] text-gray-400 text-right">
                        Дата: {new Date(rev.createdAt).toLocaleString("ru-RU")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Users listing */}
            <div className="bg-white rounded-3xl border border-cream-dark/20 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-obsidian flex items-center gap-2 pb-4 border-b border-cream-dark/15">
                <Users className="h-5 w-5 text-purpleBrand" />
                Список пользователей ({users.length})
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-obsidian font-semibold">
                  <thead>
                    <tr className="border-b border-cream-dark/15 text-gray-400 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-2">Имя</th>
                      <th className="py-3 px-2">Роль</th>
                      <th className="py-3 px-2">Контакты</th>
                      <th className="py-3 px-2">Зарегистрирован</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-dark/10">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-cream-light/30">
                        <td className="py-3 px-2">{u.name}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                            u.role === "ADMIN" 
                              ? "bg-red-50 text-red-600 border border-red-100" 
                              : u.role === "MASTER" 
                              ? "bg-greenBrand/15 text-greenBrand" 
                              : "bg-purpleBrand/10 text-purpleBrand"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-medium">
                          <p>{u.phone}</p>
                          <p className="text-[10px] text-gray-400">{u.email}</p>
                        </td>
                        <td className="py-3 px-2 font-medium text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString("ru-RU")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right: Promotions Management Sidebar (1 col) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Create Promo Box */}
            <div className="bg-white p-6 rounded-3xl border border-cream-dark/20 shadow-sm space-y-4">
              <h3 className="font-bold text-obsidian text-sm border-b border-cream-dark/15 pb-3 flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-purpleBrand" />
                Создать акцию
              </h3>
              <form action={handleCreatePromo} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Название акции
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Например: Скидка 20% на сантехнику"
                    className="w-full rounded-xl border-cream-dark/30 bg-cream-light/35 text-xs p-3 focus:outline-none focus:border-purpleBrand focus:bg-white border text-obsidian font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Описание акции
                  </label>
                  <input
                    type="text"
                    name="description"
                    placeholder="Подробности специального предложения"
                    className="w-full rounded-xl border-cream-dark/30 bg-cream-light/35 text-xs p-3 focus:outline-none focus:border-purpleBrand focus:bg-white border text-obsidian font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Размер скидки
                    </label>
                    <input
                      type="text"
                      name="discountText"
                      placeholder="-20% / 0 ₸"
                      className="w-full rounded-xl border-cream-dark/30 bg-cream-light/35 text-xs p-3 focus:outline-none focus:border-purpleBrand focus:bg-white border text-obsidian font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Категория
                    </label>
                    <select
                      name="categoryId"
                      className="w-full rounded-xl border-cream-dark/30 bg-cream-light/35 text-xs p-3 focus:outline-none focus:border-purpleBrand focus:bg-white border text-obsidian font-bold"
                    >
                      <option value="">Все категории</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-obsidian text-cream text-xs font-bold py-2.5 rounded-xl hover:bg-obsidian-light"
                >
                  Создать акцию
                </button>
              </form>
            </div>

            {/* List and toggle promos */}
            <div className="bg-white p-6 rounded-3xl border border-cream-dark/20 shadow-sm space-y-4">
              <h3 className="font-bold text-obsidian text-sm border-b border-cream-dark/15 pb-3">
                Активные акции ({promotions.length})
              </h3>
              
              <div className="space-y-3">
                {promotions.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 border border-cream-dark/10 rounded-xl flex items-center justify-between gap-3 text-xs bg-cream-light/10"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-obsidian truncate">{p.title}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold">{p.discountText}</p>
                    </div>
                    <form action={handleTogglePromo}>
                      <input type="hidden" name="promoId" value={p.id} />
                      <input type="hidden" name="isActive" value={String(p.isActive)} />
                      <button
                        type="submit"
                        className={`p-1.5 rounded-lg border transition-colors shadow-sm ${
                          p.isActive
                            ? "bg-greenBrand/10 border-greenBrand/20 text-greenBrand"
                            : "bg-red-50 border-red-100 text-red-600"
                        }`}
                        title={p.isActive ? "Выключить акцию" : "Включить акцию"}
                      >
                        {p.isActive ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
