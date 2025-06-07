'use client';

import { motion } from 'framer-motion';

interface StepProps {
  number: number;
  title: string;
  description: string;
}

const Step = ({ number, title, description }: StepProps) => {
  return (
    <motion.div 
      className="flex items-start gap-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
};

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Enter Your Symptoms",
      description: "Use our interactive 3D model or type in your symptoms to help us understand your healthcare needs."
    },
    {
      number: 2,
      title: "View Recommended Specialists",
      description: "Based on your symptoms, we'll recommend the most appropriate medical specialists for your condition."
    },
    {
      number: 3,
      title: "Find Nearby Facilities",
      description: "See healthcare facilities near you that have the specialists you need, filtered by distance and availability."
    },
    {
      number: 4,
      title: "Get Directions & Book",
      description: "Choose a facility, get directions, and book your appointment directly through our platform."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            How <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">MediMap</span> Works
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Finding the right healthcare has never been easier. Follow these simple steps:
          </motion.p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-12">
            {steps.map((step, index) => (
              <Step 
                key={index} 
                number={step.number} 
                title={step.title} 
                description={step.description} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}