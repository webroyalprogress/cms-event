// app/admin/layout.tsx
import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";


export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Komponen klien terpisah */}
      <AdminSidebar />

      {/* Konten utama */}
      <main className="flex-1 bg-gray-100 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}