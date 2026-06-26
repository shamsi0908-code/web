"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logout } from "@/app/actions";
import { ChevronDown, User, ShieldCheck, Sparkles, LogOut, Loader2, LayoutDashboard, KeyRound } from "lucide-react";

interface UserSwitcherProps {
  currentSession: {
    userId: string;
    role: string;
    name: string;
    email: string;
  } | null;
}

export default function UserSwitcher({ currentSession }: UserSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogout = () => {
    setIsOpen(false);
    startTransition(async () => {
      await logout();
      router.push("/");
      router.refresh();
    });
  };

  // Guest buttons
  if (!currentSession) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="px-4 py-2 text-xs font-bold text-obsidian hover:text-purpleBrand transition-colors"
        >
          Войти
        </Link>
        <Link
          href="/auth/register"
          className="px-4 py-2 text-xs font-bold text-white bg-purpleBrand hover:bg-purpleBrand-hover rounded-xl shadow-sm transition-all"
        >
          Регистрация
        </Link>
      </div>
    );
  }

  // Define Dashboard link based on Role
  let dashboardUrl = "/client/dashboard";
  let dashboardLabel = "Кабинет клиента";
  let RoleIcon = User;
  let roleBadgeClass = "bg-purpleBrand/10 text-purpleBrand border-purpleBrand/15";

  if (currentSession.role === "MASTER") {
    dashboardUrl = "/master/dashboard";
    dashboardLabel = "Кабинет мастера";
    RoleIcon = Sparkles;
    roleBadgeClass = "bg-greenBrand/15 text-greenBrand border-greenBrand/25";
  } else if (currentSession.role === "ADMIN") {
    dashboardUrl = "/admin";
    dashboardLabel = "Панель админа";
    RoleIcon = ShieldCheck;
    roleBadgeClass = "bg-red-50 text-red-700 border-red-100";
  }

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-cream-dark/30 bg-white hover:bg-cream-light text-xs font-bold text-obsidian transition-all duration-200 shadow-sm"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-purpleBrand" />
        ) : (
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-lg border ${roleBadgeClass}`}>
              <RoleIcon className="h-3.5 w-3.5" />
            </div>
            <span className="max-w-[120px] truncate">{currentSession.name}</span>
          </div>
        )}
        <ChevronDown className={`h-3.5 w-3.5 opacity-50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-cream-dark/20 p-2 shadow-xl animate-fade-in z-50">
            <div className="px-3 py-2.5 border-b border-cream-dark/10 mb-1">
              <p className="text-xs font-bold text-obsidian truncate">{currentSession.name}</p>
              <p className="text-[10px] text-gray-400 font-semibold truncate mt-0.5">{currentSession.email}</p>
            </div>

            <div className="space-y-0.5">
              <Link
                href={dashboardUrl}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left text-xs font-bold text-obsidian hover:bg-cream-light/60 transition-all"
              >
                <LayoutDashboard className="h-4 w-4 text-purpleBrand" />
                <span>{dashboardLabel}</span>
              </Link>
            </div>

            <div className="mt-1 pt-1.5 border-t border-cream-dark/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs text-red-600 hover:bg-red-50 font-bold transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span>Выйти из профиля</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
