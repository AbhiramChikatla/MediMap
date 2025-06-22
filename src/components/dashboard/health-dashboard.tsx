'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BMICalculator } from '@/components/ui/bmi-calculator';
import { calculateCalorieNeeds, calculateTargetHeartRate, calculateWaterIntake } from '@/lib/utils';

export function HealthDashboard() {
  const [age, setAge] = useState<number>(30);
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<number>(1.375); // Light activity

  // Calculate health metrics
  const calorieNeeds = calculateCalorieNeeds(
    weight,
    height / 100, // Convert to meters
    age,
    gender === 'male',
    activityLevel
  );

  const heartRateZone = calculateTargetHeartRate(age);
  const waterIntake = calculateWaterIntake(weight);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Health Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Daily Calories</CardTitle>
            <CardDescription>Estimated daily calorie needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{calorieNeeds}</div>
            <p className="text-sm text-muted-foreground">calories per day</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Target Heart Rate</CardTitle>
            <CardDescription>For optimal exercise intensity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{heartRateZone.lower} - {heartRateZone.upper}</div>
            <p className="text-sm text-muted-foreground">beats per minute</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Water Intake</CardTitle>
            <CardDescription>Recommended daily water consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{waterIntake}</div>
            <p className="text-sm text-muted-foreground">liters per day</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="bmi" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bmi">BMI Calculator</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="bmi" className="mt-6">
          <BMICalculator />
        </TabsContent>
        <TabsContent value="nutrition" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Tracker</CardTitle>
              <CardDescription>
                Track your daily nutrition intake and get personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Nutrition tracking features coming soon!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Monitor</CardTitle>
              <CardDescription>
                Track your physical activities and exercise routines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Activity monitoring features coming soon!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}