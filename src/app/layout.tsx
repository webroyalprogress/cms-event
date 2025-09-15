import { ReactNode } from "react";
import "./globals.css";

// app/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en"  >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
