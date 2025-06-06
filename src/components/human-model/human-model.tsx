'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import { Card, CardContent } from '@/components/ui/card';

// Define body parts and their associated symptoms
const bodyPartSymptoms: Record<string, string[]> = {
  head: [
    'Headache',
    'Dizziness',
    'Blurred vision',
    'Ear pain',
    'Sore throat',
    'Facial pain',
  ],
  chest: [
    'Chest pain',
    'Shortness of breath',
    'Heart palpitations',
    'Cough',
    'Wheezing',
  ],
  abdomen: [
    'Abdominal pain',
    'Nausea',
    'Vomiting',
    'Diarrhea',
    'Constipation',
    'Bloating',
  ],
  arms: [
    'Arm pain',
    'Joint pain',
    'Muscle weakness',
    'Numbness',
    'Tingling',
  ],
  legs: [
    'Leg pain',
    'Knee pain',
    'Ankle pain',
    'Swelling',
    'Difficulty walking',
  ],
};

// Simple Human Model Component
function SimpleHumanModel({
  onSelectBodyPart,
}: {
  onSelectBodyPart: (part: string) => void;
}) {
  // In a real app, you would load a proper GLTF model
  // For this example, we'll create a simple human shape with primitive geometries
  
  // Hover state for each body part
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  
  // Handle pointer events
  const handlePointerOver = (part: string) => setHoveredPart(part);
  const handlePointerOut = () => setHoveredPart(null);
  const handleClick = (part: string) => onSelectBodyPart(part);
  
  // Common material properties
  const getMaterial = (part: string) => {
    return {
      color: hoveredPart === part ? '#3B82F6' : '#64748b',
      metalness: 0.2,
      roughness: 0.8,
    };
  };

  // Slow rotation animation
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/* Head */}
      <mesh
        position={[0, 1.7, 0]}
        onPointerOver={() => handlePointerOver('head')}
        onPointerOut={handlePointerOut}
        onClick={() => handleClick('head')}
      >
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial {...getMaterial('head')} />
      </mesh>

      {/* Body */}
      <mesh
        position={[0, 1, 0]}
        onPointerOver={() => handlePointerOver('chest')}
        onPointerOut={handlePointerOut}
        onClick={() => handleClick('chest')}
      >
        <capsuleGeometry args={[0.25, 0.7, 16, 32]} />
        <meshStandardMaterial {...getMaterial('chest')} />
      </mesh>

      {/* Abdomen */}
      <mesh
        position={[0, 0.5, 0]}
        onPointerOver={() => handlePointerOver('abdomen')}
        onPointerOut={handlePointerOut}
        onClick={() => handleClick('abdomen')}
      >
        <capsuleGeometry args={[0.27, 0.4, 16, 32]} />
        <meshStandardMaterial {...getMaterial('abdomen')} />
      </mesh>

      {/* Left Arm */}
      <mesh
        position={[-0.4, 1, 0]}
        rotation={[0, 0, -Math.PI / 6]}
        onPointerOver={() => handlePointerOver('arms')}
        onPointerOut={handlePointerOut}
        onClick={() => handleClick('arms')}
      >
        <capsuleGeometry args={[0.08, 0.7, 16, 32]} />
        <meshStandardMaterial {...getMaterial('arms')} />
      </mesh>

      {/* Right Arm */}
      <mesh
        position={[0.4, 1, 0]}
        rotation={[0, 0, Math.PI / 6]}
        onPointerOver={() => handlePointerOver('arms')}
        onPointerOut={handlePointerOut}
        onClick={() => handleClick('arms')}
      >
        <capsuleGeometry args={[0.08, 0.7, 16, 32]} />
        <meshStandardMaterial {...getMaterial('arms')} />
      </mesh>

      {/* Left Leg */}
      <mesh
        position={[-0.2, -0.2, 0]}
        rotation={[0, 0, -Math.PI / 32]}
        onPointerOver={() => handlePointerOver('legs')}
        onPointerOut={handlePointerOut}
        onClick={() => handleClick('legs')}
      >
        <capsuleGeometry args={[0.1, 0.8, 16, 32]} />
        <meshStandardMaterial {...getMaterial('legs')} />
      </mesh>

      {/* Right Leg */}
      <mesh
        position={[0.2, -0.2, 0]}
        rotation={[0, 0, Math.PI / 32]}
        onPointerOver={() => handlePointerOver('legs')}
        onPointerOut={handlePointerOut}
        onClick={() => handleClick('legs')}
      >
        <capsuleGeometry args={[0.1, 0.8, 16, 32]} />
        <meshStandardMaterial {...getMaterial('legs')} />
      </mesh>

      {/* Hover label */}
      {hoveredPart && (
        <Html position={[0, 2.2, 0]} center>
          <div className="bg-white px-2 py-1 rounded-md shadow-md text-sm">
            {hoveredPart.charAt(0).toUpperCase() + hoveredPart.slice(1)}
          </div>
        </Html>
      )}
    </group>
  );
}

export function HumanModelComponent({
  onSelectSymptoms,
}: {
  onSelectSymptoms: (symptoms: string[]) => void;
}) {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Handle body part selection
  const handleSelectBodyPart = (part: string) => {
    setSelectedPart(part);
  };

  // Handle symptom selection
  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) => {
      if (prev.includes(symptom)) {
        return prev.filter((s) => s !== symptom);
      } else {
        return [...prev, symptom];
      }
    });
  };

  // Update parent component when symptoms change
  useEffect(() => {
    onSelectSymptoms(selectedSymptoms);
  }, [selectedSymptoms, onSelectSymptoms]);

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4">
      <Card className="flex-1 min-h-[300px] md:min-h-[400px]">
        <CardContent className="p-4 h-full">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <SimpleHumanModel onSelectBodyPart={handleSelectBodyPart} />
            <OrbitControls 
              enablePan={false} 
              minDistance={3} 
              maxDistance={7}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI - Math.PI / 6}
            />
          </Canvas>
        </CardContent>
      </Card>

      <Card className="flex-1 overflow-auto">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">
            {selectedPart 
              ? `Select symptoms for: ${selectedPart.charAt(0).toUpperCase() + selectedPart.slice(1)}` 
              : 'Click on a body part to select symptoms'}
          </h3>
          
          {selectedPart ? (
            <div className="space-y-2">
              {bodyPartSymptoms[selectedPart].map((symptom) => (
                <div key={symptom} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={symptom}
                    checked={selectedSymptoms.includes(symptom)}
                    onChange={() => handleSymptomToggle(symptom)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={symptom} className="text-sm font-medium text-gray-700">
                    {symptom}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Touch any part of the human model to see related symptoms</p>
          )}

          {selectedSymptoms.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-2">Selected Symptoms:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map((symptom) => (
                  <span 
                    key={symptom} 
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
                  >
                    {symptom}
                    <button 
                      onClick={() => handleSymptomToggle(symptom)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}