import type { Metadata, Viewport } from "next";
import {
  Amiri,
  Cairo,
  Cinzel,
  El_Messiri,
  Geist,
  Geist_Mono,
  Great_Vibes,
  Lora,
  Merriweather,
  Montserrat,
  Playfair_Display,
  Poppins,
} from "next/font/google";
import { BrandCornerLogo } from "@/components/BrandLogo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const invitationDisplay = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-invitation-display",
});

const invitationGreatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-invitation-greatvibes",
});

const invitationLora = Lora({
  subsets: ["latin", "cyrillic"],
  variable: "--font-invitation-lora",
});

const invitationMontserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-invitation-montserrat",
});

const invitationMerriweather = Merriweather({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "700"],
  variable: "--font-invitation-merriweather",
});

const invitationElMessiri = El_Messiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-invitation-elmessiri",
});

const invitationAmiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-invitation-amiri",
});

const invitationPlayfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-invitation-playfair",
});

const invitationCinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-invitation-cinzel",
});

const invitationPoppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-invitation-poppins",
});

export const metadata: Metadata = {
  title: "LUXECARD",
  description: "Luxury digital wedding invitations",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f5dc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} ${invitationDisplay.variable} ${invitationGreatVibes.variable} ${invitationLora.variable} ${invitationMontserrat.variable} ${invitationMerriweather.variable} ${invitationElMessiri.variable} ${invitationAmiri.variable} ${invitationPlayfair.variable} ${invitationCinzel.variable} ${invitationPoppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh min-h-full flex-col overflow-x-hidden">
        <LanguageProvider>
          <BrandCornerLogo />
          <LanguageToggle />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
