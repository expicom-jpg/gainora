import type { ReactNode } from "react";
import { requirePageUser } from "@/lib/auth-page";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requirePageUser();
  return children;
}
