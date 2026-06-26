import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import Link from "next/link";
import RatingStars from "@/components/RatingStars";
import ReviewModal from "@/components/ReviewModal";
import { updateOrderStatus } from "@/app/actions";
import { 
  Calendar, MapPin, Clock, Star, MessageSquare, 
  Settings, Heart, ClipboardList, ShieldAlert, CheckCircle2 
} from "lucide-react";

export const revalidate = 0; // Fresh data

export default async function ClientDashboardPage() {
  const session = await getSession();

  // Guard: Not logged in or not a client
  if (!session || session.role !== "CLIENT") {
    return (
      <div className="bg-cream-light/30 min-h-screen py-20 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-cream-dark/20 p-8 text-center space-y-4 shadow-sm">
          <ShieldAlert className="h-12 w-12 text-purpleBrand mx-auto" />
          <h1 className="text-xl font-bold text-obsidian">Доступ ограничен</h1>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Пожалуйста, <Link href="/auth/login" className="text-purpleBrand font-bold hover:underline">войдите в систему</Link> под учетной записью с ролью <span className="font-semibold text-purpleBrand">Заказчик (Клиент)</span> для просмотра этого кабинета.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/auth/login"
              className="inline-block px-6 py-2.5 bg-purpleBrand text-white hover:bg-purpleBrand-hover text-xs font-bold rounded-xl transition-all"
            >
              Войти
            </Link>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 bg-obsidian text-cream hover:bg-obsidian-light text-xs font-bold rounded-xl transition-all"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fetch client details
  let clientUser: any = null;
  try {
    clientUser = await prisma.user.findUnique({
      where: { id: session.userId },
    });
  } catch (e) {
    console.error("Failed to fetch clientUser:", e);
  }

  if (!clientUser) {
    clientUser = {
      id: session.userId,
      name: session.name,
      email: session.email,
      phone: "+7 (701) 555-11-22"
    };
  }

  // Fetch orders
  let orders: any[] = [];
  try {
    orders = await prisma.order.findMany({
      where: { clientId: session.userId },
      include: {
        master: {
          include: {
            user: true,
            categories: true,
          },
        },
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("Failed to fetch client orders:", e);
    // fallback empty orders or simulated demo order
    orders = [
      {
        id: "order_demo_1",
        clientId: session.userId,
        masterId: "master_askar",
        status: "COMPLETED",
        scheduledAt: new Date(),
        address: "пр. Мангилик Ел 55а",
        description: "Установка нового смесителя в ванной комнате",
        totalPrice: 5000,
        master: {
          id: "master_askar",
          user: { name: "Аскар Ибраев" },
          categories: [{ name: "Сантехники", slug: "plumbers" }]
        },
        review: null
      }
    ];
  }

  // Fetch reviews written by client
  let reviews: any[] = [];
  try {
    reviews = await prisma.review.findMany({
      where: { clientId: session.userId },
      include: {
        master: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("Failed to fetch client reviews:", e);
    reviews = [];
  }

  // Fetch recommended VIP masters
  let recommendedMasters: any[] = [];
  try {
    recommendedMasters = await prisma.masterProfile.findMany({
      where: { isVip: true },
      include: { user: true, categories: true },
      take: 3,
    });
  } catch (e) {
    console.error("Failed to fetch recommended masters:", e);
    recommendedMasters = [
      {
        id: "master_askar",
        rating: 4.9,
        categories: [{ name: "Сантехники" }],
        user: { name: "Аскар Ибраев" }
      },
      {
        id: "master_vladimir",
        rating: 5.0,
        categories: [{ name: "Электрики" }],
        user: { name: "Владимир Козлов" }
      },
      {
        id: "master_sergey",
        rating: 4.95,
        categories: [{ name: "Ремонт бытовой техники" }],
        user: { name: "Сергей Петров" }
      }
    ];
  }

  // Handle order cancellation (client-side Server Action trigger)
  const handleCancelOrder = async (orderId: string) => {
    "use server";
    await updateOrderStatus(orderId, "CANCELLED");
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "ACCEPTED":
        return "bg-purpleBrand/5 text-purpleBrand border-purpleBrand/20";
      case "COMPLETED":
        return "bg-greenBrand/10 text-greenBrand border-greenBrand/20";
      case "CANCELLED":
        return "bg-red-50 text-red-600 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Ожидает подтверждения";
      case "ACCEPTED":
        return "В работе";
      case "COMPLETED":
        return "Выполнен";
      case "CANCELLED":
        return "Отменен";
      default:
        return status;
    }
  };

  return (
    <div className="bg-cream-light/30 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="bg-white rounded-3xl border border-cream-dark/20 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-obsidian">Здравствуйте, {clientUser?.name}!</h1>
              <p className="text-xs text-gray-500 font-semibold mt-1 uppercase tracking-wide">Личный кабинет клиента • Astana</p>
            </div>
            <div className="flex flex-col text-left sm:text-right text-xs font-semibold text-gray-500">
              <span>Телефон: {clientUser?.phone}</span>
              <span>Email: {clientUser?.email}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Content (Orders History & Reviews) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Orders History List */}
            <div className="bg-white rounded-3xl border border-cream-dark/20 p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-obsidian flex items-center gap-2 pb-4 border-b border-cream-dark/15">
                <ClipboardList className="h-5 w-5 text-purpleBrand" />
                История заказов
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs font-semibold text-gray-400">Вы пока не делали заказов.</p>
                  <Link
                    href="/"
                    className="inline-block mt-3 px-5 py-2 bg-purpleBrand text-white font-bold text-xs rounded-xl"
                  >
                    Найти первого мастера
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-cream-dark/15 rounded-2xl p-5 hover:border-cream-dark/45 transition-colors space-y-4 bg-cream-light/10"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-base text-obsidian">
                            <Link href={`/master/${order.masterId}`} className="hover:text-purpleBrand hover:underline">
                              {order.master.user.name}
                            </Link>
                          </h3>
                          <p className="text-[10px] text-gray-500 font-semibold">
                            {order.master.categories[0]?.name || "Мастер бытовых услуг"}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wide border ${getStatusStyle(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      {/* Order Details */}
                      <p className="text-xs text-obsidian/85 font-medium whitespace-pre-line leading-relaxed">
                        {order.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-semibold text-gray-500 pt-2 border-t border-cream-dark/10">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-purpleBrand" />
                          <span>
                            {new Date(order.scheduledAt).toLocaleDateString("ru-RU")}{" "}
                            {new Date(order.scheduledAt).toLocaleTimeString("ru-RU", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-start gap-1">
                          <MapPin className="h-4 w-4 text-red-400 shrink-0" />
                          <span className="truncate">{order.address}</span>
                        </div>
                        <div className="font-bold text-obsidian sm:text-right">
                          ₸ {order.totalPrice.toLocaleString()}
                        </div>
                      </div>

                      {/* Action buttons based on status */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-cream-dark/10">
                        {order.status === "PENDING" && (
                          <form action={handleCancelOrder.bind(null, order.id)}>
                            <button
                              type="submit"
                              className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all border border-red-200"
                            >
                              Отменить заказ
                            </button>
                          </form>
                        )}

                        {order.status === "COMPLETED" && !order.review && (
                          <ReviewModal orderId={order.id} masterName={order.master.user.name} />
                        )}

                        {order.status === "COMPLETED" && order.review && (
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                            <CheckCircle2 className="h-4 w-4 text-greenBrand" />
                            <span>Вы оставили отзыв ({order.review.rating} ★)</span>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Left Reviews written list */}
            <div className="bg-white rounded-3xl border border-cream-dark/20 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-obsidian flex items-center gap-2 pb-4 border-b border-cream-dark/15">
                <MessageSquare className="h-5 w-5 text-purpleBrand" />
                Ваши отзывы
              </h2>
              {reviews.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Вы еще не оставляли отзывы.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl border border-cream-dark/10 text-xs space-y-2 bg-cream-light/10">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-obsidian">
                          Мастер:{" "}
                          <Link href={`/master/${rev.masterId}`} className="text-purpleBrand hover:underline">
                            {rev.master.user.name}
                          </Link>
                        </span>
                        <RatingStars rating={rev.rating} showText={false} size={12} />
                      </div>
                      <p className="italic text-gray-600 font-medium">«{rev.text}»</p>
                      <p className="text-[10px] text-gray-400 text-right">
                        От {new Date(rev.createdAt).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Recommended Section (VIP Masters) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-cream-dark/20 p-6 shadow-sm space-y-6">
              
              <h3 className="font-bold text-obsidian flex items-center gap-2 text-sm border-b border-cream-dark/15 pb-4">
                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                Рекомендуемые мастера
              </h3>

              <div className="space-y-4">
                {recommendedMasters.map((m) => (
                  <div key={m.id} className="flex gap-3 items-center border-b last:border-0 border-cream-dark/10 pb-4 last:pb-0">
                    <div className="w-12 h-12 rounded-xl bg-purpleBrand/10 flex items-center justify-center font-bold text-sm text-purpleBrand shrink-0">
                      {m.user.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-obsidian truncate hover:text-purpleBrand">
                        <Link href={`/master/${m.id}`}>{m.user.name}</Link>
                      </h4>
                      <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                        {m.categories[0]?.name || "Мастер"}
                      </p>
                      <div className="mt-1">
                        <RatingStars rating={m.rating} showText={false} size={10} />
                      </div>
                    </div>
                    <Link
                      href={`/master/${m.id}`}
                      className="px-2.5 py-1.5 bg-obsidian text-cream text-[10px] font-bold rounded-lg hover:bg-obsidian-light"
                    >
                      Вызвать
                    </Link>
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
