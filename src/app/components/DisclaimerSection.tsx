import { motion } from 'motion/react';
import { Shield, Share2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface DisclaimerSectionProps {
  onRestart: () => void;
}

export function DisclaimerSection({ onRestart }: DisclaimerSectionProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '내 몸이 보내는 신호, 혈자리로 풀어봐',
          text: '한의학 셀프케어 가이드를 체험해보세요!',
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('링크가 복사되었습니다!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-gradient-to-b from-white to-gray-50 relative">
      <motion.div
        className="max-w-md text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
          className="mb-8 flex justify-center"
        >
          <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 flex items-center justify-center">
            <Shield className="w-9 h-9 text-teal-500" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[24px] md:text-[28px] text-gray-900 tracking-tight mb-4 !leading-[1.3]"
          style={{ fontWeight: 700 }}
        >
          정확한 진단은
          <br />
          <span className="text-teal-600">전문가에게 맡겨주세요</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 text-[15px] mb-8 !leading-[1.7] max-w-sm mx-auto"
          style={{ fontWeight: 400 }}
        >
          이 콘텐츠는 일반적인 건강 정보 제공 목적이며,
          <br />
          의학적 진단이나 치료를 대체하지 않습니다.
          <br />
          지속적인 불편함이 있다면 한의원을 방문해주세요.
        </motion.p>

        {/* Disclaimer card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8 text-left"
        >
          <p className="text-amber-800 text-[13px] !leading-[1.7]" style={{ fontWeight: 500 }}>
            ⚠️ 임산부, 심혈관 질환자, 피부 질환이 있는 부위에는 지압을 삼가주세요.
            통증이 심하거나 증상이 지속되면 반드시 전문의와 상담하세요.
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <a
            href="https://www.naver.com/search?query=내+근처+한의원"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-2xl text-[16px] shadow-lg shadow-teal-500/20 hover:shadow-xl transition-all cursor-pointer active:scale-[0.98]"
            style={{ fontWeight: 700 }}
          >
            <Shield className="w-5 h-5" />
            가까운 한의원 찾기
          </a>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl text-[16px] hover:bg-gray-50 transition-all cursor-pointer active:scale-[0.98]"
            style={{ fontWeight: 600 }}
          >
            <Share2 className="w-5 h-5" />
            결과 공유하기
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 w-full py-3 text-gray-400 text-[14px] hover:text-teal-600 transition-all cursor-pointer"
            style={{ fontWeight: 500 }}
          >
            <RotateCcw className="w-4 h-4" />
            처음부터 다시 하기
          </button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-gray-300 text-[12px]"
          style={{ fontWeight: 400 }}
        >
          &copy; 한의학 셀프케어 가이드 · 건강한 습관의 시작
        </motion.p>
      </motion.div>
    </div>
  );
}
