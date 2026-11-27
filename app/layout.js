import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "Pain Relief & Wellness Center | Clinic Management System",
  description:
    "Centralized clinical, rehabilitation, appointment, and billing platform for Pain Relief & Wellness Center.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#F5F8FC] text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
