"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { symptomModelService } from "@/lib/tensorflow/model-service";

interface SymptomFormProps {
    selectedSymptoms: string[];
    onUpdateSymptoms: (symptoms: string[]) => void;
    onSubmit: (symptoms: string[], specialties: string[]) => void;
    isEmergency?: boolean;
    insuranceProviders?: string;
}

export function SymptomForm({
    selectedSymptoms,
    onUpdateSymptoms,
    onSubmit,
    isEmergency = false,
    insuranceProviders = "",
}: SymptomFormProps) {
    const [loading, setLoading] = useState(false);
    const [specialties, setSpecialties] = useState<string[]>([]);
    const [customSymptom, setCustomSymptom] = useState<string[]>([]);
    const [emergency, setEmergency] = useState(isEmergency);
    const [insurance, setInsurance] = useState(insuranceProviders);

    // Process symptoms with ML model when they change
    useEffect(() => {
        const processSymptoms = async () => {
            if (selectedSymptoms.length > 0) {
                try {
                    setLoading(true);
                    // In a real app, this would use the actual ML model
                    const predictedSpecialties =
                        await symptomModelService.processSymptoms(
                            selectedSymptoms
                        );
                    setSpecialties(predictedSpecialties);
                } catch (error) {
                    console.error("Error processing symptoms:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setSpecialties([]);
            }
        };

        processSymptoms();
    }, [selectedSymptoms]);

    // Handle adding a custom symptom
    const handleAddCustomSymptom = () => {
        if (
            customSymptom.trim() &&
            !selectedSymptoms.includes(customSymptom.trim())
        ) {
            onUpdateSymptoms([...selectedSymptoms, customSymptom.trim()]);
            setCustomSymptom("");
        }
    };

    // Handle removing a symptom
    const handleRemoveSymptom = (symptom: string) => {
        onUpdateSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    };

    // Handle form submission
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/symptoms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    selectedSymptoms,
                    specialties,
                    emergency,
                    insurance,
                }),
            });
            const data = await response.json();
            console.log(data);  
            // Optionally handle response
            onSubmit(selectedSymptoms, specialties);
        } catch (error) {
            console.error("Failed to submit symptoms:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Enter Your Symptoms</CardTitle>
                <CardDescription>
                    Select symptoms using the 3D model or add them manually
                    below
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Emergency toggle */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="emergency"
                        checked={emergency}
                        onCheckedChange={(checked) =>
                            setEmergency(checked as boolean)
                        }
                    />
                    <label
                        htmlFor="emergency"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Emergency
                    </label>
                </div>

                {/* Insurance providers input */}
                <div className="space-y-2">
                    <label htmlFor="insurance" className="text-sm font-medium">
                        Enter Your Insurance Providers:
                    </label>
                    <Input
                        id="insurance"
                        value={insurance}
                        onChange={(e) => setInsurance(e.target.value)}
                        placeholder="Insurance Providers"
                    />
                </div>

                {!emergency && (
                    <div className="space-y-2">
                        <label
                            htmlFor="symptoms"
                            className="text-sm font-medium"
                        >
                            Enter Your Symptoms:
                        </label>
                        <div className="flex space-x-2">
                            <Input
                                id="symptoms"
                                value={customSymptom}
                                onChange={(e) =>
                                    setCustomSymptom(e.target.value)
                                }
                                placeholder="Add a symptom"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddCustomSymptom();
                                    }
                                }}
                            />
                            <Button
                                onClick={handleAddCustomSymptom}
                                type="button"
                            >
                                Add
                            </Button>
                        </div>
                    </div>
                )}

                {/* Selected symptoms list */}
                {selectedSymptoms.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium">
                            Selected Symptoms:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {selectedSymptoms.map((symptom) => (
                                <span
                                    key={symptom}
                                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
                                >
                                    {symptom}
                                    <button
                                        onClick={() =>
                                            handleRemoveSymptom(symptom)
                                        }
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommended specialties */}
                {specialties.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium">
                            Recommended Medical Specialties:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {specialties.map((specialty) => (
                                <span
                                    key={specialty}
                                    className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                                >
                                    {specialty}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter>
                <Button
                    onClick={handleSubmit}
                    className="w-full"
                    disabled={
                        loading || (selectedSymptoms.length === 0 && !emergency)
                    }
                >
                    {loading ? "Processing..." : "Find Hospitals"}
                </Button>
            </CardFooter>
        </Card>
    );
}
