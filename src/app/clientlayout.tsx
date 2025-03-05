"use client";

import React from 'react';
import Navbar from '../components/navbar'; 
import FloatingBar from '@/components/floatingBar';
import { Toaster } from '@/components/sonner';
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isTherapistDashboard = pathname.startsWith("/therapist");
  return (
    <>
        <Navbar/>
        {children}
        {!isTherapistDashboard && <FloatingBar />}
        <Toaster position="bottom-right" richColors />{" "}
    </>
  );
}