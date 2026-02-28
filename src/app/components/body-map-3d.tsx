// ============================================================
// 3D 바디맵 — Google Model Viewer + 글로우 핫스팟 + 줌인
// 자동 회전 제거 · 스켈레톤 로딩 · 줌인 피드백
// ============================================================
import { useEffect, useRef, useState, useCallback } from 'react';

// ── 캘리브레이션 모드 ──
const CALIBRATION_MODE = false;

// ── 3D 핫스팟 위치 ──
interface Hotspot3D {
  id: string;
  slot: string;
  position: string;
  normal: string;
  label: string;
  cameraOrbit: string;
  cameraTarget: string;
}

const DEFAULT_CAMERA_ORBIT = '0deg 80deg 2.5m';
const DEFAULT_CAMERA_TARGET = 'auto auto auto';

const HOTSPOTS_3D: Hotspot3D[] = [
  { id: 'head_main',    slot: 'hotspot-head',       position: '0.001 1.394 0.102',      normal: '0.019 0.873 0.487',   label: '머리',
    cameraOrbit: '0deg 60deg 1.2m', cameraTarget: '0 1.35 0.05' },
  { id: 'eyes',         slot: 'hotspot-eyes',       position: '-0.058 1.243 0.161',     normal: '-0.588 0.076 0.806',  label: '눈',
    cameraOrbit: '10deg 70deg 1.0m', cameraTarget: '0 1.25 0.1' },
  { id: 'neck',         slot: 'hotspot-neck',       position: '0.002 0.998 0.067',      normal: '0.088 -0.240 0.967',  label: '목',
    cameraOrbit: '0deg 75deg 1.3m', cameraTarget: '0 1.0 0.05' },
  { id: 'shoulder',     slot: 'hotspot-shoulder',   position: '-0.298 0.882 0.019',     normal: '-0.204 0.895 0.397',  label: '어깨',
    cameraOrbit: '-20deg 75deg 1.4m', cameraTarget: '-0.15 0.9 0' },
  { id: 'chest_main',   slot: 'hotspot-chest',      position: '-0.003 0.648 0.216',     normal: '0.174 -0.156 0.972',  label: '가슴',
    cameraOrbit: '0deg 80deg 1.4m', cameraTarget: '0 0.65 0.1' },
  { id: 'abdomen_main', slot: 'hotspot-abdomen',    position: '-0.002 0.426 0.194',     normal: '0.375 -0.143 0.916',  label: '상복부',
    cameraOrbit: '0deg 85deg 1.4m', cameraTarget: '0 0.43 0.1' },
  { id: 'pelvis',       slot: 'hotspot-pelvis',     position: '0.001 0.233 0.211',      normal: '-0.075 0.007 0.997',  label: '하복부',
    cameraOrbit: '0deg 88deg 1.4m', cameraTarget: '0 0.23 0.1' },
  { id: 'back_upper',   slot: 'hotspot-backupper',  position: '0.003 0.733 -0.225',     normal: '-0.174 -0.025 -0.984', label: '등',
    cameraOrbit: '180deg 75deg 1.4m', cameraTarget: '0 0.73 -0.1' },
  { id: 'back_lower',   slot: 'hotspot-backlower',  position: '0.001 0.362 -0.128',     normal: '-0.142 0.037 -0.989', label: '허리',
    cameraOrbit: '180deg 85deg 1.4m', cameraTarget: '0 0.36 -0.05' },
  { id: 'arm_upper',    slot: 'hotspot-armupper',   position: '-0.541 0.605 0.029',     normal: '-0.244 0.110 0.964',  label: '윗팔',
    cameraOrbit: '-30deg 78deg 1.5m', cameraTarget: '-0.4 0.6 0' },
  { id: 'arm_lower',    slot: 'hotspot-armlower',   position: '-0.723 0.467 0.033',     normal: '0.503 -0.360 0.786',  label: '아랫팔',
    cameraOrbit: '-35deg 80deg 1.3m', cameraTarget: '-0.6 0.47 0' },
  { id: 'hand',         slot: 'hotspot-hand',       position: '-1.004 0.270 0.170',     normal: '-0.364 -0.148 0.919', label: '손',
    cameraOrbit: '-40deg 82deg 1.0m', cameraTarget: '-0.8 0.27 0.1' },
  { id: 'leg_upper',    slot: 'hotspot-legupper',   position: '-0.262 -0.131 0.145',    normal: '-0.534 0.044 0.844',  label: '허벅지',
    cameraOrbit: '-10deg 90deg 1.5m', cameraTarget: '-0.15 -0.1 0.05' },
  { id: 'leg_lower',    slot: 'hotspot-leglower',   position: '-0.188 -0.890 -0.072',   normal: '0.703 -0.206 0.681',  label: '종아리',
    cameraOrbit: '-10deg 95deg 1.5m', cameraTarget: '-0.1 -0.8 0' },
  { id: 'foot',         slot: 'hotspot-foot',       position: '-0.288 -1.338 0.124',    normal: '-0.253 0.893 0.371',  label: '발',
    cameraOrbit: '-15deg 100deg 1.2m', cameraTarget: '-0.2 -1.3 0.05' },
];

