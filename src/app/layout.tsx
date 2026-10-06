import type { ReactNode } from "react";

export const metadata = {
  title: "Gainora",
  description: "Financial insight and profit improvement platform"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
