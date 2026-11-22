import type { Metadata } from "next";

export const metadata: Metadata = { title: "O ano" };

export default function Layout({ children }: LayoutProps<"/ano">) {
  return children;
}
