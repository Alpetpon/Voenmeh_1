import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ 
  subsets: ["latin", "cyrillic"], 
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "TourSwap - Отказные туры со скидкой до 70%",
  description: "Лучшие предложения отказных туров. Путешествуйте больше, платите меньше. Скидки до 70% на роскошные отели и туры по всему миру.",
  keywords: "отказные туры, горящие туры, скидки на туры, дешевые туры, путешествия",
  openGraph: {
    title: "TourSwap - Отказные туры со скидкой до 70%",
    description: "Лучшие предложения отказных туров. Путешествуйте больше, платите меньше.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
            <html lang="ru" suppressHydrationWarning>
          <body className={`${montserrat.variable} font-sans antialiased bg-white`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}