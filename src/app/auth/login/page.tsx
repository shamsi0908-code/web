"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/app/actions";
import { Wrench, ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    startTransition(async () => {
      try {
        const res = await loginUser({ email, password });
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
    <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cream-light/40 relative">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#5B3A8E_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex justify-center items-center gap-2 group mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-obsidian text-cream transition-transform group-hover:scale-105">
            <Wrench className="h-5 w-5 text-cream" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-obsidian">
            Master<span className="text-purpleBrand">Hub</span>
          </span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-obsidian tracking-tight">
          Вход в систему
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-medium">
          Или{" "}
          <Link
            href="/auth/register"
            className="font-bold text-purpleBrand hover:text-purpleBrand-hover transition-colors"
          >
            создайте новый аккаунт
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 border border-cream-dark/20 shadow-xl rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-xs font-semibold text-red-600 animate-fade-in">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Email адрес
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-3 border border-cream-dark/30 rounded-xl bg-cream-light/20 text-xs text-obsidian font-semibold placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purpleBrand focus:border-purpleBrand focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Пароль
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-3 border border-cream-dark/30 rounded-xl bg-cream-light/20 text-xs text-obsidian font-semibold placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purpleBrand focus:border-purpleBrand focus:bg-white transition-all"
                />
              </div>
            </div>

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
                    <span>Войти</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Testing Tips */}
          <div className="mt-8 pt-6 border-t border-cream-dark/15">
            <div className="bg-cream-light/40 rounded-2xl p-4 border border-cream-dark/10 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-purpleBrand" />
                <span>Демо-аккаунты для тестирования</span>
              </div>
              <ul className="text-[11px] text-obsidian/70 space-y-1 font-semibold leading-relaxed">
                <li>
                  <span className="text-purpleBrand font-bold">Администратор:</span> admin@masterhub.kz <span className="text-gray-400">(пароль: adminpassword)</span>
                </li>
                <li>
                  <span className="text-purpleBrand font-bold">Мастер:</span> askar@masterhub.kz <span className="text-gray-400">(пароль: masterpassword)</span>
                </li>
                <li>
                  <span className="text-purpleBrand font-bold">Клиент:</span> aliya@mail.ru <span className="text-gray-400">(пароль: clientpassword)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