const MODEL_URL = 'https://raw.githubusercontent.com/didighgh0451-wq/Interactiveacupuncturewebpage/refs/heads/main/public/1.glb';
const VIEWER_SCRIPT = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';

interface BodyMap3DProps {
  isDark: boolean;
  hoveredPartId: string | null;
  selectedPartId: string | null;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

export function BodyMap3D({
  isDark,
  hoveredPartId,
  selectedPartId,
  onHover,
  onClick,
}: BodyMap3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomedLabel, setZoomedLabel] = useState<string | null>(null);
  const [calibrationLog, setCalibrationLog] = useState<
    { position: string; normal: string }[]
  >([]);

  // 햅틱 피드백
  const triggerHaptic = useCallback((ms = 15) => {
    try { navigator?.vibrate?.(ms); } catch {}
  }, []);

  // 줌인 함수
  const zoomToHotspot = useCallback((hotspot: Hotspot3D) => {
    const mv = viewerRef.current as any;
    if (!mv) return;

    triggerHaptic(25);
    mv.setAttribute('interpolation-decay', '100');
    mv.setAttribute('camera-orbit', hotspot.cameraOrbit);
    mv.setAttribute('camera-target', hotspot.cameraTarget);
    
    setZoomed(true);
    setZoomedLabel(hotspot.label);

    setTimeout(() => {
      onClick(hotspot.id);
    }, 500);
  }, [onClick, triggerHaptic]);

  // 줌 리셋 함수
  const resetZoom = useCallback(() => {
    const mv = viewerRef.current as any;
    if (!mv) return;

    triggerHaptic(10);
    mv.setAttribute('interpolation-decay', '100');
    mv.setAttribute('camera-orbit', DEFAULT_CAMERA_ORBIT);
    mv.setAttribute('camera-target', DEFAULT_CAMERA_TARGET);
    
    setZoomed(false);
    setZoomedLabel(null);
  }, [triggerHaptic]);

