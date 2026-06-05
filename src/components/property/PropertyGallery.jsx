// src/components/property/PropertyGallery.jsx

import { useState } from "react";
import { FiX } from "react-icons/fi";

export default function PropertyGallery({ mainImage, gallery = [], title }) {
  const [lightbox, setLightbox] = useState(null);

  const allImages = [mainImage, ...gallery].filter(Boolean);

  return (
    <>
      {/* Main Image + Thumbnails */}
      <div className="glass-card overflow-hidden">
        <div className="relative h-[280px] md:h-[520px]">
          <img
            src={mainImage}
            alt={title}
            className="h-full w-full cursor-pointer object-cover"
            onClick={() => setLightbox(mainImage)}
          />
          <div className="absolute left-4 top-4 rounded-xl bg-black/60 px-4 py-2 text-sm font-semibold text-white">
            {allImages.length} Photos
          </div>
          <button className="absolute right-4 top-4 rounded-xl bg-white px-4 py-2 text-sm font-bold shadow">
            Watch Video Tour
          </button>
        </div>

        {gallery.length > 0 && (
          <div className="grid grid-cols-3 gap-3 p-4">
            {gallery.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Gallery ${i + 1}`}
                className="h-24 w-full cursor-pointer rounded-xl object-cover transition hover:opacity-80"
                onClick={() => setLightbox(img)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink-900 shadow-lg"
            onClick={() => setLightbox(null)}
          >
            <FiX />
          </button>
          <img
            src={lightbox}
            alt="Lightbox"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
