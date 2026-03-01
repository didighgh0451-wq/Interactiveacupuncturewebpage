// 혈자리 위치 시각 가이드 다이어그램
// 각 혈자리에 맞는 SVG 일러스트를 렌더링합니다.

import baekhoeImg from "figma:asset/53caf3969bd178da155e6e60fcd56d3f70207c3f.png";
import pungjiImg from "figma:asset/9cb054bf18dd95b518cfb1eb4d7095c6aacec4df.png";
import cheonchuImg from "figma:asset/9b63330afc669919a429d005330748fa9d6728a6.png";
import imunImg from "figma:asset/d684a2c73d70e1183b7fae25e7f6a94388a11020.png";
import sabaekImg from "figma:asset/64e643918948b08319d82a7c62253bf37bacd99b.png";
import aepungImg from "figma:asset/02c3896894b3f4036ae6b5d52f7811bf461985ed.png";

interface AcupointGuideProps {
  pointName: string;
  accentColor: string;
  isDark: boolean;
}

export function AcupointGuide({ pointName, accentColor, isDark }: AcupointGuideProps) {
  const guide = GUIDES[pointName];
  if (!guide) return null;
  return guide(accentColor, isDark);
}

// 가이드가 있는 혈자리 목록 (다른 혈자리도 추가 가능)
const GUIDES: Record<string, (accent: string, isDark: boolean) => JSX.Element> = {

  // ──── 백회혈: 정수리 꼭대기 ────
  '백회혈': (accent, isDark) => {
    return (
      <div className="mt-3 flex flex-col items-center">
        <div className="relative w-full max-w-[260px] rounded-xl overflow-hidden" style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
          <img
            src={baekhoeImg}
            alt="백회혈 위치 - 정수리 꼭대기"
            className="w-full h-auto object-contain"
            style={{ backgroundColor: isDark ? '#2A2A2C' : '#FFFFFF' }}
          />
          {/* 하단 라벨 오버레이 */}
          <div
            className="absolute bottom-0 left-0 right-0 px-3 py-2 text-center"
            style={{
              background: isDark
                ? 'linear-gradient(to top, rgba(28,28,30,0.95), rgba(28,28,30,0.6), transparent)'
                : 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.6), transparent)',
            }}
          >
            <span className="text-[11px]" style={{ color: accent, fontWeight: 600 }}>
              양쪽 귀 연결선과 코→뒤통수 선이 만나는 점
            </span>
          </div>
        </div>
      </div>
    );
  },

  // ──── 풍지혈: 뒷목 양쪽 오목한 곳 ────
  '풍지혈': (accent, isDark) => {
    return (
      <div className="mt-3 flex flex-col items-center">
        <div className="relative w-full max-w-[260px] rounded-xl overflow-hidden" style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
          <img
            src={pungjiImg}
            alt="풍지혈 위치 - 뒷목 양쪽 오목한 곳"
            className="w-full h-auto object-contain"
            style={{ backgroundColor: isDark ? '#2A2A2C' : '#FFFFFF' }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 px-3 py-2 text-center"
            style={{
              background: isDark
                ? 'linear-gradient(to top, rgba(28,28,30,0.95), rgba(28,28,30,0.6), transparent)'
                : 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.6), transparent)',
            }}
          >
            <span className="text-[11px]" style={{ color: accent, fontWeight: 600 }}>
              뒷머리뼈 아래 양쪽 움푹 들어간 곳
            </span>
          </div>
        </div>
      </div>
    );
  },

  // ──── 천추혈: 배꼽 양옆 4cm ────
  '천추혈': (accent, isDark) => {
    return (
      <div className="mt-3 flex flex-col items-center">
        <div className="relative w-full max-w-[260px] rounded-xl overflow-hidden" style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
          <img
            src={cheonchuImg}
            alt="천추혈 위치"
            className="w-full h-auto object-contain"
            style={{ backgroundColor: isDark ? '#2A2A2C' : '#FFFFFF' }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 px-3 py-2 text-center"
            style={{
              background: isDark
                ? 'linear-gradient(to top, rgba(28,28,30,0.95), rgba(28,28,30,0.6), transparent)'
                : 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.6), transparent)',
            }}
          >
            <span className="text-[11px]" style={{ color: accent, fontWeight: 600 }}>
              배꼽 양옆 손가락 두 마디(약 4cm) 지점
            </span>
          </div>
        </div>
      </div>
    );
  },

  // ──── 이문혈: 귀 앞쪽 오목한 곳 ────
  '이문혈': (accent, isDark) => {
    return (
      <div className="mt-3 flex flex-col items-center">
        <div className="relative w-full max-w-[260px] rounded-xl overflow-hidden" style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
          <img
            src={imunImg}
            alt="이문혈 위치 - 귀 앞쪽 오목한 곳"
            className="w-full h-auto object-contain"
            style={{ backgroundColor: isDark ? '#2A2A2C' : '#FFFFFF' }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 px-3 py-2 text-center"
            style={{
              background: isDark
                ? 'linear-gradient(to top, rgba(28,28,30,0.95), rgba(28,28,30,0.6), transparent)'
                : 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.6), transparent)',
            }}
          >
            <span className="text-[11px]" style={{ color: accent, fontWeight: 600 }}>
              귀 앞쪽 이주(귀구슬) 위 오목한 곳
            </span>
          </div>
        </div>
      </div>
    );
  },

  // ──── 청궁혈: 귀 앞쪽 오목한 곳 ────
  '청궁혈': (accent, isDark) => {
    return (
      <div className="mt-3 flex flex-col items-center">
        <div className="relative w-full max-w-[260px] rounded-xl overflow-hidden" style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
          <img
            src={imunImg}
            alt="청궁혈 위치 - 귀 앞쪽 오목한 곳"
            className="w-full h-auto object-contain"
            style={{ backgroundColor: isDark ? '#2A2A2C' : '#FFFFFF' }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 px-3 py-2 text-center"
            style={{
              background: isDark
                ? 'linear-gradient(to top, rgba(28,28,30,0.95), rgba(28,28,30,0.6), transparent)'
                : 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.6), transparent)',
            }}
          >
            <span className="text-[11px]" style={{ color: accent, fontWeight: 600 }}>
              귀 앞쪽 이주(귀구슬) 앞 오목한 곳
            </span>
          </div>
        </div>
      </div>
    );
  },

  // ──── 사백혈: 눈 아래 오목한 곳 ────
  '사백혈': (accent, isDark) => {
    return (
      <div className="mt-3 flex flex-col items-center">
        <div className="relative w-full max-w-[260px] rounded-xl overflow-hidden" style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
          <img
            src={sabaekImg}
            alt="사백혈 위치 - 눈 아래 오목한 곳"
            className="w-full h-auto object-contain"
            style={{ backgroundColor: isDark ? '#2A2A2C' : '#FFFFFF' }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 px-3 py-2 text-center"
            style={{
              background: isDark
                ? 'linear-gradient(to top, rgba(28,28,30,0.95), rgba(28,28,30,0.6), transparent)'
                : 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.6), transparent)',
            }}
          >
            <span className="text-[11px]" style={{ color: accent, fontWeight: 600 }}>
              눈동자 바로 아래 약 1cm 움푹 들어간 곳
            </span>
          </div>
        </div>
      </div>
    );
  },

  // ──── 애풍혈: 귓불 뒤쪽 오목한 곳 ────
  '예풍혈': (accent, isDark) => {
    return (
      <div className="mt-3 flex flex-col items-center">
        <div className="relative w-full max-w-[260px] rounded-xl overflow-hidden" style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
          <img
            src={aepungImg}
            alt="예풍혈 위치 - 귓불 뒤쪽 오목한 곳"
            className="w-full h-auto object-contain"
            style={{ backgroundColor: isDark ? '#2A2A2C' : '#FFFFFF' }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 px-3 py-2 text-center"
            style={{
              background: isDark
                ? 'linear-gradient(to top, rgba(28,28,30,0.95), rgba(28,28,30,0.6), transparent)'
                : 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.6), transparent)',
            }}
          >
            <span className="text-[11px]" style={{ color: accent, fontWeight: 600 }}>
              귓불 뒤쪽 뼈와 턱 사이 움푹 들어간 곳
            </span>
          </div>
        </div>
      </div>
    );
  },

  // ──── 협거혈: 귓불 아래 턱 관절 부위 ────
  '협거혈': (accent, isDark) => {
    return (
      <div className="mt-3 flex flex-col items-center">
        <div className="relative w-full max-w-[260px] rounded-xl overflow-hidden" style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
          <img
            src={aepungImg}
            alt="협거혈 위치 - 광대뼈 아래 움푹 들어간 곳"
            className="w-full h-auto object-contain -scale-x-100"
            style={{ backgroundColor: isDark ? '#2A2A2C' : '#FFFFFF' }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 px-3 py-2 text-center"
            style={{
              background: isDark
                ? 'linear-gradient(to top, rgba(28,28,30,0.95), rgba(28,28,30,0.6), transparent)'
                : 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.6), transparent)',
            }}
          >
            <span className="text-[11px]" style={{ color: accent, fontWeight: 600 }}>
              광대뼈 아래 모서리에서 움푹 들어간 곳
            </span>
          </div>
        </div>
      </div>
    );
  },

  // ──── 합곡혈: 엄지·검지 사이 ────
  '합곡혈': (accent, isDark) => {
    const skinBg = isDark ? '#3A3028' : '#FDECD0';
    const skinBorder = isDark ? '#5A4A3A' : '#E8D0A8';
    const textColor = isDark ? '#D1D5DB' : '#4B5563';
    const subText = isDark ? '#9CA3AF' : '#6B7280';

    return (
      <div className="mt-3 flex flex-col items-center">
        <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 손등 */}
          <path d="M60 140 L55 90 Q50 50 70 30 L85 25 Q95 22 100 30 L105 50 Q108 22 115 20 L120 18 Q128 16 130 25 L132 50 Q135 22 140 20 Q148 18 150 28 L148 55 Q152 30 158 28 Q165 26 166 38 L160 80 L165 75 Q172 70 178 78 Q182 84 170 100 L150 120 L140 140 Z" fill={skinBg} stroke={skinBorder} strokeWidth="1.5" />

          {/* 엄지와 검지 사이 V자 강조 */}
          <path d="M85 25 Q90 40 105 50" fill="none" stroke={isDark ? '#666' : '#C9A880'} strokeWidth="1" strokeDasharray="2 2" />

          {/* 합곡혈 포인트 */}
          <circle cx="92" cy="42" r="7" fill={accent} fillOpacity="0.15" stroke={accent} strokeWidth="1.5" />
          <circle cx="92" cy="42" r="3" fill={accent} />
          <circle cx="92" cy="42" r="7" fill="none" stroke={accent} strokeWidth="1" opacity="0.4">
            <animate attributeName="r" from="7" to="12" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
          </circle>

          {/* 라벨 */}
          <text x="72" y="30" textAnchor="middle" fill={accent} fontSize="10" fontWeight="600" fontFamily="'Noto Sans KR', sans-serif">합곡</text>

          {/* 설명 */}
          <text x="100" y="152" textAnchor="middle" fill={subText} fontSize="9" fontFamily="'Noto Sans KR', sans-serif">엄지·검지 사이 볼록한 곳</text>
        </svg>
      </div>
    );
  },

  // ──── 관원혈(단전): 배꼽 아래 약 6cm ────
  '관원혈(단전)': (accent, isDark) => {
    const skinBg = isDark ? '#3A3028' : '#FDECD0';
    const skinBorder = isDark ? '#5A4A3A' : '#E8D0A8';
    const textColor = isDark ? '#D1D5DB' : '#4B5563';
    const subText = isDark ? '#9CA3AF' : '#6B7280';
    const lineDash = isDark ? '#888' : '#9CA3AF';

    return (
      <div className="mt-3 flex flex-col items-center">
        <svg width="200" height="170" viewBox="0 0 200 170" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 복부 배경 */}
          <ellipse cx="100" cy="85" rx="80" ry="70" fill={skinBg} stroke={skinBorder} strokeWidth="1.5" />

          {/* 배꼽 */}
          <ellipse cx="100" cy="55" rx="9" ry="10" fill={isDark ? '#2A2218' : '#D4A574'} stroke={isDark ? '#4A3A2A' : '#C09060'} strokeWidth="1.5" />
          <ellipse cx="100" cy="55" rx="3.5" ry="4" fill={isDark ? '#1E1810' : '#B8956A'} />

          {/* 배꼽 라벨 */}
          <text x="100" y="30" textAnchor="middle" fill={textColor} fontSize="10" fontFamily="'Noto Sans KR', sans-serif">배꼽</text>
          <line x1="100" y1="33" x2="100" y2="44" stroke={lineDash} strokeWidth="0.8" />

          {/* 거리 표시선 (세로) */}
          <line x1="125" y1="55" x2="125" y2="110" stroke={lineDash} strokeWidth="1" strokeDasharray="3 2" />
          {/* 거리 양끝 작은 가로선 */}
          <line x1="122" y1="55" x2="128" y2="55" stroke={lineDash} strokeWidth="1" />
          <line x1="122" y1="110" x2="128" y2="110" stroke={lineDash} strokeWidth="1" />
          {/* 거리 텍스트 */}
          <text x="140" y="86" textAnchor="start" fill={subText} fontSize="9" fontFamily="'Noto Sans KR', sans-serif">약 6cm</text>

          {/* 관원혈 포인트 */}
          <circle cx="100" cy="110" r="8" fill={accent} fillOpacity="0.15" stroke={accent} strokeWidth="1.5" />
          <circle cx="100" cy="110" r="3.5" fill={accent} />
          <circle cx="100" cy="110" r="8" fill="none" stroke={accent} strokeWidth="1" opacity="0.4">
            <animate attributeName="r" from="8" to="14" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
          </circle>

          {/* 라벨 */}
          <text x="100" y="135" textAnchor="middle" fill={accent} fontSize="10" fontWeight="600" fontFamily="'Noto Sans KR', sans-serif">관원(단전)</text>

          {/* 하단 설명 */}
          <text x="100" y="158" textAnchor="middle" fill={subText} fontSize="8" fontFamily="'Noto Sans KR', sans-serif">손가락 네 마디 아래</text>
        </svg>
      </div>
    );
  },

  // ──── 내관혈: 손목 안쪽 ────
  '내관혈': (accent, isDark) => {
    const skinBg = isDark ? '#3A3028' : '#FDECD0';
    const skinBorder = isDark ? '#5A4A3A' : '#E8D0A8';
    const subText = isDark ? '#9CA3AF' : '#6B7280';
    const lineDash = isDark ? '#888' : '#9CA3AF';

    return (
      <div className="mt-3 flex flex-col items-center">
        <svg width="180" height="170" viewBox="0 0 180 170" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 팔뚝+손목 */}
          <path d="M50 0 L50 130 Q50 155 70 158 L110 158 Q130 155 130 130 L130 0" fill={skinBg} stroke={skinBorder} strokeWidth="1.5" />

          {/* 손목 주름 */}
          <path d="M55 130 Q90 140 125 130" fill="none" stroke={isDark ? '#5A4A3A' : '#C9A880'} strokeWidth="1.2" />

          {/* 두 힘줄 라인 */}
          <line x1="78" y1="0" x2="78" y2="130" stroke={isDark ? '#4A3A2A' : '#D4B896'} strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
          <line x1="102" y1="0" x2="102" y2="130" stroke={isDark ? '#4A3A2A' : '#D4B896'} strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />

          {/* 거리 표시 (손목주름에서 위로) */}
          <line x1="138" y1="130" x2="138" y2="85" stroke={lineDash} strokeWidth="1" strokeDasharray="3 2" />
          <line x1="135" y1="130" x2="141" y2="130" stroke={lineDash} strokeWidth="1" />
          <line x1="135" y1="85" x2="141" y2="85" stroke={lineDash} strokeWidth="1" />
          <text x="148" y="111" textAnchor="start" fill={subText} fontSize="9" fontFamily="'Noto Sans KR', sans-serif">약</text>
          <text x="148" y="122" textAnchor="start" fill={subText} fontSize="9" fontFamily="'Noto Sans KR', sans-serif">5cm</text>

          {/* 내관혈 포인트 */}
          <circle cx="90" cy="85" r="7" fill={accent} fillOpacity="0.15" stroke={accent} strokeWidth="1.5" />
          <circle cx="90" cy="85" r="3" fill={accent} />
          <circle cx="90" cy="85" r="7" fill="none" stroke={accent} strokeWidth="1" opacity="0.4">
            <animate attributeName="r" from="7" to="12" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
          </circle>

          {/* 라벨 */}
          <text x="90" y="72" textAnchor="middle" fill={accent} fontSize="10" fontWeight="600" fontFamily="'Noto Sans KR', sans-serif">내관</text>

          {/* 손목주름 라벨 */}
          <text x="90" y="152" textAnchor="middle" fill={subText} fontSize="8" fontFamily="'Noto Sans KR', sans-serif">손목 안쪽 주름</text>

          {/* 힘줄 라벨 */}
          <text x="90" y="164" textAnchor="middle" fill={subText} fontSize="8" fontFamily="'Noto Sans KR', sans-serif">두 힘줄 사이</text>
        </svg>
      </div>
    );
  },

  // ──── 태충혈: 발등 엄지·검지 사이 ────
  '태충혈': (accent, isDark) => {
    const skinBg = isDark ? '#3A3028' : '#FDECD0';
    const skinBorder = isDark ? '#5A4A3A' : '#E8D0A8';
    const subText = isDark ? '#9CA3AF' : '#6B7280';

    return (
      <div className="mt-3 flex flex-col items-center">
        <svg width="180" height="170" viewBox="0 0 180 170" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 발등 */}
          <path d="M40 160 L35 80 Q30 20 55 10 L70 5 Q80 3 85 8 L88 30 Q90 8 95 5 Q105 2 108 10 L110 35 Q112 10 118 8 Q126 5 128 15 L127 40 Q130 15 135 12 Q142 10 143 22 L140 50 Q145 25 150 22 Q155 20 156 30 L148 80 L145 160 Z" fill={skinBg} stroke={skinBorder} strokeWidth="1.5" />

          {/* 엄지·검지 사이 골 */}
          <path d="M85 8 Q87 25 88 30" fill="none" stroke={isDark ? '#666' : '#C9A880'} strokeWidth="1" />
          <path d="M95 5 Q93 20 110 35" fill="none" stroke={isDark ? '#666' : '#C9A880'} strokeWidth="1" />

          {/* 태충혈 포인트 */}
          <circle cx="95" cy="55" r="7" fill={accent} fillOpacity="0.15" stroke={accent} strokeWidth="1.5" />
          <circle cx="95" cy="55" r="3" fill={accent} />
          <circle cx="95" cy="55" r="7" fill="none" stroke={accent} strokeWidth="1" opacity="0.4">
            <animate attributeName="r" from="7" to="12" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
          </circle>

          {/* 라벨 */}
          <text x="75" y="45" textAnchor="end" fill={accent} fontSize="10" fontWeight="600" fontFamily="'Noto Sans KR', sans-serif">태충</text>

          {/* 설명 */}
          <text x="90" y="155" textAnchor="middle" fill={subText} fontSize="9" fontFamily="'Noto Sans KR', sans-serif">엄지·둘째 발가락 뼈 사이</text>
        </svg>
      </div>
    );
  },
};

// 가이드가 있는 혈자리인지 확인
export function hasGuide(pointName: string): boolean {
  return pointName in GUIDES;
}