  // ── 1) 스크립트 동적 로딩 ──
  useEffect(() => {
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1, maximum-scale=1';
      document.head.appendChild(meta);
    }

    if (customElements.get('model-viewer')) {
      setReady(true);
      return;
    }

    const existing = document.querySelector(`script[src="${VIEWER_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => setReady(true));
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = VIEWER_SCRIPT;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);

  // ── 2) model-viewer 엘리먼트 생성 (자동 회전 제거!) ──
  useEffect(() => {
    if (!ready || !containerRef.current) return;

    const wrapper = containerRef.current.querySelector('#mv-wrapper');
    if (!wrapper) return;
    if (viewerRef.current) return;

    const mv = document.createElement('model-viewer') as any;
    mv.setAttribute('src', MODEL_URL);
    mv.setAttribute('camera-controls', '');
    mv.setAttribute('touch-action', 'pan-y');
    mv.setAttribute('shadow-intensity', '0.5');
    mv.setAttribute('camera-orbit', DEFAULT_CAMERA_ORBIT);
    mv.setAttribute('min-camera-orbit', 'auto auto 0.8m');
    mv.setAttribute('max-camera-orbit', 'auto auto 5m');
    mv.setAttribute('field-of-view', '30deg');
    mv.setAttribute('interaction-prompt', 'none');
    // ❌ 자동 회전 완전 제거
    mv.setAttribute('interpolation-decay', '100');
    mv.setAttribute('alt', '3D 인체 혈자리 모델');
    mv.style.width = '100%';
    mv.style.height = '100%';
    mv.style.setProperty('--poster-color', 'transparent');

    // 모델 로딩 완료 감지
    mv.addEventListener('load', () => {
      setModelLoaded(true);
    });

    // 캘리브레이션 모드
    if (CALIBRATION_MODE) {
      mv.addEventListener('click', (e: MouseEvent) => {
        if (typeof mv.positionAndNormalFromPoint === 'function') {
          const rect = mv.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const hit = mv.positionAndNormalFromPoint(x, y);
          if (hit) {
            const pos = `${hit.position.x.toFixed(3)} ${hit.position.y.toFixed(3)} ${hit.position.z.toFixed(3)}`;
            const nor = `${hit.normal.x.toFixed(3)} ${hit.normal.y.toFixed(3)} ${hit.normal.z.toFixed(3)}`;
            console.log(`position: '${pos}',  normal: '${nor}'`);
            setCalibrationLog((prev) => [...prev.slice(-9), { position: pos, normal: nor }]);
          }
        }
      });
    }

    // 핫스팟 생성 (각각 다른 animation-delay)
    HOTSPOTS_3D.forEach((h, idx) => {
      const btn = document.createElement('button');
      btn.slot = h.slot;
      btn.className = 'acupoint-zone';
      btn.dataset.hotspotId = h.id;
      btn.dataset.position = h.position;
      btn.dataset.normal = h.normal;
      btn.dataset.visibilityAttribute = 'visible';
      btn.style.animationDelay = `${idx * 0.2}s`;

      const label = document.createElement('span');
      label.className = 'acupoint-zone-label';
      label.textContent = h.label;
      btn.appendChild(label);

      mv.appendChild(btn);
    });

    wrapper.appendChild(mv);
    viewerRef.current = mv;

    return () => {
      if (viewerRef.current && wrapper.contains(viewerRef.current)) {
        wrapper.removeChild(viewerRef.current);
        viewerRef.current = null;
      }
    };
  }, [ready]);

  // ── 3) 테마 업데이트 ──
  useEffect(() => {
    const mv = viewerRef.current as any;
    if (!mv) return;
    const bgColor = isDark ? '#1C1C1E' : '#F2F2F7';
    mv.style.backgroundColor = bgColor;
    mv.setAttribute('exposure', isDark ? '0.6' : '0.9');
  }, [isDark, ready]);

  // ── 4) hover/selected 상태 반영 ──
  useEffect(() => {
    const mv = viewerRef.current;
    if (!mv) return;

    const buttons = mv.querySelectorAll('.acupoint-zone') as NodeListOf<HTMLElement>;
    buttons.forEach((btn) => {
      const id = btn.dataset.hotspotId;
      btn.classList.toggle('hovered', id === hoveredPartId);
      btn.classList.toggle('selected', id === selectedPartId);
    });
  }, [hoveredPartId, selectedPartId, ready]);

  // ── 5) 이벤트 위임 ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: Event) => {
      const target = (e.target as HTMLElement).closest('[data-hotspot-id]');
      if (target) {
        const id = (target as HTMLElement).dataset.hotspotId;
        if (id) {
          const hotspot = HOTSPOTS_3D.find(h => h.id === id);
          if (hotspot) zoomToHotspot(hotspot);
        }
      }
    };

    const handleOver = (e: Event) => {
      const target = (e.target as HTMLElement).closest('[data-hotspot-id]');
      if (target) {
        const id = (target as HTMLElement).dataset.hotspotId;
        if (id) {
          triggerHaptic(8);
          onHover(id);
        }
      }
    };

    const handleOut = (e: Event) => {
      const target = (e.target as HTMLElement).closest('[data-hotspot-id]');
      if (target) onHover(null);
    };

    container.addEventListener('click', handleClick);
    container.addEventListener('pointerenter', handleOver, true);
    container.addEventListener('pointerleave', handleOut, true);

    return () => {
      container.removeEventListener('click', handleClick);
      container.removeEventListener('pointerenter', handleOver, true);
      container.removeEventListener('pointerleave', handleOut, true);
    };
  }, [zoomToHotspot, onHover, triggerHaptic]);

  // selectedPartId 해제 시 줌 리셋
  useEffect(() => {
    if (!selectedPartId && zoomed) {
      resetZoom();
    }
  }, [selectedPartId, zoomed, resetZoom]);

  const bgColor = isDark ? '#1C1C1E' : '#F2F2F7';
  const accent = '#0D9488';

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <style>{`
        .acupoint-zone {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: transparent;
          cursor: pointer;
          position: relative;
          z-index: 10;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          animation: acupoint-entrance 0.6s ease-out both;
        }
        @keyframes acupoint-entrance {
          from { opacity: 0; transform: scale(0); }
          to   { opacity: 1; transform: scale(1); }
        }

        /* 중앙 도트 */
        .acupoint-zone::before {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${accent};
          box-shadow: 0 0 6px ${accent}AA, 0 0 14px ${accent}55;
          animation: acupoint-breathe 2.8s ease-in-out infinite;
          animation-delay: inherit;
          transition: all 0.3s ease;
        }

        /* 외곽 링 */
        .acupoint-zone::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1.5px solid ${accent}45;
          animation: acupoint-ring 3s ease-out infinite;
          animation-delay: inherit;
          pointer-events: none;
        }

        @keyframes acupoint-breathe {
          0%, 100% {
            opacity: 0.65;
            box-shadow: 0 0 4px ${accent}88, 0 0 10px ${accent}33;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 8px ${accent}CC, 0 0 18px ${accent}55;
            transform: scale(1.15);
          }
        }

        @keyframes acupoint-ring {
          0%   { transform: scale(1);   opacity: 0.5; }
          60%  { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* ── 호버 ── */
        .acupoint-zone:hover,
        .acupoint-zone.hovered {
          transform: scale(1.25);
        }
        .acupoint-zone:hover::before,
        .acupoint-zone.hovered::before {
          width: 10px;
          height: 10px;
          opacity: 1;
          background: white;
          box-shadow: 0 0 8px ${accent}, 0 0 20px ${accent}88, 0 0 36px ${accent}44;
          animation: none;
        }
        .acupoint-zone:hover::after,
        .acupoint-zone.hovered::after {
          width: 26px;
          height: 26px;
          border: 2px solid ${accent}88;
          animation: none;
          opacity: 1;
        }

        /* ── 선택 ── */
        .acupoint-zone.selected {
          transform: scale(1.35);
        }
        .acupoint-zone.selected::before {
          width: 12px;
          height: 12px;
          opacity: 1;
          background: white;
          box-shadow: 0 0 10px ${accent}, 0 0 24px ${accent}AA, 0 0 44px ${accent}55;
          animation: none;
        }
        .acupoint-zone.selected::after {
          width: 28px;
          height: 28px;
          border: 2.5px solid ${accent};
          animation: acupoint-selected-ring 1.5s ease-out infinite;
          opacity: 1;
        }
        @keyframes acupoint-selected-ring {
          0%   { transform: scale(1);   opacity: 0.8; border-color: ${accent}; }
          100% { transform: scale(2.5); opacity: 0;   border-color: ${accent}00; }
        }

        /* ── 라벨 ── */
        .acupoint-zone-label {
          position: absolute;
          top: -30px; left: 50%;
          transform: translateX(-50%) translateY(5px) scale(0.9);
          background: ${isDark ? 'rgba(44,44,46,0.95)' : 'rgba(255,255,255,0.96)'};
          color: ${isDark ? '#E5E5EA' : '#1C1C1E'};
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 8px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
          font-family: 'Noto Sans KR', system-ui, sans-serif;
          border: 1px solid ${isDark ? 'rgba(99,99,102,0.25)' : 'rgba(0,0,0,0.06)'};
        }
        .acupoint-zone-label::after {
          content: '';
          position: absolute;
          bottom: -3px; left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 6px; height: 6px;
          background: inherit;
          border-right: 1px solid ${isDark ? 'rgba(99,99,102,0.25)' : 'rgba(0,0,0,0.06)'};
          border-bottom: 1px solid ${isDark ? 'rgba(99,99,102,0.25)' : 'rgba(0,0,0,0.06)'};
        }
        .acupoint-zone:hover .acupoint-zone-label,
        .acupoint-zone.hovered .acupoint-zone-label {
          opacity: 1;
          transform: translateX(-50%) translateY(0) scale(1);
        }
        .acupoint-zone.selected .acupoint-zone-label {
          opacity: 1;
          transform: translateX(-50%) translateY(0) scale(1);
          background: ${accent};
          color: white;
          border-color: ${accent};
        }
        .acupoint-zone.selected .acupoint-zone-label::after {
          background: ${accent};
          border-color: ${accent};
        }
      `}</style>

      {/* model-viewer 컨테이너 */}
      <div
        id="mv-wrapper"
        className="w-full h-full"
        style={{ backgroundColor: bgColor }}
      >
        {/* 스켈레톤 로딩 */}
        {!modelLoaded && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            {/* 실루엣 */}
            <div className="relative" style={{ opacity: 0.3 }}>
              <svg width="120" height="280" viewBox="60 0 280 610" fill="none">
                <ellipse cx={200} cy={48} rx={26} ry={30} fill={isDark ? '#3A3A3C' : '#D1D5DB'} />
                <rect x={189} y={76} width={22} height={22} rx={6} fill={isDark ? '#3A3A3C' : '#D1D5DB'} />
                <path d="M132,132 C132,132 130,160 132,188 C134,210 138,228 142,244 C146,260 150,274 152,288 C154,298 156,306 158,312 L242,312 C244,306 246,298 248,288 C250,274 254,260 258,244 C262,228 266,210 268,188 C270,160 268,132 268,132 Z" fill={isDark ? '#3A3A3C' : '#D1D5DB'} />
                <path d="M132,132 C128,134 124,140 120,150 C116,164 114,180 112,196 C110,210 108,224 108,234 L116,238 C116,228 118,214 120,200 C122,186 124,172 128,158 C132,146 136,138 140,132 Z" fill={isDark ? '#3A3A3C' : '#D1D5DB'} />
                <path d="M268,132 C272,134 276,140 280,150 C284,164 286,180 288,196 C290,210 292,224 292,234 L284,238 C284,228 282,214 280,200 C278,186 276,172 272,158 C268,146 264,138 260,132 Z" fill={isDark ? '#3A3A3C' : '#D1D5DB'} />
                <path d="M178,356 C176,370 174,390 174,410 C174,430 174,446 174,456 L192,456 C192,446 192,430 192,410 C192,390 192,370 192,356 Z" fill={isDark ? '#3A3A3C' : '#D1D5DB'} />
                <path d="M222,356 C224,370 226,390 226,410 C226,430 226,446 226,456 L208,456 C208,446 208,430 208,410 C208,390 208,370 208,356 Z" fill={isDark ? '#3A3A3C' : '#D1D5DB'} />
                {/* 펄스하는 혈자리 점 */}
                {[{x:200,y:48},{x:200,y:158},{x:200,y:250},{x:148,y:132},{x:200,y:460}].map((p,i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={6} fill={accent} opacity={0.5}>
                    <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.5s" begin={`${i*0.3}s`} repeatCount="indefinite" />
                    <animate attributeName="r" values="4;8;4" dur="1.5s" begin={`${i*0.3}s`} repeatCount="indefinite" />
                  </circle>
                ))}
              </svg>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-8 h-8 border-[2.5px] rounded-full animate-spin"
                style={{ borderColor: `${accent}22`, borderTopColor: accent }}
              />
              <span
                className="text-[13px]"
                style={{ color: isDark ? '#8E8E93' : '#8E8E93', fontWeight: 500 }}
              >
                3D 모델을 불러오는 중...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 하단 안내 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div
          className="px-4 py-2 rounded-full text-[12px] backdrop-blur-md border"
          style={{
            backgroundColor: isDark ? 'rgba(44,44,46,0.7)' : 'rgba(255,255,255,0.7)',
            borderColor: isDark ? 'rgba(99,99,102,0.3)' : 'rgba(209,213,219,0.5)',
            color: isDark ? '#A1A1AA' : '#6B7280',
            fontWeight: 500,
          }}
        >
          {CALIBRATION_MODE
            ? '📍 캘리브레이션 모드 — 모델을 클릭하면 좌표가 표시됩니다'
            : zoomed
              ? `${zoomedLabel ?? ''} 부위를 확대 중`
              : '드래그로 회전 · 빛나는 부위를 터치해보세요'}
        </div>
      </div>

      {/* 줌 리셋 버튼 */}
      {zoomed && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            resetZoom();
          }}
          className="absolute top-4 right-4 z-20 px-3.5 py-2 rounded-full text-[12px] backdrop-blur-md border cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
          style={{
            backgroundColor: isDark ? 'rgba(44,44,46,0.9)' : 'rgba(255,255,255,0.9)',
            borderColor: isDark ? 'rgba(99,99,102,0.3)' : 'rgba(209,213,219,0.5)',
            color: isDark ? '#E5E5EA' : '#374151',
            fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          전체 보기
        </button>
      )}

      {/* 캘리브레이션 로그 패널 */}
      {CALIBRATION_MODE && calibrationLog.length > 0 && (
        <div
          className="absolute top-3 right-3 z-20 max-h-[60%] overflow-y-auto rounded-xl p-3 border backdrop-blur-md"
          style={{
            backgroundColor: isDark ? 'rgba(28,28,30,0.9)' : 'rgba(255,255,255,0.92)',
            borderColor: isDark ? 'rgba(99,99,102,0.3)' : 'rgba(209,213,219,0.5)',
            width: 'min(320px, 90%)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px]" style={{ color: isDark ? '#A1A1AA' : '#6B7280', fontWeight: 700 }}>
              클릭 좌표 로그 (최근 10개)
            </span>
            <button
              className="text-[10px] px-2 py-0.5 rounded"
              style={{ backgroundColor: isDark ? 'rgba(99,99,102,0.3)' : 'rgba(0,0,0,0.06)', color: isDark ? '#E5E5EA' : '#374151' }}
              onClick={() => setCalibrationLog([])}
            >
              초기화
            </button>
          </div>
          {calibrationLog.map((log, i) => (
            <div key={i} className="mb-1.5 p-2 rounded-lg text-[10px] font-mono" style={{ backgroundColor: isDark ? 'rgba(44,44,46,0.8)' : 'rgba(0,0,0,0.03)', color: isDark ? '#E5E5EA' : '#1F2937' }}>
              <div><span style={{ color: '#0D9488', fontWeight: 700 }}>pos:</span> '{log.position}'</div>
              <div><span style={{ color: '#8B5CF6', fontWeight: 700 }}>nor:</span> '{log.normal}'</div>
              <button
                className="mt-1 text-[9px] px-2 py-0.5 rounded"
                style={{ backgroundColor: '#0D948822', color: '#0D9488', fontWeight: 600 }}
                onClick={() => { navigator.clipboard.writeText(`position: '${log.position}', normal: '${log.normal}'`); }}
              >
                복사
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
