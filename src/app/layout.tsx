import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/components/auth/clerk-provider";
import { ServiceWorkerRegister, InstallPrompt } from "@/components/pwa";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "MediMap - Healthcare Center Locator",
    description: "Find nearby healthcare centers based on your symptoms",
    manifest: "/manifest.json",
    themeColor: "#3b82f6",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "MediMap",
    },
    viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 1,
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://medimap.example.com",
        title: "MediMap - Healthcare Center Locator",
        description: "Find nearby healthcare centers based on your symptoms",
        siteName: "MediMap",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <AuthProvider>
                    <ServiceWorkerRegister />
                    <InstallPrompt />
                    <div className="min-h-screen flex flex-col">
                        <main className="flex-1 ">{children}</main>
                    </div>
                </AuthProvider>
            </body>
        </html>
    );
}
