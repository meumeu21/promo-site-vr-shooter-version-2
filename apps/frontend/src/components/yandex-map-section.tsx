'use client';

import React from 'react';

export function YandexMapSection() {
  return (
    <section className="relative w-full overflow-hidden pt-16 lg:pt-24">
      {/* Title */}
      <div className="container mx-auto px-4 mb-12">
        <h2 className="text-4xl sm:text-6xl font-black text-white uppercase text-center tracking-tighter italic">
          КАК НАС <span className="text-primary">НАЙТИ</span>
        </h2>
        <div className="mx-auto mt-4 h-1 w-32 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
      </div>

      {/* Map Container with Filters for Dark Mode Effect */}
      <div className="relative w-full h-[450px] md:h-[600px] lg:h-[720px] overflow-hidden border-y border-white/5">
        <div className="absolute inset-0 w-full h-full grayscale invert-[0.92] brightness-[0.9] contrast-[1.2] opacity-80">
          <iframe
            src="https://yandex.ru/map-widget/v1/?um=constructor%3A70f042e9b3ac57bfd7e81ca1cbe7e046129bbee47edd3cc06906feca9fc766ed&amp;source=constructor"
            width="100%"
            height="100%"
            frameBorder="0"
            className="w-full h-full"
            title="Yandex Maps Location"
          ></iframe>
        </div>

        {/* Subtle HUD Overlays */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.6)]"></div>
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-background to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-background to-transparent"></div>

        {/* Corner Decals */}
        <div className="absolute top-10 left-10 h-12 w-12 border-t-2 border-l-2 border-primary/30 pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 h-12 w-12 border-b-2 border-r-2 border-primary/30 pointer-events-none"></div>
      </div>
    </section>
  );
}
