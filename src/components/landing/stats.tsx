'use client';

import { motion } from 'framer-motion';
import { Users, Building, MapPin, Clock } from 'lucide-react';

interface StatProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const Stat = ({ icon, value, label }: StatProps) => {
  return (
    <motion.div 
      className="text-center p-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
        <div className="text-blue-600 dark:text-blue-400">
          {icon}
        </div>
      </div>
      <h3 className="text-3xl md:text-4xl font-bold mb-2">{value}</h3>
      <p className="text-gray-600 dark:text-gray-400">{label}</p>
    </motion.div>
  );
};

export function Stats() {
  const stats = [
    {
      icon: <Users size={24} />,
      value: "10,000+",
      label: "Active Users"
    },
    {
      icon: <Building size={24} />,
      value: "5,000+",
      label: "Healthcare Facilities"
    },
    {
      icon: <MapPin size={24} />,
      value: "500+",
      label: "Cities Covered"
    },
    {
      icon: <Clock size={24} />,
      value: "2 min",
      label: "Avg. Search Time"
    }
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Stat 
              key={index} 
              icon={stat.icon} 
              value={stat.value} 
              label={stat.label} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}