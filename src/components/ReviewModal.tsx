"use client";

import { useState, useTransition } from "react";
import { createReview } from "@/app/actions";
import { Star, MessageSquare, Loader2, X } from "lucide-react";

interface ReviewModalProps {
  orderId: string;
  masterName: string;
}

export default function ReviewModal({ orderId, masterName }: ReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!text.trim()) {
      return setError("Пожалуйста, напишите текст отзыва");
    }

    startTransition(async () => {
      try {
        const res = await createReview({
          orderId,
          rating,
          text,
        });
        if (res.success) {
          setIsOpen(false);
          setText("");
        }
      } catch (err) {
        setError((err as Error).message || "Ошибка отправки отзыва");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-purpleBrand text-white font-bold text-xs rounded-xl hover:bg-purpleBrand-hover transition-colors shadow-sm"
      >
        Оставить отзыв
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-cream-dark/20 p-6 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-cream-dark/15 pb-4">
              <div>
                <h3 className="text-lg font-bold text-obsidian">Оставить отзыв</h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">Мастер: {masterName}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-obsidian hover:bg-cream-light transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Rating stars selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ваша оценка
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-yellow-500 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= rating ? "fill-current" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text Area */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-purpleBrand" />
                  Текст отзыва
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Опишите, что вам понравилось, насколько качественно и быстро мастер выполнил работу..."
                  rows={4}
                  className="w-full rounded-xl border-cream-dark/30 bg-cream-light/35 text-xs p-3 focus:border-purpleBrand focus:bg-white focus:outline-none transition-colors border text-obsidian font-semibold resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-obsidian hover:bg-obsidian-light text-cream py-3 rounded-xl font-bold text-xs shadow-md transition-all"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-cream" />
                ) : (
                  <span>Отправить отзыв</span>
                )}
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
