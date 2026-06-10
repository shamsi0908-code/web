import Link from "next/link";
import { Wrench, Phone, MessageSquare, Mail, MapPin, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-obsidian text-cream-light/80 border-t border-cream-dark/10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-light text-obsidian">
                <Wrench className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Master<span className="text-purpleBrand">Hub</span>
              </span>
            </div>
            <p className="text-sm text-cream-light/60 leading-relaxed">
              Крупнейший локальный сервис поиска проверенных мастеров для бытовых услуг в городе Астана. Доверие, качество и гарантия.
            </p>
            <p className="text-xs text-cream-light/40">
              © {new Date().getFullYear()} MasterHub Astana. Все права защищены.
            </p>
          </div>

          {/* Service Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Услуги</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/category/plumbers" className="hover:text-cream transition-colors">Сантехники</Link>
              </li>
              <li>
                <Link href="/category/electricians" className="hover:text-cream transition-colors">Электрики</Link>
              </li>
              <li>
                <Link href="/category/locks" className="hover:text-cream transition-colors">Замки и Двери</Link>
              </li>
              <li>
                <Link href="/category/appliances" className="hover:text-cream transition-colors">Ремонт бытовой техники</Link>
              </li>
              <li>
                <Link href="/category/ac" className="hover:text-cream transition-colors">Кондиционеры</Link>
              </li>
            </ul>
          </div>

          {/* Legal / Business */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Партнерам</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/master/dashboard" className="hover:text-cream transition-colors">Кабинет Мастера</Link>
              </li>
              <li>
                <span className="text-cream-light/40 hover:cursor-default">VIP-размещение</span>
              </li>
              <li>
                <span className="text-cream-light/40 hover:cursor-default">Реклама на платформе</span>
              </li>
              <li>
                <span className="text-cream-light/40 hover:cursor-default">Поднятие в поиске</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Контакты</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-purpleBrand" />
                <a href="tel:+77172555555" className="hover:text-white transition-colors">+7 (7172) 555-555</a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageSquare className="h-4 w-4 text-green-500" />
                <a href="https://wa.me/77015551122" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp Чат</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Send className="h-4 w-4 text-blue-400" />
                <a href="https://t.me/masterhub_astana" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Telegram Канал</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-cream" />
                <a href="mailto:info@masterhub.kz" className="hover:text-white transition-colors">info@masterhub.kz</a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <span className="text-cream-light/60">Астана, проспект Мангилик Ел, 55а, блок C1</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}
