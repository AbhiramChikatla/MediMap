'use client';

import { motion } from 'framer-motion';
import { MapPin, Activity, Clock, Shield, Map, Search, BarChart3, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';




export function Features() {
  

  return (
    <section id="features" className="py-20 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to transform how your team works together
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>AI Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Intelligent automation that learns from your patterns and eliminates repetitive tasks
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Team Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Real-time collaboration tools that keep everyone on the same page</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Deep insights into your workflow performance with actionable recommendations
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Bank-level security with SOC 2 compliance and end-to-end encryption</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
  );
}