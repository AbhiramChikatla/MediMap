"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HumanModelComponent } from "@/components/human-model/human-model";
import { SymptomForm } from "@/components/symptom-selector/symptom-form";
import { GoogleMapsWithRouteFinder } from "@/components/map/google-maps-with-route-finder";
import { HealthDashboard } from "@/components/dashboard/health-dashboard";

export default function DashboardPage() {
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [searchRadius, setSearchRadius] = useState<number>(3000); // Changed from 5km to 3km
    const [isEmergency, setIsEmergency] = useState<boolean>(false);
    const [insuranceProviders, setInsuranceProviders] = useState<string>("");
    const [showResults, setShowResults] = useState<boolean>(false);
    const [specialties, setSpecialties] = useState<string[]>([]);

    // Handle symptom selection from the 3D model
    const handleSelectSymptoms = (symptoms: string[]) => {
        setSelectedSymptoms(symptoms);
    };

    // Handle form submission
    const handleSubmit = (symptoms: string[], specialties: string[]) => {
        setSelectedSymptoms(symptoms);
        setSpecialties(specialties);
        setShowResults(true);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-blue-600 text-center">
                MediMap Dashboard
            </h1>

            <Tabs defaultValue="find-care" className="w-full mb-8">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="find-care">Find Healthcare</TabsTrigger>
                    <TabsTrigger value="health-dashboard">
                        Health Dashboard
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="find-care">
                    <h2 className="text-2xl font-semibold mb-6 text-blue-600">
                        Find Healthcare Centers Near You
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-gray-600 mb-8">
                                Select symptoms using our interactive 3D model
                                or enter them manually to find the most
                                appropriate healthcare centers near you.
                            </p>

                            {/* 3D Human Model for symptom selection */}
                            <div className="h-[500px] mb-6">
                                <HumanModelComponent
                                    onSelectSymptoms={handleSelectSymptoms}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            {/* Symptom Form */}
                            <div className="mb-6">
                                <SymptomForm
                                    selectedSymptoms={selectedSymptoms}
                                    onUpdateSymptoms={setSelectedSymptoms}
                                    onSubmit={handleSubmit}
                                    isEmergency={isEmergency}
                                    setIsEmergency={setIsEmergency}
                                    insuranceProviders={insuranceProviders}
                                    setInsuranceProviders={
                                        setInsuranceProviders
                                    }
                                    searchRadius={searchRadius}
                                    setSearchRadius={setSearchRadius}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Map with healthcare centers */}
                    {showResults && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-semibold mb-4">
                                Healthcare Centers Near You
                            </h2>
                            <div className="h-[600px] w-full">
                                <GoogleMapsWithRouteFinder
                                    searchRadius={searchRadius}
                                    specialties={specialties}
                                    isEmergency={isEmergency}
                                    insuranceProviders={insuranceProviders}
                                />
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="health-dashboard">
                    <HealthDashboard />
                </TabsContent>
            </Tabs>
        </div>
    );
}
