"use client";

import { motion } from "framer-motion";
import { Badge, Check, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

interface PricingTierProps {
    title: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    buttonText: string;
    buttonVariant?: "default" | "outline";
    popular?: boolean;
}

const PricingTier = ({
    title,
    price,
    period,
    description,
    features,
    buttonText,
    buttonVariant = "outline",
    popular = false,
}: PricingTierProps) => {

    return (
        <motion.div
            className={`rounded-xl border ${
                popular
                    ? "border-blue-500 shadow-lg shadow-blue-100 dark:shadow-blue-900/20"
                    : "border-gray-200 dark:border-gray-800"
            } bg-white dark:bg-gray-950 p-6 flex flex-col h-full`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
        >
            {popular && (
                <div className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full w-fit mb-4">
                    Most Popular
                </div>
            )}
            <h3 className="text-xl font-bold">{title}</h3>
            <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-bold">{price}</span>
                <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                    {period}
                </span>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                {description}
            </p>

            <ul className="mt-6 space-y-3 flex-1">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2">
                            <Check
                                size={12}
                                className="text-blue-600 dark:text-blue-400"
                            />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {feature}
                        </span>
                    </li>
                ))}
            </ul>

            <Button
                variant={buttonVariant}
                className={`mt-8 ${
                    buttonVariant === "default"
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                        : ""
                }`}
            >
                {buttonText}
            </Button>
        </motion.div>
    );
};

export function Pricing() {
  const { isSignedIn } = useUser();

    return (
        <section id="pricing" className="py-20 bg-gray-50">
            <div className="container px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Simple, transparent pricing
                    </h2>
                    <p className="text-xl text-gray-600">
                        Choose the plan that's right for your team
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Starter</CardTitle>
                            <CardDescription>
                                Perfect for small teams
                            </CardDescription>
                            <div className="mt-4">
                                <span className="text-3xl font-bold">$9</span>
                                <span className="text-gray-500">
                                    /user/month
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    Up to 5 team members
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    Basic automation
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    Standard support
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    5GB storage
                                </li>
                            </ul>
                            {isSignedIn ? (
                                <Button
                                    className="w-full mt-6"
                                    variant="outline"
                                >
                                    Current Plan
                                </Button>
                            ) : (
                                <SignUpButton mode="modal">
                                    <Button
                                        className="w-full mt-6"
                                        variant="outline"
                                    >
                                        Start Free Trial
                                    </Button>
                                </SignUpButton>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 relative">
                        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                            Most Popular
                        </Badge>
                        <CardHeader>
                            <CardTitle>Professional</CardTitle>
                            <CardDescription>
                                Best for growing teams
                            </CardDescription>
                            <div className="mt-4">
                                <span className="text-3xl font-bold">$29</span>
                                <span className="text-gray-500">
                                    /user/month
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    Up to 25 team members
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    Advanced AI automation
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    Priority support
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    100GB storage
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    Advanced analytics
                                </li>
                            </ul>
                            {isSignedIn ? (
                                <Link href="/dashboard/upgrade">
                                    <Button className="w-full mt-6">
                                        Upgrade Plan
                                    </Button>
                                </Link>
                            ) : (
                                <SignUpButton mode="modal">
                                    <Button className="w-full mt-6">
                                        Start Free Trial
                                    </Button>
                                </SignUpButton>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Enterprise</CardTitle>
                            <CardDescription>
                                For large organizations
                            </CardDescription>
                            <div className="mt-4">
                                <span className="text-3xl font-bold">$99</span>
                                <span className="text-gray-500">
                                    /user/month
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    Unlimited team members
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    Custom AI workflows
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    24/7 dedicated support
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    Unlimited storage
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                    Custom integrations
                                </li>
                            </ul>
                            {isSignedIn ? (
                                <Link href="/dashboard/contact-sales">
                                    <Button
                                        className="w-full mt-6"
                                        variant="outline"
                                    >
                                        Contact Sales
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/contact">
                                    <Button
                                        className="w-full mt-6"
                                        variant="outline"
                                    >
                                        Contact Sales
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
