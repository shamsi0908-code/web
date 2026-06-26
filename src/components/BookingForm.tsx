"use client";

import { useState, useTransition } from "react";
import { createOrder } from "@/app/actions";
import { Calendar, MapPin, AlignLeft, CheckCircle2, Loader2, X } from "lucide-react";

interface BookingFormProps {
  masterId: string;
  masterName: string;
  basePrice: number;
  isLoggedIn: boolean;
}

export default function BookingForm({ masterId, masterName, basePrice, isLoggedIn }: BookingFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!date) return setError("Укажите дату и время выезда");
    if (!address) return setError("Укажите адрес проведения работ");
    if (!description) return setError("Опишите проблему или задачу");

    startTransition(async () => {
      try {
        const res = await createOrder({
          masterId,
          scheduledAt: date,
          address,
          description,
          totalPrice: basePrice,
        });
        if (res.success) {
          setIsSuccess(true);
        }
      } catch (err) {
        setError((err as Error).message || "Произошла ошибка при бронировании");
      }
    });
  };

  const resetForm = () => {
    setDate("");
    setAddress("");
    setDescription("");
    setError("");
    setIsSuccess(false);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => {
          if (!isLoggedIn) {
            alert("Пожалуйста, войдите в систему под учетной записью для создания заказа.");
            window.location.href = "/auth/login";
            return;
          }
          setIsOpen(true);
        }}
        className="w-full flex items-center justify-center gap-2 bg-purpleBrand hover:bg-purpleBrand-hover text-white py-4 rounded-xl font-bold text-sm shadow-md transition-all"
      >
        <span>Заказать выезд мастера</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-cream-dark/20 p-6 shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-cream-dark/15 pb-4">
              <div>
                <h3 className="text-xl font-bold text-obsidian">Вызов мастера</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Мастер: {masterName}</p>
              </div>
              <button
                onClick={resetForm}
                className="p-1 rounded-full text-gray-400 hover:text-obsidian hover:bg-cream-light transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isSuccess ? (
              /* Success screen */
              <div className="py-8 flex flex-col items-center text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-greenBrand animate-bounce" />
                <h4 className="text-lg font-bold text-obsidian">Заказ успешно оформлен!</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-sm">
                  Заявка отправлена мастеру. Вы можете отслеживать статус заказа в личном кабинете клиента.
                </p>
                <button
                  onClick={resetForm}
                  className="px-6 py-2.5 bg-obsidian text-cream font-bold text-xs rounded-xl hover:bg-obsidian-light transition-colors"
                >
                  Отлично
                </button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold">
                    {error}
                  </div>
                )}

                {/* Date Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-purpleBrand" />
                    Дата и время визита
                  </label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border-cream-dark/30 bg-cream-light/35 text-sm p-3 focus:border-purpleBrand focus:bg-white focus:outline-none transition-colors border text-obsidian font-medium"
                  />
                </div>

                {/* Address Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-red-500" />
                    Адрес проведения работ в Астане
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Район, улица, дом, квартира"
                    className="w-full rounded-xl border-cream-dark/30 bg-cream-light/35 text-sm p-3 focus:border-purpleBrand focus:bg-white focus:outline-none transition-colors border text-obsidian font-medium"
                  />
                </div>

                {/* Description Textarea */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlignLeft className="h-4 w-4 text-purpleBrand" />
                    Что нужно сделать? (Описание проблемы)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Например: Течет кран на кухне, нужно заменить гибкую подводку."
                    rows={3}
                    className="w-full rounded-xl border-cream-dark/30 bg-cream-light/35 text-sm p-3 focus:border-purpleBrand focus:bg-white focus:outline-none transition-colors border text-obsidian font-medium resize-none"
                  />
                </div>

                {/* Price Indicator */}
                <div className="flex items-center justify-between p-4 bg-cream-light/40 rounded-2xl border border-cream-dark/10">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Итого к оплате</span>
                    <span className="text-xs text-gray-500 font-semibold">(Выезд и диагностика)</span>
                  </div>
                  <span className="text-xl font-black text-obsidian">
                    от {basePrice.toLocaleString()} ₸
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 bg-obsidian hover:bg-obsidian-light text-cream py-3.5 rounded-xl font-bold text-sm shadow-md transition-all"
                >
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin text-cream" />
                  ) : (
                    <span>Подтвердить заказ</span>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
}
