'use client';

import { useState } from 'react';
import { HumanModelComponent } from '@/components/human-model/human-model';
import { SymptomForm } from '@/components/symptom-selector/symptom-form';
import { MapComponent } from '@/components/map/map-component';

export default function Home() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchRadius, setSearchRadius] = useState<number>(3000); // Changed from 5km to 3km
  const [isEmergency, setIsEmergency] = useState<boolean>(false);
  const [insuranceProviders, setInsuranceProviders] = useState<string>('');
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
      <h1 className="text-3xl font-bold mb-8 text-blue-600 text-center">Find Healthcare Centers Near You</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-gray-600 mb-8">
            Select symptoms using our interactive 3D model or enter them manually to find the most appropriate healthcare centers near you.
          </p>
          
          {/* 3D Human Model for symptom selection */}
          <div className="h-[500px] mb-6">
            <HumanModelComponent onSelectSymptoms={handleSelectSymptoms} />
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
              insuranceProviders={insuranceProviders}
            />
          </div>
          
          {/* Map Component */}
          <div className="flex-1 min-h-[500px]">
            <MapComponent
              searchRadius={searchRadius}
              selectedSymptoms={selectedSymptoms}
            />
          </div>
        </div>
      </div>
      
      {/* Results Section */}
      {showResults && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Recommended Healthcare Centers</h2>
          
          {specialties.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Based on your symptoms, we recommend:</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <p className="text-gray-600">
            The map above shows healthcare centers near you that specialize in treating your symptoms.
            Click on a marker to see more details about each facility.
          </p>
        </div>
      )}
    </div>
  );
}
