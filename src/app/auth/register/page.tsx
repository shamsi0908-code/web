import { prisma } from "@/lib/db";
import Link from "next/link";
import RegisterForm from "./RegisterForm";
import { Wrench } from "lucide-react";

export const revalidate = 0; // Fresh categories

export default async function RegisterPage() {
  // Fetch available categories from database to select specialized category if registering as a Master
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: {
      name: "asc",
    },
  });

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
          Регистрация аккаунта
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-medium">
          Уже зарегистрированы?{" "}
          <Link
            href="/auth/login"
            className="font-bold text-purpleBrand hover:text-purpleBrand-hover transition-colors"
          >
            Войдите в систему
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <RegisterForm categories={categories} />
      </div>
    </div>
  );
}
