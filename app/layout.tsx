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

// «Letra maior» before the first paint, so the page does not jump when the
// store reads her choice back. Same key and shape as the store's `persist`.
const LARGE_TEXT = `try{var c=JSON.parse(localStorage.getItem("a-sua-casa")||"{}");if(c.state&&c.state.textSize==="maior")document.documentElement.dataset.letra="maior"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-PT"
      className={`${atkinson.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed string of ours, no user input
          dangerouslySetInnerHTML={{ __html: LARGE_TEXT }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <Shell>{children}</Shell>
        </TooltipProvider>
      </body>
    </html>
  );
}
