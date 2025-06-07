'use client';

import { useEffect } from 'react';

import { CTA, Features, Footer, Hero, Pricing, Testimonials } from "@/components/landing"
import { Navbar } from '@/components/landing/navbar';

export default function LandingPage() {

  // Add smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (!anchor) return;
      
      const href = anchor.getAttribute('href');
      if (!href?.startsWith('#')) return;
      
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 100, // Offset for header
          behavior: 'smooth'
        });
      }
    };
    
    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Navbar/>

      {/* Hero Section */}
      <Hero/> 

      {/* Features Section */}
      <Features/>

      {/* Testimonials Section */}
      <Testimonials/>

      {/* Pricing Section */}
      <Pricing/>

      {/* Final CTA Section */}
      <CTA/>

      {/* Footer */}
      <Footer/>
    </div>
  )
}
