import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Shell } from "./shell";
import "./globals.css";

// Made by the Braille Institute for low vision; the slashed zero stays.
const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = { themeColor: "#1f4fa3" };

export const metadata: Metadata = {
  title: { default: "Início · A sua casa", template: "%s · A sua casa" },
  description:
    "Como correu o ano na sua casa, o que fazer este mês e quanto ganha se mudar alguma coisa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-PT" className={`${atkinson.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <Shell>{children}</Shell>
        </TooltipProvider>
      </body>
    </html>
  );
}
