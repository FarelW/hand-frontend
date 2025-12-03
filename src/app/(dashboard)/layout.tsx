import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const roleCookie = cookieStore.get("user_role");
  const role = roleCookie?.value;

  if (role !== "therapist" && role !== "admin") {
    redirect("/");
  }

  return <div>{children}</div>;
}
