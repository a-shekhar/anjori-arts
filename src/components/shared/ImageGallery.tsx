"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: { url: string; alt: string }[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen]);

  const selectedImage = images[selectedIndex];

  if (!selectedImage) {
    return (
      <div className="aspect-[4/5] w-full rounded-2xl bg-muted/30 flex items-center justify-center">
        <span className="text-muted-foreground">No image available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <button 
        type="button"
        className="group relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-muted/30 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => setIsLightboxOpen(true)}
        aria-label={`Enlarge image: ${selectedImage.alt}`}
      >
        <Image
          src={selectedImage.url}
          alt={selectedImage.alt}
          fill
          priority
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 55vw"
        />
        <div className="absolute right-4 top-4 rounded-full bg-background/80 p-2 text-foreground backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 shadow-sm" aria-hidden="true">
          <ZoomIn className="size-4" />
        </div>
      </button>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" role="group" aria-label="Artwork image thumbnails">
          {images.map((img, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              aria-label={`View photo ${idx + 1} of ${images.length}: ${img.alt || "Artwork thumbnail"}`}
              aria-pressed={selectedIndex === idx}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selectedIndex === idx 
                  ? "border-primary ring-2 ring-primary/20 ring-offset-1" 
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={img.url}
                alt=""
                aria-hidden="true"
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Overlay via Portal */}
      {mounted && isLightboxOpen && createPortal(
        <div 
          role="dialog"
          aria-modal="true"
          aria-label={`Enlarged view: ${selectedImage.alt}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-8"
        >
          <button 
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute right-4 top-4 z-[100] rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close enlarged image"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
          
          <div className="relative h-full w-full max-w-5xl">
            <Image
              src={selectedImage.url}
              alt={selectedImage.alt}
              fill
              className="object-contain"
              sizes="100vw"
              quality={100}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

