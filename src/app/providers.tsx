"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // refetch session tiap 5 menit
      refetchOnWindowFocus={true} // refetch kalau window fokus
    >
      {children}
    </SessionProvider>
  );
}
