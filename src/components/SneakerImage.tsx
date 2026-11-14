import React, { useState } from 'react';
import { resolveProductImage } from '../assets/sneakerImages';

interface SneakerImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  darkFallback?: boolean;
}

export function SneakerImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  loading = 'lazy',
  darkFallback = false,
}: SneakerImageProps) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = resolveProductImage(src);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`w-full h-full flex flex-col items-center justify-center p-6 text-center ${
          darkFallback
            ? 'bg-gradient-to-br from-[#161B22] to-[#0D1117] text-stone-300'
            : 'bg-gradient-to-br from-[#F4F2EE] to-[#E8E4DC] text-stone-700'
        }`}
      >
        <svg
          className="w-10 h-10 mb-2 opacity-60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M3 16h18v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2Z" />
          <path d="M4 16c1-4 3-7 5-8l3 3c2 1 5 1 8 2l1 3" />
        </svg>
        <span className="text-xs font-medium tracking-wide line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
