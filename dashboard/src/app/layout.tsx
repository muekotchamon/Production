import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import "./roofing-job.css";

const crmSans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-crm",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Exteriors production — roofing workflow",
  description:
    "Roofing job workflow dashboard: five-step production tracking with notes and progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${crmSans.variable} h-100`}
      suppressHydrationWarning
    >
      <body
        className="min-vh-100 d-flex flex-column app-body-bg"
        style={{ fontFamily: "var(--font-crm), system-ui, sans-serif" }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
