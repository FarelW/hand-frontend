"use client";

import React from "react";
import Navbar from "../components/navbar";
import FloatingBar from "@/components/floatingBar";
import { Toaster } from "@/components/sonner";
import { usePathname } from "next/navigation";
import { WebSocketProvider } from "@/context/WebSocketProvider";
import GlobalCallHandler from "@/components/globalCallHandler";
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isTherapistDashboard = pathname.startsWith("/therapist");
  const isAdminDashboard = pathname.startsWith("/admin");
  return (
    <>
      <WebSocketProvider>
        {!isAdminDashboard && <Navbar />}
        <GlobalCallHandler />
        {children}
        {!isTherapistDashboard && !isAdminDashboard && <FloatingBar />}
        <Toaster position="bottom-right" richColors />
      </WebSocketProvider>
    </>
  );
}
