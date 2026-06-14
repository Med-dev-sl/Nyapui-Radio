import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const playfair = localFont({
  src: "../public/assets/Playfair_Display/PlayfairDisplay-VariableFont_wght.ttf",
  variable: "--font-playfair",
  display: "swap",
  weight: "200 900",
});

const lato = localFont({
  src: [
    { path: "../public/assets/Lato/Lato-Regular.ttf", weight: "400" },
    { path: "../public/assets/Lato/Lato-Bold.ttf", weight: "700" },
  ],
  variable: "--font-lato",
  display: "swap",
});

const notoSans = localFont({
  src: "../public/assets/Noto_Sans/NotoSans-VariableFont_wdth,wght.ttf",
  variable: "--font-noto-sans",
  display: "swap",
  weight: "200 900",
});

export const metadata: Metadata = {
  title: "Nyapui Radio",
  description: "Nyapui Radio – streaming platform",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${lato.variable} ${notoSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
