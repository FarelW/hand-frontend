import ClientLayout from "@/app/clientlayout";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const roleCookie = cookieStore.get("user_role");
  const role = roleCookie?.value;

  if (role !== "admin") {
    redirect("/");
  }

  return <ClientLayout>{children}</ClientLayout>;
}
