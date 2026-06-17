import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import Link from "next/link";
import RatingStars from "@/components/RatingStars";
import { 
  updateOrderStatus, addPortfolioItem, updateMasterPrice 
} from "@/app/actions";
import { 
  Briefcase, Star, ClipboardList, Coins, ShieldAlert, 
  MapPin, Calendar, Clock, Check, Plus, MessageSquare, Award, CheckCircle2
} from "lucide-react";

export const revalidate = 0; // Fresh data

export default async function MasterDashboardPage() {
  const session = await getSession();

  // Guard: Not logged in or not a master
  if (!session || session.role !== "MASTER") {
    return (
      <div className="bg-cream-light/30 min-h-screen py-20 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-cream-dark/20 p-8 text-center space-y-4 shadow-sm">
          <ShieldAlert className="h-12 w-12 text-greenBrand mx-auto" />
          <h1 className="text-xl font-bold text-obsidian">Доступ ограничен</h1>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Пожалуйста, выберите демо-роль <span className="font-semibold text-greenBrand">Мастер</span> в панели демо-аккаунта в правом верхнем углу сайта для просмотра этого кабинета.
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

  // Fetch Master Profile
  const master = await prisma.masterProfile.findUnique({
    where: { userId: session.userId },
    include: {
      user: true,
      categories: true,
      portfolio: true,
      orders: {
        include: {
          client: true,
        },
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        include: {
          client: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (master) {
    if (typeof master.districts === "string") {
      try { master.districts = JSON.parse(master.districts); } catch (e) { master.districts = []; }
    }
    if (typeof master.certificates === "string") {
      try { master.certificates = JSON.parse(master.certificates); } catch (e) { master.certificates = []; }
    }
  }

  if (!master) {
    return (
      <div className="bg-cream-light/30 min-h-screen py-20 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-cream-dark/20 p-8 text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="text-lg font-bold text-obsidian font-sans">Профиль мастера не найден</h1>
          <p className="text-xs text-gray-500">
            Для вашего аккаунта не настроена анкета мастера в базе данных.
          </p>
        </div>
      </div>
    );
  }

  // Order groupings
  const pendingOrders = master.orders.filter((o) => o.status === "PENDING");
  const activeOrders = master.orders.filter((o) => o.status === "ACCEPTED");
  const pastOrders = master.orders.filter((o) => o.status === "COMPLETED" || o.status === "CANCELLED");

  // Calculations for dashboard metrics
  const completedCount = master.orders.filter((o) => o.status === "COMPLETED").length;
  
  // Platform Commission model: 10%
  const totalRevenue = master.orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.totalPrice, 0);
  const netEarnings = totalRevenue * 0.9; // 90% stays with master, 10% platform fee

  // Server actions wrapper handlers
  const handleAcceptOrder = async (formData: FormData) => {
    "use server";
    const orderId = formData.get("orderId") as string;
    await updateOrderStatus(orderId, "ACCEPTED");
  };

  const handleDeclineOrder = async (formData: FormData) => {
    "use server";
    const orderId = formData.get("orderId") as string;
    await updateOrderStatus(orderId, "CANCELLED");
  };

  const handleCompleteOrder = async (formData: FormData) => {
    "use server";
    const orderId = formData.get("orderId") as string;
    await updateOrderStatus(orderId, "COMPLETED");
  };

  const handleUpdatePrice = async (formData: FormData) => {
    "use server";
    const basePriceStr = formData.get("basePrice") as string;
    const basePrice = parseFloat(basePriceStr);
    if (!isNaN(basePrice) && basePrice > 0) {
      await updateMasterPrice(master.id, basePrice);
    }
  };

  const handleAddPortfolio = async (formData: FormData) => {
    "use server";
    const imageUrl = formData.get("imageUrl") as string;
    const description = formData.get("description") as string;
    if (imageUrl && description) {
      await addPortfolioItem({
        masterProfileId: master.id,
        imageUrl,
        description,
      });
    }
  };

  return (
    <div className="bg-cream-light/30 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Master Profile Summary Banner */}
        <div className="bg-white rounded-3xl border border-cream-dark/20 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-obsidian">{master.user.name}</h1>
                <span className="text-[10px] text-greenBrand bg-greenBrand/15 px-2.5 py-0.5 rounded font-bold uppercase">
                  {master.categories[0]?.name || "Мастер"}
                </span>
                {master.isVip && (
                  <span className="text-[10px] text-purpleBrand bg-purpleBrand/15 px-2.5 py-0.5 rounded font-bold uppercase">
                    VIP
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-semibold mt-1 uppercase tracking-wide">Рабочий кабинет исполнителя</p>
            </div>
            <div className="text-xs font-semibold text-gray-500 space-y-0.5">
              <p>Тариф выезда: <span className="font-bold text-obsidian">{master.basePrice.toLocaleString()} ₸</span></p>
              <p>Районы работы: <span className="font-bold text-obsidian">{master.districts.join(", ")}</span></p>
            </div>
          </div>
        </div>

        {/* 4 Statistics counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-white p-5 rounded-2xl border border-cream-dark/20 shadow-sm text-center">
            <Coins className="h-5 w-5 text-greenBrand mx-auto mb-2" />
            <p className="text-lg font-black text-obsidian">₸ {netEarnings.toLocaleString()}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Доход (чистый, -10%)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-dark/20 shadow-sm text-center">
            <Briefcase className="h-5 w-5 text-purpleBrand mx-auto mb-2" />
            <p className="text-lg font-black text-obsidian">{completedCount}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Заказов завершено</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-dark/20 shadow-sm text-center">
            <Star className="h-5 w-5 text-yellow-500 mx-auto mb-2 fill-current" />
            <p className="text-lg font-black text-obsidian">{master.rating}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Средний рейтинг</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-dark/20 shadow-sm text-center">
            <MessageSquare className="h-5 w-5 text-blue-400 mx-auto mb-2" />
            <p className="text-lg font-black text-obsidian">{master.reviewsCount}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Отзывов получено</p>
          </div>

        </div>

        {/* Main Columns layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Bookings List Column (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. New Incoming Requests (PENDING) */}
            <div className="bg-white rounded-3xl border border-cream-dark/20 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-obsidian flex items-center gap-2 pb-4 border-b border-cream-dark/15">
                <ClipboardList className="h-5 w-5 text-yellow-500" />
                Новые заявки ({pendingOrders.length})
              </h2>

              {pendingOrders.length === 0 ? (
                <p className="text-xs text-gray-400 font-medium italic">Новых заявок пока нет.</p>
              ) : (
                <div className="space-y-4">
                  {pendingOrders.map((order) => (
                    <div key={order.id} className="border border-cream-dark/15 rounded-2xl p-5 bg-yellow-50/20 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                          <h4 className="font-bold text-sm text-obsidian">Клиент: {order.client.name}</h4>
                          <p className="text-[10px] text-gray-400 font-semibold">{order.client.phone}</p>
                        </div>
                        <span className="text-xs font-bold text-yellow-700">Ожидает ответа</span>
                      </div>
                      <p className="text-xs text-gray-600 font-semibold bg-white p-3 rounded-lg border border-cream-dark/10">
                        {order.description}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-semibold text-gray-500 gap-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-purpleBrand" />
                          {new Date(order.scheduledAt).toLocaleString("ru-RU")}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-red-400" />
                          {order.address}
                        </span>
                        <span className="font-bold text-obsidian">₸ {order.totalPrice.toLocaleString()}</span>
                      </div>

                      {/* Accept / Decline Forms */}
                      <div className="flex justify-end gap-2 pt-2">
                        <form action={handleDeclineOrder}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <button type="submit" className="px-4 py-2 border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50">
                            Отклонить
                          </button>
                        </form>
                        <form action={handleAcceptOrder}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <button type="submit" className="px-4 py-2 bg-greenBrand text-white text-xs font-bold rounded-xl hover:bg-greenBrand-hover">
                            Принять заказ
                          </button>
                        </form>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Active Orders In Progress (ACCEPTED) */}
            <div className="bg-white rounded-3xl border border-cream-dark/20 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-obsidian flex items-center gap-2 pb-4 border-b border-cream-dark/15">
                <ClipboardList className="h-5 w-5 text-purpleBrand" />
                В процессе выполнения ({activeOrders.length})
              </h2>

              {activeOrders.length === 0 ? (
                <p className="text-xs text-gray-400 font-medium italic">Нет активных заказов в работе.</p>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <div key={order.id} className="border border-cream-dark/15 rounded-2xl p-5 bg-purpleBrand/5/5 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                          <h4 className="font-bold text-sm text-obsidian">Клиент: {order.client.name}</h4>
                          <p className="text-[10px] text-gray-400 font-semibold">{order.client.phone}</p>
                        </div>
                        <span className="text-xs font-bold text-purpleBrand uppercase tracking-wider">В работе</span>
                      </div>
                      <p className="text-xs text-gray-600 font-semibold bg-white p-3 rounded-lg border border-cream-dark/10">
                        {order.description}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-semibold text-gray-500 gap-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-purpleBrand" />
                          {new Date(order.scheduledAt).toLocaleString("ru-RU")}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-red-400" />
                          {order.address}
                        </span>
                        <span className="font-bold text-obsidian">₸ {order.totalPrice.toLocaleString()}</span>
                      </div>

                      {/* Complete Form button */}
                      <div className="flex justify-end pt-2 border-t border-cream-dark/10">
                        <form action={handleCompleteOrder}>
                          <input type="hidden" name="orderId" value={order.id} />
                          <button type="submit" className="flex items-center gap-1 px-4 py-2 bg-obsidian text-cream text-xs font-bold rounded-xl hover:bg-obsidian-light">
                            <Check className="h-3.5 w-3.5" />
                            Завершить работу
                          </button>
                        </form>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Master Reviews Section */}
            <div className="bg-white rounded-3xl border border-cream-dark/20 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-obsidian flex items-center gap-2 pb-4 border-b border-cream-dark/15">
                <MessageSquare className="h-5 w-5 text-purpleBrand" />
                Отзывы о вашей работе ({master.reviews.length})
              </h2>
              {master.reviews.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Отзывов пока нет.</p>
              ) : (
                <div className="space-y-4">
                  {master.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl border border-cream-dark/10 text-xs space-y-2 bg-cream-light/10">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-obsidian">{rev.client.name}</span>
                        <RatingStars rating={rev.rating} showText={false} size={12} />
                      </div>
                      <p className="italic text-gray-600 font-medium">«{rev.text}»</p>
                      <p className="text-[10px] text-gray-400 text-right">
                        {new Date(rev.createdAt).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Editor Sidebars (Price and Portfolio Tools) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Price Edit Box */}
            <div className="bg-white p-6 rounded-3xl border border-cream-dark/20 shadow-sm space-y-4">
              <h3 className="font-bold text-obsidian text-sm border-b border-cream-dark/15 pb-3">
                Редактирование цен
              </h3>
              <form action={handleUpdatePrice} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Тариф на выезд (₸)
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    defaultValue={master.basePrice}
                    placeholder="Например: 5000"
                    className="w-full rounded-xl border-cream-dark/30 bg-cream-light/35 text-xs p-3 focus:outline-none focus:border-purpleBrand focus:bg-white border text-obsidian font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-obsidian text-cream text-xs font-bold py-2.5 rounded-xl hover:bg-obsidian-light"
                >
                  Обновить цену
                </button>
              </form>
            </div>

            {/* Portfolio Add Box */}
            <div className="bg-white p-6 rounded-3xl border border-cream-dark/20 shadow-sm space-y-4">
              <h3 className="font-bold text-obsidian text-sm border-b border-cream-dark/15 pb-3 flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-purpleBrand" />
                Добавить фото работы
              </h3>
              <form action={handleAddPortfolio} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Ссылка на изображение (URL)
                  </label>
                  <input
                    type="text"
                    name="imageUrl"
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border-cream-dark/30 bg-cream-light/35 text-xs p-3 focus:outline-none focus:border-purpleBrand focus:bg-white border text-obsidian font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Описание работы
                  </label>
                  <input
                    type="text"
                    name="description"
                    placeholder="Установка смесителя, прокладка проводки..."
                    className="w-full rounded-xl border-cream-dark/30 bg-cream-light/35 text-xs p-3 focus:outline-none focus:border-purpleBrand focus:bg-white border text-obsidian font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-purpleBrand text-white text-xs font-bold py-2.5 rounded-xl hover:bg-purpleBrand-hover"
                >
                  Добавить в портфолио
                </button>
              </form>
            </div>

            {/* List of current Portfolio works */}
            <div className="bg-white p-6 rounded-3xl border border-cream-dark/20 shadow-sm space-y-4">
              <h3 className="font-bold text-obsidian text-sm border-b border-cream-dark/15 pb-3">
                Ваше портфолио ({master.portfolio.length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {master.portfolio.map((p) => (
                  <div key={p.id} className="relative rounded-lg overflow-hidden h-20 border border-cream-dark/10 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imageUrl}
                      alt={p.description}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1.5 text-[8px] text-white font-medium text-center leading-normal">
                      {p.description}
                    </div>
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
