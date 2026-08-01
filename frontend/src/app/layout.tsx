import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "CodeSync — Collaborative Code Editor",
    template: "%s | CodeSync",
  },
  description:
    "A premium collaborative code editor with real-time editing, AI code review, integrated terminal, and GitHub sync. Built for teams who ship fast.",
  keywords: [
    "collaborative code editor",
    "real-time coding",
    "pair programming",
    "AI code review",
    "online IDE",
  ],
  authors: [{ name: "CodeSync" }],
  openGraph: {
    type: "website",
    title: "CodeSync — Collaborative Code Editor",
    description:
      "A premium collaborative code editor with real-time editing, AI code review, and GitHub sync.",
    siteName: "CodeSync",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-[hsl(var(--background))] text-[hsl(var(--foreground))] antialiased">
        {/* Skip to content link for accessibility */}
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>

        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: "hsl(var(--gray-2))",
                    color: "hsl(var(--gray-12))",
                    border: "1px solid hsl(var(--gray-6))",
                    borderRadius: "var(--radius-lg)",
                    fontSize: "0.875rem",
                  },
                }}
                richColors
                closeButton
              />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
