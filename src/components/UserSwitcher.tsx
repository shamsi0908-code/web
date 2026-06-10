"use client";

import { useState, useTransition } from "react";
import { loginAs, logout } from "@/app/actions";
import { ChevronDown, User, ShieldCheck, Sparkles, LogOut, Loader2 } from "lucide-react";

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

  const handleSwitch = (email: string) => {
    setIsOpen(false);
    startTransition(async () => {
      try {
        await loginAs(email);
      } catch (err) {
        alert("Ошибка входа: " + (err as Error).message);
      }
    });
  };

  const handleLogout = () => {
    setIsOpen(false);
    startTransition(async () => {
      await logout();
    });
  };

  const usersList = [
    { email: "aliya@mail.ru", name: "Алия Сабитова", label: "Заказчик (Клиент)", icon: User },
    { email: "askar@masterhub.kz", name: "Аскар Ибраев", label: "Мастер (Сантехник)", icon: Sparkles },
    { email: "vladimir@masterhub.kz", name: "Владимир Козлов", label: "Мастер (Электрик)", icon: Sparkles },
    { email: "admin@masterhub.kz", name: "Администратор", label: "Панель Управления (Админ)", icon: ShieldCheck },
  ];

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cream-dark/30 bg-white hover:bg-cream-light text-sm font-medium text-obsidian transition-all duration-200 shadow-sm"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-purpleBrand" />
        ) : currentSession ? (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purpleBrand animate-pulse"></span>
            <span className="max-w-[120px] truncate">{currentSession.name}</span>
            <span className="text-[10px] bg-purpleBrand/10 text-purpleBrand px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
              {currentSession.role}
            </span>
          </div>
        ) : (
          <span className="text-obsidian/70">Войти в демо-аккаунт</span>
        )}
        <ChevronDown className={`h-4 w-4 opacity-50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-cream-dark/20 p-2 shadow-xl animate-fade-in z-50">
            <div className="px-3 py-2 border-b border-gray-100 mb-1">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Выберите демо-роль</p>
            </div>

            <div className="space-y-1">
              {usersList.map((user) => {
                const Icon = user.icon;
                const isCurrent = currentSession?.email === user.email;

                return (
                  <button
                    key={user.email}
                    onClick={() => handleSwitch(user.email)}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all ${
                      isCurrent
                        ? "bg-purpleBrand/5 text-purpleBrand font-medium"
                        : "hover:bg-cream-light/60 text-obsidian"
                    }`}
                  >
                    <div className={`p-1.5 rounded-md mt-0.5 ${isCurrent ? "bg-purpleBrand/10" : "bg-gray-50"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{user.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {currentSession && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm text-red-600 hover:bg-red-50 font-medium transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Выйти (Режим гостя)</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
