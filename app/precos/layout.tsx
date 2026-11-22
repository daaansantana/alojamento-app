import type { Metadata } from "next";

export const metadata: Metadata = { title: "Preços" };

export default function Layout({ children }: LayoutProps<"/precos">) {
  return children;
}
