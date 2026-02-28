import { motion } from 'motion/react';

interface IntroSectionProps {
  onStart: () => void;
}

export function IntroSection({ onStart }: IntroSectionProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-teal-50 via-white to-emerald-50/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[15%] left-[10%] w-72 h-72 bg-teal-100/40 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center max-w-lg text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Decorative icon */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
        >
          <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="12" r="6" fill="white" opacity="0.9" />
              <path d="M24 20C18 20 14 26 14 32L18 44H30L34 32C34 26 30 20 24 20Z" fill="white" opacity="0.9" />
              <circle cx="24" cy="28" r="2" fill="#14b8a6" />
              <circle cx="24" cy="34" r="1.5" fill="#14b8a6" opacity="0.7" />
              <circle cx="20" cy="26" r="1.5" fill="#14b8a6" opacity="0.5" />
              <circle cx="28" cy="26" r="1.5" fill="#14b8a6" opacity="0.5" />
            </svg>
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-5"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-50 border border-teal-100 rounded-full text-teal-700 text-[13px] tracking-wide"
            style={{ fontWeight: 600 }}
          >
            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
            한의학 셀프케어 가이드
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-[36px] md:text-[44px] text-gray-900 mb-4 tracking-tight !leading-[1.2]"
          style={{ fontWeight: 800 }}
        >
          내 몸이 보내는 신호,
          <br />
          <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
            혈자리로 풀어봐
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-gray-500 text-[17px] mb-10 max-w-sm !leading-[1.7]"
          style={{ fontWeight: 400 }}
        >
          불편한 부위를 클릭하면
          <br />
          맞춤 혈자리와 지압법을 알려드려요.
          <br />
          지금 바로 셀프케어를 시작해보세요!
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.04, boxShadow: '0 20px 40px rgba(20, 184, 166, 0.3)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="px-10 py-4 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-2xl text-[17px] shadow-lg shadow-teal-500/25 transition-all cursor-pointer"
          style={{ fontWeight: 700 }}
        >
          시작하기 →
        </motion.button>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 flex flex-col items-center text-gray-400"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
