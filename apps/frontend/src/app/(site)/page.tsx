import { EventsSection } from '@/components/events-section';
import { GallerySection } from '@/components/gallery-section';
import { GameDetailsSection } from '@/components/game-details-section';
import { HeroSection } from '@/components/hero-section';
import { RulesSection } from '@/components/rules-section';

export default function LandingPage() {
  return (
    <div className="space-y-12 py-20 sm:space-y-16">
      <HeroSection />

      <div className="mx-auto max-w-6xl px-4">
        <EventsSection />
      </div>

      <GameDetailsSection />

      <div className="mx-auto max-w-6xl space-y-12 px-4 pb-12 sm:space-y-16 sm:pb-16">
        <RulesSection />
      </div>

      <GallerySection />
    </div>
  );
}
