import Link from "next/link";
import { getSession } from "@/lib/session";
import UserSwitcher from "./UserSwitcher";
import { Sparkles, LayoutDashboard, Wrench } from "lucide-react";

export default async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cream-dark/20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-obsidian text-cream transition-transform group-hover:scale-105">
                <Wrench className="h-5 w-5 text-cream" />
              </div>
              <span className="text-xl font-bold tracking-tight text-obsidian sm:block">
                Master<span className="text-purpleBrand">Hub</span>
                <span className="text-xs font-semibold text-greenBrand ml-1 px-1.5 py-0.5 bg-greenBrand/10 rounded">Астана</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-obsidian/80">
              <Link href="/category/plumbers" className="hover:text-purpleBrand transition-colors">Сантехники</Link>
              <Link href="/category/electricians" className="hover:text-purpleBrand transition-colors">Электрики</Link>
              <Link href="/category/locks" className="hover:text-purpleBrand transition-colors">Замки & Двери</Link>
              <Link href="/category/appliances" className="hover:text-purpleBrand transition-colors">Бытовая техника</Link>
              <Link href="/category/ac" className="hover:text-purpleBrand transition-colors">Кондиционеры</Link>
            </nav>
          </div>

          {/* Right Area: Dashboard Navigation and Switcher */}
          <div className="flex items-center gap-3">
            {session && (
              <div className="hidden sm:flex items-center gap-2">
                {session.role === "CLIENT" && (
                  <Link
                    href="/client/dashboard"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purpleBrand/10 text-purpleBrand rounded-lg hover:bg-purpleBrand/20 transition-all"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    <span>Кабинет клиента</span>
                  </Link>
                )}

                {session.role === "MASTER" && (
                  <Link
                    href="/master/dashboard"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-greenBrand/10 text-greenBrand rounded-lg hover:bg-greenBrand/20 transition-all"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Кабинет мастера</span>
                  </Link>
                )}

                {session.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-100 rounded-lg hover:bg-red-100 transition-all"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    <span>Панель админа</span>
                  </Link>
                )}
              </div>
            )}

            {/* Demo User Switcher Dropdown */}
            <UserSwitcher currentSession={session} />
          </div>
        </div>

        {/* Small screen role navigation links */}
        {session && (
          <div className="flex sm:hidden items-center justify-around border-t border-cream-dark/10 py-1.5 text-[11px] font-semibold text-obsidian">
            {session.role === "CLIENT" && (
              <Link href="/client/dashboard" className="text-purpleBrand">Кабинет клиента</Link>
            )}
            {session.role === "MASTER" && (
              <Link href="/master/dashboard" className="text-greenBrand">Кабинет мастера</Link>
            )}
            {session.role === "ADMIN" && (
              <Link href="/admin" className="text-red-700">Панель админа</Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
