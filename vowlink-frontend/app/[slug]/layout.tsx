import { Cairo } from "next/font/google";
import type { ReactNode } from "react";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-invitation-display",
  weight: ["400", "600", "700"],
});

export default function SlugLayout({ children }: { children: ReactNode }) {
  return <div className={cairo.variable}>{children}</div>;
}
