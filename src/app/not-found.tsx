"use client";

import Link from "next/link";
import { Wrench, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-grow bg-cream-light/30 px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-cream-dark/20 shadow-xl">
        
        {/* Animated Icon Container */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purpleBrand/10 text-purpleBrand animate-bounce">
            <Wrench className="h-8 w-8" />
          </div>
        </div>

        {/* 404 Header */}
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tight text-purpleBrand">404</h1>
          <h2 className="text-xl font-bold text-obsidian sm:text-2xl">Страница не найдена</h2>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            Извините, запрашиваемая страница не существует или была перемещена.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 bg-obsidian text-cream hover:bg-obsidian-light font-bold text-xs rounded-xl shadow-md transition-all duration-200"
          >
            <Home className="h-4 w-4" />
            <span>На главную</span>
          </Link>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.history.back();
              }
            }}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-obsidian border border-cream-dark/30 hover:bg-cream-light font-bold text-xs rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Назад</span>
          </button>
        </div>
        
      </div>
    </div>
  );
}
