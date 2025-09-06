// src/components/layout/AppLayout.tsx
import * as React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout() {
  return (
    <div className="min-h-dvh bg-white overflow-x-hidden"> 
      {/* fixed navbar na vrhu */}
      <Navbar />

      {/* JEDINI offset zbog fixed navbara */}
      <div className="flex pt-14 sm:pt-16">
        <Sidebar />

        {/* Nema dodatnog top paddinga ovdje! */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
