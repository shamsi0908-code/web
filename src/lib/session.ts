import { cookies } from "next/headers";
import { prisma } from "./db";

export interface SessionData {
  userId: string;
  role: "CLIENT" | "MASTER" | "ADMIN";
  name: string;
  email: string;
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("demo_session");
    if (!sessionCookie) return null;

    const data = JSON.parse(sessionCookie.value) as SessionData;
    // Verify user still exists in DB
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true, name: true, role: true, email: true },
    });
    if (!user) return null;

    return {
      userId: user.id,
      role: user.role as "CLIENT" | "MASTER" | "ADMIN",
      name: user.name,
      email: user.email,
    };
  } catch (e) {
    return null;
  }
}

export async function setSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true, email: true },
  });
  if (!user) return;

  const sessionData: SessionData = {
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  };

  const cookieStore = cookies();
  cookieStore.set("demo_session", JSON.stringify(sessionData), {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function clearSession() {
  const cookieStore = cookies();
  cookieStore.delete("demo_session");
}
