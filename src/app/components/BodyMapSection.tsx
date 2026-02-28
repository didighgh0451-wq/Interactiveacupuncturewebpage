import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BODY_PARTS, type BodyPart } from './acupressure-data';

interface BodyMapSectionProps {
  onSelectPart: (part: BodyPart) => void;
}

// SVG body parts data for the interactive silhouette
const BODY_SVG_REGIONS: Record<string, { paths: string[]; labelPos: { x: number; y: number } }> = {
  head: {
    paths: [
      // Head oval
      'M185,35 C185,10 215,10 215,35 C215,60 210,70 200,75 C190,70 185,60 185,35 Z',
    ],
    labelPos: { x: 200, y: 45 },
  },
  eyes: {
    paths: [
      // Eye area (forehead band)
      'M188,38 C188,32 200,28 212,38 C210,44 200,48 188,38 Z',
    ],
    labelPos: { x: 200, y: 38 },
  },
  'neck-shoulder': {
    paths: [
      // Neck
      'M193,72 L207,72 L210,92 L190,92 Z',
      // Left shoulder
      'M190,92 L140,105 L135,120 L188,108 Z',
      // Right shoulder
      'M210,92 L260,105 L265,120 L212,108 Z',
    ],
    labelPos: { x: 200, y: 100 },
  },
  stomach: {
    paths: [
      // Torso / abdomen
      'M162,118 L238,118 L235,200 L230,230 L170,230 L165,200 Z',
    ],
    labelPos: { x: 200, y: 170 },
  },
  hands: {
    paths: [
      // Left arm + hand
      'M140,105 L120,180 L110,215 L100,240 L88,235 L105,195 L115,170 L135,120 Z',
      // Right arm + hand
      'M260,105 L280,180 L290,215 L300,240 L312,235 L295,195 L285,170 L265,120 Z',
    ],
    labelPos: { x: 95, y: 240 },
  },
  back: {
    paths: [
      // Hip/lower back area
      'M170,228 L230,228 L240,265 L220,280 L180,280 L160,265 Z',
    ],
    labelPos: { x: 200, y: 255 },
  },
  legs: {
    paths: [
      // Left leg
      'M168,278 L192,280 L185,350 L178,420 L170,440 L155,435 L162,380 L160,330 Z',
      // Right leg
      'M232,278 L208,280 L215,350 L222,420 L230,440 L245,435 L238,380 L240,330 Z',
      // Left foot
      'M155,435 L170,440 L168,460 L148,458 Z',
      // Right foot
      'M245,435 L230,440 L232,460 L252,458 Z',
    ],
    labelPos: { x: 200, y: 380 },
  },
};

export function BodyMapSection({ onSelectPart }: BodyMapSectionProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleClick = (part: BodyPart) => {
    setSelectedId(part.id);
    setTimeout(() => onSelectPart(part), 400);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-gradient-to-b from-white to-gray-50/50 relative overflow-hidden">
      {/* Header */}
      <motion.div
        className="text-center mb-10 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-teal-600 text-[12px] mb-4"
          style={{ fontWeight: 600 }}
        >
          STEP 1
        </span>
        <h2 className="text-[28px] md:text-[34px] text-gray-900 tracking-tight !leading-[1.3]"
          style={{ fontWeight: 700 }}
        >
          어디가 불편하신가요?
        </h2>
        <p className="text-gray-400 mt-2 text-[15px]" style={{ fontWeight: 400 }}>
          불편한 부위를 터치해주세요
        </p>
      </motion.div>

      {/* Body map container */}
      <motion.div
        className="relative w-full max-w-[340px] mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <svg viewBox="60 0 280 480" className="w-full h-auto">
          {/* Background glow */}
          <defs>
            <radialGradient id="bodyGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
            </radialGradient>
            <filter id="hoverGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <ellipse cx="200" cy="240" rx="120" ry="230" fill="url(#bodyGlow)" />

          {/* Render body regions */}
          {BODY_PARTS.map((part) => {
            const region = BODY_SVG_REGIONS[part.id];
            if (!region) return null;
            const isHovered = hoveredId === part.id;
            const isSelected = selectedId === part.id;
            const isActive = isHovered || isSelected;

            return (
              <g
                key={part.id}
                onMouseEnter={() => setHoveredId(part.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleClick(part)}
                className="cursor-pointer"
                style={{ filter: isActive ? 'url(#hoverGlow)' : 'none' }}
              >
                {region.paths.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    fill={isActive ? '#14b8a6' : '#e5e7eb'}
                    stroke={isActive ? '#0d9488' : '#d1d5db'}
                    strokeWidth={isActive ? 2 : 1}
                    strokeLinejoin="round"
                    style={{
                      transition: 'fill 0.3s ease, stroke 0.3s ease, stroke-width 0.3s ease',
                      transform: isActive ? 'scale(1.02)' : 'scale(1)',
                      transformOrigin: `${region.labelPos.x}px ${region.labelPos.y}px`,
                      transformBox: 'fill-box',
                    }}
                  />
                ))}
                {/* Hover pulse dot */}
                {isActive && (
                  <>
                    <circle
                      cx={region.labelPos.x}
                      cy={region.labelPos.y}
                      r="4"
                      fill="white"
                      opacity="0.9"
                    >
                      <animate attributeName="r" values="3;6;3" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={region.labelPos.x} cy={region.labelPos.y} r="2.5" fill="white" />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Label tooltip */}
        <AnimatePresence>
          {hoveredId && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-0 z-20"
            >
              <div className="bg-gray-900/90 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[14px] flex items-center gap-2 shadow-xl"
                style={{ fontWeight: 600 }}
              >
                <span>{BODY_PARTS.find(p => p.id === hoveredId)?.emoji}</span>
                <span>{BODY_PARTS.find(p => p.id === hoveredId)?.label}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Body part labels - mobile/tablet */}
      <motion.div
        className="mt-8 flex flex-wrap justify-center gap-2 max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {BODY_PARTS.map((part) => (
          <motion.button
            key={part.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setHoveredId(part.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleClick(part)}
            className={`px-4 py-2 rounded-xl text-[14px] transition-all cursor-pointer ${
              hoveredId === part.id || selectedId === part.id
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300'
            }`}
            style={{ fontWeight: 500 }}
          >
            <span className="mr-1.5">{part.emoji}</span>
            {part.label}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
