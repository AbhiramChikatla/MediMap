"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, useUser, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Navbar() {
    const { isSignedIn, isLoaded } = useUser();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Handle scroll event to change header appearance
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const renderAuthButtons = () => {
        if (!isLoaded) {
            return (
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                </div>
            );
        }

        if (isSignedIn) {
            return (
                <div className="flex items-center gap-3">
                    <Link href="/dashboard">
                        <Button
                            variant="ghost"
                            className="hidden md:inline-flex"
                        >
                            Dashboard
                        </Button>
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                </div>
            );
        }

        return (
            <div className="flex items-center gap-3">
                <SignInButton mode="modal">
                    <Button variant="ghost" className="hidden md:inline-flex">
                        Sign In
                    </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                    <Button>
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </SignUpButton>
            </div>
        );
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 py-1">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">Medimap</span>
                </div>

                <nav className="hidden md:flex items-center space-x-8">
                    <Link
                        href="/#features"
                        className="text-sm font-medium hover:text-blue-600 transition-colors"
                    >
                        Features
                    </Link>
                    <Link
                        href="/#testimonials"
                        className="text-sm font-medium hover:text-blue-600 transition-colors"
                    >
                        Testimonials
                    </Link>
                    <Link
                        href="/#pricing"
                        className="text-sm font-medium hover:text-blue-600 transition-colors"
                    >
                        Pricing
                    </Link>
                    <Link
                        href="/#contact"
                        className="text-sm font-medium hover:text-blue-600 transition-colors"
                    >
                        Contact
                    </Link>
                </nav>

                <div className="flex items-center space-x-4">
                    {renderAuthButtons()}
                </div>
            </div>
        </header>
    );
}
