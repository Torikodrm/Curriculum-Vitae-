import type { Metadata, Viewport } from "next";
import { AvatarStage } from "@/components/avatar-stage";
import { SmoothScroll } from "@/components/smooth-scroll";
import { profile } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  title: `${profile.firstName} ${profile.lastName} — ${profile.role}`,
  description: `The selected work and practice of ${profile.firstName} ${profile.lastName}.`,
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = { themeColor: "#10120F", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en"><body><SmoothScroll><AvatarStage />{children}</SmoothScroll></body></html>;
}
