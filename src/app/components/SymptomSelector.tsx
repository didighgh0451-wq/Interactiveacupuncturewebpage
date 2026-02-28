import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import type { BodyPart, Symptom } from './acupressure-data';

interface SymptomSelectorProps {
  bodyPart: BodyPart;
  onSelectSymptom: (symptom: Symptom) => void;
  onBack: () => void;
}

export function SymptomSelector({ bodyPart, onSelectSymptom, onBack }: SymptomSelectorProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-gradient-to-b from-teal-50/30 via-white to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-teal-50/60 to-transparent pointer-events-none" />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-teal-600 mb-8 transition-colors cursor-pointer text-[14px]"
          style={{ fontWeight: 500 }}
        >
          <ArrowLeft className="w-4 h-4" />
          바디맵으로 돌아가기
        </motion.button>

        {/* Step badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-teal-600 text-[12px]"
            style={{ fontWeight: 600 }}
          >
            STEP 2
          </span>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-[28px] md:text-[32px] text-gray-900 tracking-tight !leading-[1.3]"
            style={{ fontWeight: 700 }}
          >
            <span className="text-[36px] mr-2">{bodyPart.emoji}</span>
            {bodyPart.label}
            <span className="text-teal-500">에서</span>
            <br />
            어떤 증상이 있나요?
          </h2>
        </motion.div>

        {/* Symptom cards */}
        <div className="space-y-3">
          {bodyPart.symptoms.map((symptom, index) => (
            <motion.button
              key={symptom.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectSymptom(symptom)}
              className="w-full text-left bg-white border border-gray-100 shadow-sm p-5 rounded-2xl transition-all hover:shadow-lg hover:border-teal-200 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gray-50 group-hover:bg-teal-50 flex items-center justify-center text-[22px] transition-colors">
                    {symptom.emoji}
                  </div>
                  <div>
                    <span className="text-[17px] text-gray-800 block" style={{ fontWeight: 600 }}>
                      {symptom.title}
                    </span>
                    <span className="text-[13px] text-gray-400 mt-0.5 block" style={{ fontWeight: 400 }}>
                      맞춤 혈자리 추천
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-teal-500 flex items-center justify-center transition-colors">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-300 group-hover:text-white transition-colors">
                    <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
