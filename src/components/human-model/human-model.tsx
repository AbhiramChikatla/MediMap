'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Environment, ContactShadows } from '@react-three/drei';
import { Card, CardContent } from '@/components/ui/card';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Define body parts and their associated symptoms with more detailed categories
const bodyPartSymptoms: Record<string, string[]> = {
  head: [
    'Headache',
    'Dizziness',
    'Blurred vision',
    'Ear pain',
    'Sore throat',
    'Facial pain',
  ],
  neck: [
    'Neck pain',
    'Stiffness',
    'Swollen lymph nodes',
    'Difficulty swallowing',
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
  back: [
    'Upper back pain',
    'Lower back pain',
    'Spine pain',
    'Muscle spasms',
  ],
  arms: [
    'Arm pain',
    'Joint pain',
    'Muscle weakness',
    'Numbness',
    'Tingling',
  ],
  hands: [
    'Hand pain',
    'Finger numbness',
    'Wrist pain',
    'Reduced grip strength',
  ],
  legs: [
    'Leg pain',
    'Knee pain',
    'Ankle pain',
    'Swelling',
    'Difficulty walking',
  ],
  feet: [
    'Foot pain',
    'Heel pain',
    'Toe numbness',
    'Swelling',
  ],
};

// Enhanced Human Model Component with GLTF support
function EnhancedHumanModel({
  onSelectBodyPart,
  gender = 'male',
}: {
  onSelectBodyPart: (part: string) => void;
  gender?: 'male' | 'female';
}) {
  // Attempt to load the GLTF model
  const [modelLoadError, setModelLoadError] = useState(false);
  const modelPath = `/models/male_2.glb`;
  // const modelPath = `/models/male_2.glb`;
  // const modelPath = `/models/group.glb`;
  
  // Hover state for each body part
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  
  // Handle pointer events
  const handlePointerOver = (part: string) => setHoveredPart(part);
  const handlePointerOut = () => setHoveredPart(null);
  const handleClick = (part: string) => onSelectBodyPart(part);
  
  // Slow rotation animation
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
    }
  });

  // Try to load the GLTF model
  const GLTFModel = () => {
    try {
      const { scene } = useGLTF(modelPath);
      
      // Clone the scene to avoid modifying the cached original
      const clonedScene = scene.clone();
      
      // Setup the model for interaction
      clonedScene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          // Determine which body part this mesh belongs to based on its name
          let bodyPart = 'unknown';
          const name = node.name.toLowerCase();
          
          if (name.includes('head')) bodyPart = 'head';
          else if (name.includes('neck')) bodyPart = 'neck';
          else if (name.includes('chest') || name.includes('thorax')) bodyPart = 'chest';
          else if (name.includes('abdomen') || name.includes('stomach')) bodyPart = 'abdomen';
          else if (name.includes('back') || name.includes('spine')) bodyPart = 'back';
          else if (name.includes('arm') || name.includes('shoulder')) bodyPart = 'arms';
          else if (name.includes('hand') || name.includes('wrist')) bodyPart = 'hands';
          else if (name.includes('leg') || name.includes('thigh') || name.includes('knee')) bodyPart = 'legs';
          else if (name.includes('foot') || name.includes('ankle') || name.includes('toe')) bodyPart = 'feet';
          
          // Store the body part name for interaction
          node.userData.bodyPart = bodyPart;
          
          // Make the mesh interactive
          node.userData.originalMaterial = node.material.clone();
          node.material = new THREE.MeshStandardMaterial({
            color: 0x64748b,
            metalness: 0.2,
            roughness: 0.8,
          });
        }
      });
      
      return (
        <primitive 
          object={clonedScene} 
          scale={[1, 1, 1]} 
          position={[0, -1, 0]}
          onPointerOver={(e) => {
            e.stopPropagation();
            if (e.object.userData.bodyPart) {
              handlePointerOver(e.object.userData.bodyPart);
              e.object.material.color.set(0x3B82F6);
            }
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            handlePointerOut();
            if (e.object.userData.bodyPart) {
              e.object.material.color.set(0x64748b);
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (e.object.userData.bodyPart) {
              handleClick(e.object.userData.bodyPart);
            }
          }}
        />
      );
    } catch (error) {
      console.error('Error loading GLTF model:', error);
      setModelLoadError(true);
      return null;
    }
  };

  // Fallback to simple model if GLTF fails to load
  const SimpleModel = () => {
    // Common material properties
    const getMaterial = (part: string) => {
      return {
        color: hoveredPart === part ? '#3B82F6' : '#64748b',
        metalness: 0.2,
        roughness: 0.8,
      };
    };

    return (
      <>
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

        {/* Neck */}
        <mesh
          position={[0, 1.45, 0]}
          onPointerOver={() => handlePointerOver('neck')}
          onPointerOut={handlePointerOut}
          onClick={() => handleClick('neck')}
        >
          <cylinderGeometry args={[0.1, 0.12, 0.15, 32]} />
          <meshStandardMaterial {...getMaterial('neck')} />
        </mesh>

        {/* Body - Chest */}
        <mesh
          position={[0, 1.1, 0]}
          onPointerOver={() => handlePointerOver('chest')}
          onPointerOut={handlePointerOut}
          onClick={() => handleClick('chest')}
        >
          <capsuleGeometry args={[0.25, 0.5, 16, 32]} />
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

        {/* Back */}
        <mesh
          position={[0, 0.8, -0.15]}
          onPointerOver={() => handlePointerOver('back')}
          onPointerOut={handlePointerOut}
          onClick={() => handleClick('back')}
        >
          <boxGeometry args={[0.4, 0.8, 0.1]} />
          <meshStandardMaterial {...getMaterial('back')} />
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

        {/* Left Hand */}
        <mesh
          position={[-0.55, 0.7, 0]}
          onPointerOver={() => handlePointerOver('hands')}
          onPointerOut={handlePointerOut}
          onClick={() => handleClick('hands')}
        >
          <boxGeometry args={[0.1, 0.15, 0.05]} />
          <meshStandardMaterial {...getMaterial('hands')} />
        </mesh>

        {/* Right Hand */}
        <mesh
          position={[0.55, 0.7, 0]}
          onPointerOver={() => handlePointerOver('hands')}
          onPointerOut={handlePointerOut}
          onClick={() => handleClick('hands')}
        >
          <boxGeometry args={[0.1, 0.15, 0.05]} />
          <meshStandardMaterial {...getMaterial('hands')} />
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

        {/* Left Foot */}
        <mesh
          position={[-0.2, -0.7, 0.1]}
          onPointerOver={() => handlePointerOver('feet')}
          onPointerOut={handlePointerOut}
          onClick={() => handleClick('feet')}
        >
          <boxGeometry args={[0.12, 0.1, 0.25]} />
          <meshStandardMaterial {...getMaterial('feet')} />
        </mesh>

        {/* Right Foot */}
        <mesh
          position={[0.2, -0.7, 0.1]}
          onPointerOver={() => handlePointerOver('feet')}
          onPointerOut={handlePointerOut}
          onClick={() => handleClick('feet')}
        >
          <boxGeometry args={[0.12, 0.1, 0.25]} />
          <meshStandardMaterial {...getMaterial('feet')} />
        </mesh>
      </>
    );
  };

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      <Suspense fallback={<SimpleModel />}>
        {!modelLoadError ? <SimpleModel /> : <SimpleModel />}
      </Suspense>
      
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
  const [gender, setGender] = useState<'male' | 'female'>('male');

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

  // Handle gender toggle
  const handleGenderToggle = () => {
    setGender(prev => prev === 'male' ? 'female' : 'male');
  };

  // Update parent component when symptoms change
  useEffect(() => {
    onSelectSymptoms(selectedSymptoms);
  }, [selectedSymptoms, onSelectSymptoms]);

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4">
      <Card className="flex-1 min-h-[300px] md:min-h-[400px]">
        <CardContent className="p-4 h-full">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Human Anatomy Model</h3>
            <button 
              onClick={handleGenderToggle}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm min-w-[140px] "
            >
              {gender === 'male' ? 'Switch to Female' : 'Switch to Male'}
            </button>
          </div>
          
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={0.5} castShadow />
            
            <EnhancedHumanModel 
              onSelectBodyPart={handleSelectBodyPart} 
              gender={gender}
            />
            
            <ContactShadows 
              position={[0, -1.5, 0]} 
              opacity={0.4} 
              scale={10} 
              blur={2} 
              far={4} 
            />
            
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