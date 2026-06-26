"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/app/actions";
import { 
  User, ShieldCheck, Mail, Lock, Phone, Wrench, Briefcase, 
  Coins, Sparkles, Loader2, ArrowRight, BookOpen 
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface RegisterFormProps {
  categories: Category[];
}

export default function RegisterForm({ categories }: RegisterFormProps) {
  const [role, setRole] = useState<"CLIENT" | "MASTER">("CLIENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  // Master fields
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug || "");
  const [basePrice, setBasePrice] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !phone || !password) {
      setError("Пожалуйста, заполните все обязательные поля");
      return;
    }

    startTransition(async () => {
      try {
        const res = await registerUser({
          name,
          email,
          phone,
          password,
          role,
          categorySlug: role === "MASTER" ? categorySlug : undefined,
          basePrice: role === "MASTER" ? parseFloat(basePrice) || 3000 : undefined,
          experienceYears: role === "MASTER" ? parseInt(experienceYears) || 3 : undefined,
          description: role === "MASTER" ? description : undefined,
        });

        if (res.success) {
          router.push("/");
          router.refresh();
        }
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  return (
    <div className="bg-white py-8 px-4 border border-cream-dark/20 shadow-xl rounded-3xl sm:px-10">
      {/* Role Selection Tabs */}
      <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-cream-light/60 rounded-2xl border border-cream-dark/10">
        <button
          type="button"
          onClick={() => setRole("CLIENT")}
          className={`flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all ${
            role === "CLIENT"
              ? "bg-white text-purpleBrand shadow-sm border border-cream-dark/20"
              : "text-gray-500 hover:text-obsidian"
          }`}
        >
          <User className="h-4 w-4" />
          <span>Я заказчик</span>
        </button>
        <button
          type="button"
          onClick={() => setRole("MASTER")}
          className={`flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all ${
            role === "MASTER"
              ? "bg-white text-purpleBrand shadow-sm border border-cream-dark/20"
              : "text-gray-500 hover:text-obsidian"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Я специалист</span>
        </button>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-xs font-semibold text-red-600 animate-fade-in">
            {error}
          </div>
        )}

        {/* Common Fields */}
        <div>
          <label htmlFor="name" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Ваше имя (ФИО) *
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <User className="h-4 w-4" />
            </div>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Аскар Ибраев"
              className="block w-full pl-10 pr-3 py-3 border border-cream-dark/30 rounded-xl bg-cream-light/20 text-xs text-obsidian font-semibold placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purpleBrand focus:border-purpleBrand focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Email адрес *
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="block w-full pl-10 pr-3 py-3 border border-cream-dark/30 rounded-xl bg-cream-light/20 text-xs text-obsidian font-semibold placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purpleBrand focus:border-purpleBrand focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Телефон *
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                id="phone"
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (701) 555-11-22"
                className="block w-full pl-10 pr-3 py-3 border border-cream-dark/30 rounded-xl bg-cream-light/20 text-xs text-obsidian font-semibold placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purpleBrand focus:border-purpleBrand focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Пароль *
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full pl-10 pr-3 py-3 border border-cream-dark/30 rounded-xl bg-cream-light/20 text-xs text-obsidian font-semibold placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purpleBrand focus:border-purpleBrand focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Master Fields (only shown if Я специалист) */}
        {role === "MASTER" && (
          <div className="border-t border-cream-dark/20 pt-5 mt-5 space-y-5 animate-fade-in">
            <div className="bg-purpleBrand/5 p-4 rounded-2xl border border-purpleBrand/10 mb-4 flex items-start gap-2.5">
              <Sparkles className="h-5 w-5 text-purpleBrand mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-obsidian">Заполните профиль мастера</p>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5 leading-relaxed">
                  Эта информация поможет заказчикам найти вас в каталоге услуг и оценить ваш опыт.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Специализация (Категория) *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <select
                    id="category"
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-cream-dark/30 rounded-xl bg-cream-light/20 text-xs text-obsidian font-bold focus:outline-none focus:ring-1 focus:ring-purpleBrand focus:border-purpleBrand focus:bg-white transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="basePrice" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Стоимость выезда (₸) *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Coins className="h-4 w-4" />
                  </div>
                  <input
                    id="basePrice"
                    type="number"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="Например: 5000"
                    className="block w-full pl-10 pr-3 py-3 border border-cream-dark/30 rounded-xl bg-cream-light/20 text-xs text-obsidian font-bold placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purpleBrand focus:border-purpleBrand focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="experience" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Стаж работы (лет) *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Briefcase className="h-4 w-4" />
                </div>
                <input
                  id="experience"
                  type="number"
                  required
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder="Например: 5"
                  className="block w-full pl-10 pr-3 py-3 border border-cream-dark/30 rounded-xl bg-cream-light/20 text-xs text-obsidian font-bold placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purpleBrand focus:border-purpleBrand focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                О себе (Услуги, инструменты, гарантия)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none text-gray-400">
                  <BookOpen className="h-4 w-4" />
                </div>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Расскажите о своей работе, оборудовании и качестве услуг..."
                  className="block w-full pl-10 pr-3 py-3 border border-cream-dark/30 rounded-xl bg-cream-light/20 text-xs text-obsidian font-semibold placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purpleBrand focus:border-purpleBrand focus:bg-white transition-all resize-none"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-purpleBrand hover:bg-purpleBrand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purpleBrand transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <>
                <span>Зарегистрироваться</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
