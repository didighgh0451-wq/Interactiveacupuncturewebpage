import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Hand, Clock, RotateCcw, Sparkles } from 'lucide-react';
import type { Symptom, AcupressurePoint, BodyPart } from './acupressure-data';

interface ResultPageProps {
  bodyPart: BodyPart;
  symptom: Symptom;
  point: AcupressurePoint;
  onBack: () => void;
  onFinish: () => void;
}

// SVG illustration for each body part - shows approximate point location
function PointIllustration({ bodyPartId }: { bodyPartId: string }) {
  const illustrations: Record<string, JSX.Element> = {
    head: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <circle cx="60" cy="50" r="30" fill="#e0f2f1" stroke="#14b8a6" strokeWidth="1.5" />
        <circle cx="60" cy="50" r="20" fill="#b2dfdb" opacity="0.5" />
        <circle cx="60" cy="35" r="4" fill="#0d9488">
          <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="35" r="8" fill="none" stroke="#14b8a6" strokeWidth="1" opacity="0.5">
          <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x="60" y="95" textAnchor="middle" fill="#0d9488" fontSize="10" fontWeight="600">혈자리 위치</text>
      </svg>
    ),
    eyes: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <ellipse cx="40" cy="50" rx="18" ry="10" fill="#e0f2f1" stroke="#14b8a6" strokeWidth="1.5" />
        <ellipse cx="80" cy="50" rx="18" ry="10" fill="#e0f2f1" stroke="#14b8a6" strokeWidth="1.5" />
        <circle cx="40" cy="50" r="4" fill="#0d9488" />
        <circle cx="80" cy="50" r="4" fill="#0d9488" />
        <circle cx="28" cy="48" r="3" fill="#ef4444">
          <animate attributeName="r" values="2.5;4;2.5" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="92" cy="48" r="3" fill="#ef4444">
          <animate attributeName="r" values="2.5;4;2.5" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x="60" y="95" textAnchor="middle" fill="#0d9488" fontSize="10" fontWeight="600">혈자리 위치</text>
      </svg>
    ),
    'neck-shoulder': (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <path d="M60,20 L60,50" stroke="#d1d5db" strokeWidth="8" strokeLinecap="round" />
        <path d="M30,55 L90,55" stroke="#e0f2f1" strokeWidth="12" strokeLinecap="round" />
        <path d="M30,55 L90,55" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" />
        <circle cx="60" cy="45" r="4" fill="#0d9488">
          <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="42" cy="55" r="3" fill="#0d9488" opacity="0.6" />
        <circle cx="78" cy="55" r="3" fill="#0d9488" opacity="0.6" />
        <text x="60" y="95" textAnchor="middle" fill="#0d9488" fontSize="10" fontWeight="600">혈자리 위치</text>
      </svg>
    ),
    stomach: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <ellipse cx="60" cy="50" rx="28" ry="35" fill="#e0f2f1" stroke="#14b8a6" strokeWidth="1.5" />
        <circle cx="60" cy="55" r="3" fill="#d1d5db" />
        <circle cx="60" cy="40" r="4" fill="#0d9488">
          <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="65" r="3" fill="#0d9488" opacity="0.5" />
        <text x="60" y="100" textAnchor="middle" fill="#0d9488" fontSize="10" fontWeight="600">혈자리 위치</text>
      </svg>
    ),
    hands: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <path d="M45,80 L45,35 M55,75 L55,25 M65,75 L65,28 M75,80 L75,38 M40,82 L30,65" stroke="#e0f2f1" strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="58" cy="90" rx="22" ry="15" fill="#e0f2f1" stroke="#14b8a6" strokeWidth="1.5" />
        <circle cx="55" cy="65" r="4" fill="#0d9488">
          <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x="60" y="115" textAnchor="middle" fill="#0d9488" fontSize="10" fontWeight="600">혈자리 위치</text>
      </svg>
    ),
    back: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <path d="M60,15 C60,15 50,30 50,50 C50,70 55,80 60,90 C65,80 70,70 70,50 C70,30 60,15 60,15Z" fill="#e0f2f1" stroke="#14b8a6" strokeWidth="1.5" />
        <line x1="60" y1="20" x2="60" y2="85" stroke="#14b8a6" strokeWidth="1" strokeDasharray="3,3" />
        <circle cx="60" cy="55" r="4" fill="#0d9488">
          <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="55" r="2.5" fill="#0d9488" opacity="0.5" />
        <circle cx="70" cy="55" r="2.5" fill="#0d9488" opacity="0.5" />
        <text x="60" y="105" textAnchor="middle" fill="#0d9488" fontSize="10" fontWeight="600">혈자리 위치</text>
      </svg>
    ),
    legs: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <path d="M45,15 L42,70 L40,95" stroke="#e0f2f1" strokeWidth="14" strokeLinecap="round" />
        <path d="M75,15 L78,70 L80,95" stroke="#e0f2f1" strokeWidth="14" strokeLinecap="round" />
        <circle cx="45" cy="55" r="4" fill="#0d9488">
          <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="75" cy="55" r="4" fill="#0d9488">
          <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x="60" y="115" textAnchor="middle" fill="#0d9488" fontSize="10" fontWeight="600">혈자리 위치</text>
      </svg>
    ),
  };

  return illustrations[bodyPartId] || illustrations.head;
}

