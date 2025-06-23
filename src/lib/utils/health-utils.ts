/**
 * Health-related utility functions for the MediMap application
 */

/**
 * Calculate Body Mass Index (BMI)
 * @param weight Weight in kilograms
 * @param height Height in meters
 * @returns BMI value (weight / height²)
 */
export function calculateBMI(weight: number, height: number): number {
  if (weight <= 0 || height <= 0) {
    throw new Error('Weight and height must be positive values');
  }
  return parseFloat((weight / (height * height)).toFixed(1));
}

/**
 * Interpret BMI value according to standard categories
 * @param bmi BMI value
 * @returns Category description
 */
export function interpretBMI(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/**
 * Calculate estimated daily calorie needs
 * @param weight Weight in kilograms
 * @param height Height in meters
 * @param age Age in years
 * @param isMale Boolean indicating if the person is male
 * @param activityLevel Activity level factor (1.2 - sedentary, 1.375 - light, 1.55 - moderate, 1.725 - active, 1.9 - very active)
 * @returns Estimated daily calorie needs
 */
export function calculateCalorieNeeds(
  weight: number,
  height: number,
  age: number,
  isMale: boolean,
  activityLevel: number
): number {
  // Using Mifflin-St Jeor Equation
  let bmr: number;

  if (isMale) {
    bmr = 10 * weight + 6.25 * (height * 100) - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * (height * 100) - 5 * age - 161;
  }

  return Math.round(bmr * activityLevel);
}

/**
 * Calculate target heart rate zone for exercise
 * @param age Age in years
 * @returns Object containing lower and upper bounds of target heart rate zone
 */
export function calculateTargetHeartRate(age: number): { lower: number; upper: number } {
  const maxHeartRate = 220 - age;
  return {
    lower: Math.round(maxHeartRate * 0.64),
    upper: Math.round(maxHeartRate * 0.76)
  };
}

/**
 * Calculate water intake recommendation based on weight
 * @param weight Weight in kilograms
 * @returns Recommended water intake in liters
 */
export function calculateWaterIntake(weight: number): number {
  // General recommendation is 30-35 ml per kg of body weight
  return parseFloat((weight * 0.033).toFixed(1));
}

/**
 * Check if symptoms might indicate an emergency situation
 * @param symptoms Array of symptom strings
 * @returns Boolean indicating if emergency care might be needed
 */
export function checkEmergencySymptoms(symptoms: string[]): boolean {
  const emergencySymptoms = [
    'chest pain',
    'difficulty breathing',
    'severe bleeding',
    'loss of consciousness',
    'sudden severe headache',
    'sudden numbness',
    'sudden confusion',
    'severe abdominal pain',
    'suicidal thoughts'
  ];

  return symptoms.some(symptom =>
    emergencySymptoms.some(emergencySymptom =>
      symptom.toLowerCase().includes(emergencySymptom)
    )
  );
}