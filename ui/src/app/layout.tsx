import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar"; // <-- This imports our new navbar
import { ThemeProvider } from "@/components/theme-provider";

// Setup the Inter font
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Offline Signer",
  description: "Securely sign Solana transactions offline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* This applies the Inter font to your whole app */}
      <body className={inter.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Force dark theme
          enableSystem={false} // Disable system theme to keep it dark
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen w-full flex-col bg-background text-foreground">
            {/* This renders our new navbar at the top */}
            <Navbar />
            <main className="flex-1 grid items-center text-center">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}