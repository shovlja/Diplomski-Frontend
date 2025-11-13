import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const vParam = params.get("v");
  const isBoardView =
    vParam === "board" || location.pathname.toLowerCase().includes("/board");

  return (
    <div className="min-h-dvh bg-white overflow-x-hidden">
      {/* Global navbar */}
      <Navbar />

      {/* Glavni sadržaj ispod navbara */}
      <div className="flex pt-14 sm:pt-16">
        {/* Sidebar se skriva na boardu */}
        {!isBoardView && <Sidebar />}

        {/* Main */}
        <main
          className={
            isBoardView
              ? // >>> ključno: main ispod navbara mora da obezbedi raspoloživu visinu,
                // a BoardView će zauzeti 100% te visine.
                "flex-1 p-0 min-h-[calc(100dvh-56px)]"
              : "flex-1 px-4 sm:px-6 lg:px-8 py-6"
          }
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
