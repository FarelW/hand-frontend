import UserProfile from "./profileClient";
import { cookies } from "next/headers";
import React from "react";
import { redirect } from "next/navigation";

export default function page() {
  const cookieStore = cookies();
  const roleCookie = cookieStore.get("user_role");
  const role = roleCookie?.value;

  if (role) {
    if (role === "") {
      redirect("/");
    }
  }
  return (
    <div>
      <UserProfile />
    </div>
  );
}
