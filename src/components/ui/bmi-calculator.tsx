'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';
import { calculateBMI, interpretBMI } from '@/lib/utils';

export function BMICalculator() {
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [interpretation, setInterpretation] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleCalculate = () => {
    setError('');
    
    // Validate inputs
    if (!weight || !height) {
      setError('Please enter both weight and height');
      return;
    }
    
    const weightValue = parseFloat(weight);
    const heightValue = parseFloat(height) / 100; // Convert cm to meters
    
    if (isNaN(weightValue) || isNaN(heightValue)) {
      setError('Please enter valid numbers');
      return;
    }
    
    if (weightValue <= 0 || heightValue <= 0) {
      setError('Weight and height must be positive values');
      return;
    }
    
    try {
      const bmiValue = calculateBMI(weightValue, heightValue);
      setBmi(bmiValue);
      setInterpretation(interpretBMI(bmiValue));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during calculation');
      }
    }
  };

  const getInterpretationColor = () => {
    if (!interpretation) return 'text-gray-500';
    
    switch (interpretation) {
      case 'Underweight':
        return 'text-blue-500';
      case 'Normal weight':
        return 'text-green-500';
      case 'Overweight':
        return 'text-yellow-500';
      case 'Obese':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>BMI Calculator</CardTitle>
        <CardDescription>
          Calculate your Body Mass Index to check if your weight is healthy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="Enter your weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            placeholder="Enter your height"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        
        {bmi !== null && (
          <div className="pt-4 text-center">
            <div className="text-2xl font-bold">{bmi}</div>
            <div className={`text-lg font-medium ${getInterpretationColor()}`}>
              {interpretation}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleCalculate} className="w-full">
          Calculate BMI
        </Button>
      </CardFooter>
    </Card>
  );
}