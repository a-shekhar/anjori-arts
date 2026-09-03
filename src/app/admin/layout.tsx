import { verifyAdminRole } from "@/lib/auth-admin";
import { redirect } from "next/navigation";
import { AdminLayoutClient } from "@/components/admin-layout-client";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { authorized, error } = await verifyAdminRole();
  
  if (!authorized) {
    const reason = error === "Forbidden" ? "not_admin" : "unauthorized";
    redirect(`/login?reason=${reason}`);
  }

  return (
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
}
