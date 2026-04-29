import React, { useEffect } from 'react';
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { StatsSection } from '../components/landing/StatsSection';
import { CTASection } from '../components/landing/CTASection';
import { Footer } from '../components/landing/Footer';

export function LandingPage() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/30">
      <Navbar />
      <main>
        <HeroSection />
        <section id="features">
          <FeaturesSection />
        </section>
        <section id="how-it-works">
          <StatsSection />
        </section>
        <section id="enterprise">
          <CTASection />
        </section>
      </main>
      <Footer />
    </div>
  );
}
