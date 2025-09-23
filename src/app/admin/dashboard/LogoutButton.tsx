"use client"

import { signOut } from "next-auth/react"

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({
      redirect: true, // ⬅️ default true, biar langsung redirect
      callbackUrl: "/admin/login", // ⬅️ tujuan setelah logout
    })
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
    >
      Logout
    </button>
  )
}
