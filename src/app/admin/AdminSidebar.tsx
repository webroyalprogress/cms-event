// app/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import LogoutButton from "./dashboard/LogoutButton";

export default function AdminSidebar() {
  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col">
      <h1 className="text-2xl font-bold p-4 border-b border-gray-700">Admin Panel</h1>
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/admin/dashboard" className="block py-2 px-3 rounded hover:bg-gray-700">
          Dashboard
        </Link>
        <Link href="/admin/products" className="block py-2 px-3 rounded hover:bg-gray-700">
          Products
        </Link>
        <Link href="/admin/events" className="block py-2 px-3 rounded hover:bg-gray-700">
          Events
        </Link>
        <Link href="/admin/product-events" className="block py-2 px-3 rounded hover:bg-gray-700">
          Product Events
        </Link>
        <Link href="/admin/headers" className="block py-2 px-3 rounded hover:bg-gray-700">
          Headers
        </Link>
        <Link href="/admin/logo" className="block py-2 px-3 rounded hover:bg-gray-700">
          Logo
        </Link>
     </nav>
      <div className="p-4 border-t border-gray-700">
        <LogoutButton />
      </div>
    </aside>
  );
}