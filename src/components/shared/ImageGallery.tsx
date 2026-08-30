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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

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
      <div 
        className="group relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-muted/30"
        onClick={() => setIsLightboxOpen(true)}
      >
        <Image
          src={selectedImage.url}
          alt={selectedImage.alt}
          fill
          priority
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 55vw"
        />
        <div className="absolute right-4 top-4 rounded-full bg-background/80 p-2 text-foreground backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 shadow-sm">
          <ZoomIn className="size-4" />
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                selectedIndex === idx 
                  ? "border-primary ring-2 ring-primary/20 ring-offset-1" 
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={img.url}
                alt={`Thumbnail ${idx + 1}`}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-8">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute right-4 top-4 z-[100] rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="size-6" />
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