export function ResultPage({ bodyPart, symptom, point, onBack, onFinish }: ResultPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/40 via-white to-white px-6 py-10 md:py-16 overflow-auto">
      <div className="max-w-lg mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-teal-600 mb-6 transition-colors cursor-pointer text-[14px]"
          style={{ fontWeight: 500 }}
        >
          <ArrowLeft className="w-4 h-4" />
          증상 선택으로 돌아가기
        </motion.button>

        {/* Step badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-teal-600 text-[12px]"
            style={{ fontWeight: 600 }}
          >
            STEP 3 · 결과
          </span>
        </motion.div>

        {/* Title area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-2 text-[13px] text-gray-400" style={{ fontWeight: 500 }}>
            <span className="px-2 py-0.5 bg-gray-100 rounded-md">{bodyPart.emoji} {bodyPart.label}</span>
            <span>→</span>
            <span className="px-2 py-0.5 bg-gray-100 rounded-md">{symptom.emoji} {symptom.title}</span>
          </div>
          <h2 className="text-[28px] md:text-[32px] text-gray-900 tracking-tight !leading-[1.3]"
            style={{ fontWeight: 700 }}
          >
            추천 혈자리
          </h2>
        </motion.div>

        {/* Point name card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-teal-500 to-emerald-500 rounded-3xl p-6 mb-4 shadow-lg shadow-teal-500/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <PointIllustration bodyPartId={bodyPart.id} />
            </div>
            <div className="flex-1">
              <p className="text-teal-100 text-[12px] mb-1" style={{ fontWeight: 500 }}>추천 지압 포인트</p>
              <h3 className="text-white text-[24px] tracking-tight" style={{ fontWeight: 800 }}>{point.name}</h3>
            </div>
          </div>
        </motion.div>

        {/* Info cards */}
        <div className="space-y-3">
          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h4 className="text-[15px] text-gray-900 mb-1.5" style={{ fontWeight: 700 }}>위치</h4>
                <p className="text-[14px] text-gray-500 !leading-[1.7]" style={{ fontWeight: 400 }}>{point.location}</p>
              </div>
            </div>
          </motion.div>

          {/* Method */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Hand className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-[15px] text-gray-900 mb-1.5" style={{ fontWeight: 700 }}>지압 방법</h4>
                <p className="text-[14px] text-gray-500 !leading-[1.7]" style={{ fontWeight: 400 }}>{point.method}</p>
              </div>
            </div>
          </motion.div>

          {/* Duration + Repetitions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-[13px] text-gray-400" style={{ fontWeight: 600 }}>시간</span>
              </div>
              <p className="text-[14px] text-gray-800" style={{ fontWeight: 600 }}>{point.duration}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <RotateCcw className="w-4 h-4 text-purple-500" />
                <span className="text-[13px] text-gray-400" style={{ fontWeight: 600 }}>횟수</span>
              </div>
              <p className="text-[14px] text-gray-800" style={{ fontWeight: 600 }}>{point.repetitions}</p>
            </div>
          </motion.div>

          {/* Expected effects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-teal-500" />
              <h4 className="text-[15px] text-gray-900" style={{ fontWeight: 700 }}>기대 효과</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {point.effects.map((effect, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-[13px]"
                  style={{ fontWeight: 500 }}
                >
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                  {effect}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 space-y-3"
        >
          <button
            onClick={onFinish}
            className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-2xl text-[16px] shadow-lg shadow-teal-500/20 hover:shadow-xl transition-all cursor-pointer active:scale-[0.98]"
            style={{ fontWeight: 700 }}
          >
            다른 부위도 알아보기 →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
