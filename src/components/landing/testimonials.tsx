'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import Image from 'next/image';

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  rating: number;
}



export function Testimonials() {
  

  return (
    <section id="testimonials" className="py-20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by teams worldwide</h2>
            <p className="text-xl text-gray-600">Join thousands of companies already using Medimap</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Medimap transformed our workflow completely. We've reduced project completion time by 60% and our
                  team has never been more productive."
                </p>
                <div className="flex items-center">
                  <Image
                    src="https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3534&q=80"
                    alt="John Doe"
                    width={40}
                    height={40}
                    className="rounded-full mr-3"
                  />
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-gray-500">CEO, TechCorp</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The AI automation features are incredible. Tasks that used to take hours now happen automatically.
                  It's like having a super-efficient assistant."
                </p>
                <div className="flex items-center">
                  <Image
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
                    alt="Michael Chen"
                    width={40}
                    height={40}
                    className="rounded-full mr-3"
                  />
                  <div>
                    <p className="font-semibold">Michael Chen</p>
                    <p className="text-sm text-gray-500">Product Manager, StartupXYZ</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Finally, a tool that actually delivers on its promises. Our team collaboration has improved
                  dramatically since switching to Medimap."
                </p>
                <div className="flex items-center">
                  <Image
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80"
                    alt="Emily Rodriguez"
                    width={40}
                    height={40}
                    className="rounded-full mr-3"
                  />
                  <div>
                    <p className="font-semibold">Emily Rodriguez</p>
                    <p className="text-sm text-gray-500">Operations Director, GrowthCo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
  );
}