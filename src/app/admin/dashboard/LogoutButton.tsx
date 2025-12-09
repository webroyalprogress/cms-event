"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/admin/login"); // redirect setelah logout
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
}
