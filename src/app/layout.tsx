import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const LOGO_URL =
  "https://protegey-bucket.s3.eu-north-1.amazonaws.com/public/constant/protegey_logo.svg";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  weight: ["500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Protegey Admin",
  description: "Protegey — Continental Fraud Intelligence Engine",
  icons: {
    icon: LOGO_URL,
    shortcut: LOGO_URL,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plexSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
