'use client';

import React from 'react';
import Image from 'next/image';
const galleryImages = [{
  src: '/contents/event_image_3-1.png',
  className: 'col-span-12 md:col-span-5 h-[300px] md:h-[400px]'
}, {
  src: '/contents/event_image_3-2.png',
  className: 'col-span-12 md:col-span-4 h-[300px] md:h-[400px]'
}, {
  src: '/contents/event_image_3.png.webp',
  className: 'col-span-12 md:col-span-3 h-[300px] md:h-[400px]'
}, {
  src: '/contents/event_image_3-3.png.webp',
  className: 'col-span-6 md:col-span-3 h-[250px] md:h-[350px]'
}, {
  src: '/contents/event_image_3-4.png.webp',
  className: 'col-span-6 md:col-span-3 h-[250px] md:h-[350px]'
}, {
  src: '/contents/family_vector_1.png',
  className: 'col-span-12 md:col-span-4 h-[250px] md:h-[350px]'
}, {
  src: '/contents/friends_vector_1.png',
  className: 'col-span-12 md:col-span-2 h-[250px] md:h-[350px]'
}];
export function GallerySection() {
  return <section className="relative py-16 lg:py-24 overflow-hidden">

      <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F43F5E]/10 blur-[120px]"></div>

      <div className="container relative z-10 mx-auto px-4">

        <div className="mb-12 text-center lg:mb-20">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            Собирайте команду,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              другие миры ждут вас
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          {galleryImages.map((img, index) => <div key={index} className={`relative overflow-hidden rounded-2xl border border-white/5 shadow-2xl group transition-all duration-500 hover:border-primary/30 ${img.className}`}>
              <Image src={img.src} alt={`Gallery image ${index + 1}`} fill className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1" />

              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0"></div>
            </div>)}
        </div>
      </div>
    </section>;
}
