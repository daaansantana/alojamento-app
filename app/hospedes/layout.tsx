import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hóspedes" };

export default function Layout({ children }: LayoutProps<"/hospedes">) {
  return children;
}
