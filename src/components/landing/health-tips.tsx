"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HealthTip {
    id: number;
    title: string;
    content: string;
    category: "general" | "nutrition" | "fitness" | "mental";
}

const healthTips: HealthTip[] = [
    {
        id: 1,
        title: "Stay Hydrated",
        content:
            "Drink at least 8 glasses of water daily to maintain proper bodily functions and energy levels.",
        category: "general",
    },
    {
        id: 2,
        title: "Balanced Diet",
        content:
            "Include a variety of fruits, vegetables, lean proteins, and whole grains in your daily meals.",
        category: "nutrition",
    },
    {
        id: 3,
        title: "Regular Exercise",
        content:
            "Aim for at least 30 minutes of moderate physical activity most days of the week.",
        category: "fitness",
    },
    {
        id: 4,
        title: "Mindful Breaks",
        content:
            "Take short mental breaks throughout the day to reduce stress and improve focus.",
        category: "mental",
    },
    {
        id: 5,
        title: "Adequate Sleep",
        content:
            "Aim for 7-9 hours of quality sleep each night to support overall health and immune function.",
        category: "general",
    },
    {
        id: 6,
        title: "Limit Processed Foods",
        content:
            "Reduce intake of highly processed foods that are often high in sugar, salt, and unhealthy fats.",
        category: "nutrition",
    },
];

export function HealthTips() {
    const [activeCategory, setActiveCategory] = useState<string>("all");

    const filteredTips =
        activeCategory === "all"
            ? healthTips
            : healthTips.filter((tip) => tip.category === activeCategory);

    return (
        <section id="health-tips" className="py-16 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black dark:text-white">
                        Health Tips For You
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Simple, evidence-based tips to help you maintain optimal
                        health and wellbeing.
                    </p>
                </motion.div>

                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <Button
                        variant={
                            activeCategory === "all" ? "default" : "outline"
                        }
                        onClick={() => setActiveCategory("all")}
                        className="rounded-full"
                    >
                        All Tips
                    </Button>
                    <Button
                        variant={
                            activeCategory === "general" ? "default" : "outline"
                        }
                        onClick={() => setActiveCategory("general")}
                        className="rounded-full"
                    >
                        General
                    </Button>
                    <Button
                        variant={
                            activeCategory === "nutrition"
                                ? "default"
                                : "outline"
                        }
                        onClick={() => setActiveCategory("nutrition")}
                        className="rounded-full"
                    >
                        Nutrition
                    </Button>
                    <Button
                        variant={
                            activeCategory === "fitness" ? "default" : "outline"
                        }
                        onClick={() => setActiveCategory("fitness")}
                        className="rounded-full"
                    >
                        Fitness
                    </Button>
                    <Button
                        variant={
                            activeCategory === "mental" ? "default" : "outline"
                        }
                        onClick={() => setActiveCategory("mental")}
                        className="rounded-full"
                    >
                        Mental Health
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTips.map((tip) => (
                        <motion.div
                            key={tip.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            viewport={{ once: true }}
                        >
                            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                                <CardHeader>
                                    <CardTitle>{tip.title}</CardTitle>
                                    <CardDescription>
                                        {tip.category.charAt(0).toUpperCase() +
                                            tip.category.slice(1)}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p>{tip.content}</p>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-auto"
                                    >
                                        Learn more
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
