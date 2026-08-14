"use client";

import React from "react";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { AdminQRScanner } from "@/frontend/components/admin/AdminQRScanner";

export default function AdminScanTicketsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <AdminQRScanner />
        </div>
      </main>
      <Footer />
    </>
  );
}
