// ============================================================
// 3D 바디맵 — Google Model Viewer
// 성별 전환 + 멀티 리플 핫스팟 + 줌인 폭발 이펙트
// ============================================================
import { useEffect, useRef, useState, useCallback } from 'react';

const CALIBRATION_MODE = true;

export type Gender = 'male' | 'female';

export interface Hotspot3D {
  id: string;
  slot: string;
  position: string;
  normal: string;
  label: string;
  cameraOrbit: string;
  cameraTarget: string;
}

const DEFAULT_CAMERA_ORBIT = '0deg 80deg 5.0m';
const DEFAULT_CAMERA_TARGET = '0 -0.1 0';

// ── 남성 핫스팟 ──
const MALE_HOTSPOTS: Hotspot3D[] = [
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
    cameraOrbit: '-10deg 88deg 2.5m', cameraTarget: '-0.1 -0.15 0.1' },
  { id: 'leg_lower',    slot: 'hotspot-leglower',   position: '-0.188 -0.890 -0.072',   normal: '0.703 -0.206 0.681',  label: '종아리',
    cameraOrbit: '-8deg 92deg 2.2m', cameraTarget: '-0.1 -0.85 0' },
  { id: 'foot',         slot: 'hotspot-foot',       position: '-0.288 -1.338 0.124',    normal: '-0.253 0.893 0.371',  label: '발',
    cameraOrbit: '-10deg 100deg 1.8m', cameraTarget: '-0.15 -1.3 0.05' },
  { id: 'ear',          slot: 'hotspot-ear',        position: '0.132 1.210 0.013',      normal: '0.678 -0.169 0.716',  label: '귀',
    cameraOrbit: '-20deg 68deg 1.0m', cameraTarget: '0.1 1.2 0' },
  { id: 'face',         slot: 'hotspot-face',       position: '0.076 1.145 0.136',      normal: '0.745 -0.142 0.652',  label: '볼',
    cameraOrbit: '10deg 72deg 1.0m', cameraTarget: '0.05 1.15 0.1' },
  { id: 'knee',         slot: 'hotspot-knee',       position: '0.238 -0.561 0.067',     normal: '0.343 -0.095 0.934',  label: '무릎',
    cameraOrbit: '8deg 90deg 2.2m', cameraTarget: '0.15 -0.55 0.08' },
];

// ── 여성 핫스팟 (좌표는 여성 모델 캘리브레이션 후 교체) ──
const FEMALE_HOTSPOTS: Hotspot3D[] = MALE_HOTSPOTS.map(h => ({ ...h }));
// TODO: 여성 .glb 캘리브레이션 후 position/normal/cameraOrbit/cameraTarget 교체

export function getHotspotsForGender(gender: Gender): Hotspot3D[] {
  return gender === 'female' ? FEMALE_HOTSPOTS : MALE_HOTSPOTS;
}

const MODEL_URLS: Record<Gender, string> = {
  male: 'https://raw.githubusercontent.com/didighgh0451-wq/Interactiveacupuncturewebpage/refs/heads/main/public/1.glb',
  female: 'https://raw.githubusercontent.com/didighgh0451-wq/Interactiveacupuncturewebpage/refs/heads/main/public/2.glb',
};

const VIEWER_SCRIPT = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';

interface BodyMap3DProps {
  isDark: boolean;
  gender: Gender;
  hoveredPartId: string | null;
  selectedPartId: string | null;
  highlightedPartIds: string[];
  /** 외부에서 카메라를 특정 위치로 이동시킬 때 사용 (카테고리 클릭 등) */
  focusCameraOrbit?: string | null;
  focusCameraTarget?: string | null;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

export function BodyMap3D({
  isDark,
  gender,
  hoveredPartId,
  selectedPartId,
  highlightedPartIds,
  focusCameraOrbit,
  focusCameraTarget,
  onHover,
  onClick,
}: BodyMap3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomedLabel, setZoomedLabel] = useState<string | null>(null);
  const [showBurst, setShowBurst] = useState(false);
  const [calibrationLog, setCalibrationLog] = useState<
    { position: string; normal: string }[]
  >([]);

  // 햅틱 피드백
  const triggerHaptic = useCallback((ms = 15) => {
    try { navigator?.vibrate?.(ms); } catch {}
  }, []);

  // 줌인 + 폭발 이펙트
  const zoomToHotspot = useCallback((hotspot: Hotspot3D) => {
    const mv = viewerRef.current as any;
    if (!mv) return;

    triggerHaptic(25);
    mv.removeAttribute('auto-rotate');
    mv.setAttribute('interpolation-decay', '100');
    mv.setAttribute('camera-orbit', hotspot.cameraOrbit);
    mv.setAttribute('camera-target', hotspot.cameraTarget);

    setZoomed(true);
    setZoomedLabel(hotspot.label);

    // 폭발 이펙트
    setShowBurst(true);
    setTimeout(() => setShowBurst(false), 800);

    // 결과 표시 (줌 유지 — 자동 줌아웃 제거)
    setTimeout(() => {
      onClick(hotspot.id);
    }, 400);
  }, [onClick, triggerHaptic]);

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

  // ── 1) 스크립트 로딩 + 타임아웃/에러 처리 ──
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

    // 20초 타임아웃
    const timeout = setTimeout(() => {
      setLoadError(true);
    }, 20000);

    customElements.whenDefined('model-viewer').then(() => {
      clearTimeout(timeout);
      setReady(true);
      setLoadError(false);
    });

    if (!document.querySelector(`script[src="${VIEWER_SCRIPT}"]`)) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = VIEWER_SCRIPT;
      script.onerror = () => { clearTimeout(timeout); setLoadError(true); };
      document.head.appendChild(script);
    }

    return () => clearTimeout(timeout);
  }, []);

  // ── 2) model-viewer 생성 ──
  useEffect(() => {
    if (!ready || !containerRef.current) return;

    const wrapper = containerRef.current.querySelector('#mv-wrapper');
    if (!wrapper) return;

    if (viewerRef.current) return;

    const mv = document.createElement('model-viewer') as any;
    mv.setAttribute('src', MODEL_URLS[gender]);
    mv.setAttribute('camera-controls', '');
    mv.setAttribute('touch-action', 'pan-y');
    mv.setAttribute('shadow-intensity', '0.5');
    mv.setAttribute('camera-orbit', DEFAULT_CAMERA_ORBIT);
    mv.setAttribute('min-camera-orbit', 'auto auto 0.8m');
    mv.setAttribute('max-camera-orbit', 'auto auto 8m');
    mv.setAttribute('field-of-view', '50deg');
    mv.setAttribute('interaction-prompt', 'none');
    mv.setAttribute('interpolation-decay', '100');
    mv.setAttribute('alt', '3D 인체 혈자리 모델');
    mv.style.width = '100%';
    mv.style.height = '100%';
    mv.style.setProperty('--poster-color', 'transparent');

    // 모델 로딩 에러 감지
    mv.addEventListener('error', () => { setLoadError(true); });

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

    // 핫스팟 생성 — 멀티 리플 구조
    const HOTSPOTS_3D = getHotspotsForGender(gender);
    HOTSPOTS_3D.forEach((h, idx) => {
      const btn = document.createElement('button');
      btn.slot = h.slot;
      btn.className = 'acu-hotspot';
      btn.dataset.hotspotId = h.id;
      btn.dataset.position = h.position;
      btn.dataset.normal = h.normal;
      btn.dataset.visibilityAttribute = 'visible';
      btn.style.setProperty('--acu-delay', `${idx * 0.15}s`);

      // 리플 링 3개
      for (let r = 0; r < 3; r++) {
        const ring = document.createElement('span');
        ring.className = 'acu-ring';
        ring.style.animationDelay = `${r * 0.7}s`;
        btn.appendChild(ring);
      }

      // 코어 도트
      const core = document.createElement('span');
      core.className = 'acu-core';
      btn.appendChild(core);

      // 내부 하이라이트
      const highlight = document.createElement('span');
      highlight.className = 'acu-highlight';
      btn.appendChild(highlight);

      // 라벨
      const label = document.createElement('span');
      label.className = 'acu-label';
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
  }, [ready, gender]);

  // ── 3) 테마 ──
  useEffect(() => {
    const mv = viewerRef.current as any;
    if (!mv) return;
    const bg = isDark ? '#1C1C1E' : '#F2F2F7';
    mv.style.backgroundColor = bg;
    mv.setAttribute('exposure', isDark ? '0.6' : '0.9');
  }, [isDark, ready]);

  // ── 4) hover/selected ──
  useEffect(() => {
    const mv = viewerRef.current;
    if (!mv) return;
    const btns = mv.querySelectorAll('.acu-hotspot') as NodeListOf<HTMLElement>;
    btns.forEach((btn) => {
      const id = btn.dataset.hotspotId;
      btn.classList.toggle('is-hovered', id === hoveredPartId);
      btn.classList.toggle('is-selected', id === selectedPartId);
      btn.classList.toggle('is-highlighted', highlightedPartIds.includes(id));
    });
  }, [hoveredPartId, selectedPartId, highlightedPartIds, ready]);

  // ── 5) 이벤트 위임 ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: Event) => {
      const target = (e.target as HTMLElement).closest('[data-hotspot-id]');
      if (target) {
        const id = (target as HTMLElement).dataset.hotspotId;
        if (id) {
          const hotspot = getHotspotsForGender(gender).find(h => h.id === id);
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
  }, [zoomToHotspot, onHover, triggerHaptic, gender]);

  useEffect(() => {
    if (!selectedPartId && zoomed) {
      resetZoom();
    }
  }, [selectedPartId, zoomed, resetZoom]);

  // ── 6) 외부 카메라 포커스 (카테고리 등) ──
  useEffect(() => {
    const mv = viewerRef.current as any;
    if (!mv) return;
    if (focusCameraOrbit && focusCameraTarget) {
      mv.setAttribute('interpolation-decay', '120');
      mv.setAttribute('camera-orbit', focusCameraOrbit);
      mv.setAttribute('camera-target', focusCameraTarget);
      setZoomed(true);
      setZoomedLabel(null);
    } else if (!focusCameraOrbit && !focusCameraTarget && !selectedPartId) {
      // 카테고리 해제 시 기본 뷰로 복귀
      mv.setAttribute('interpolation-decay', '150');
      mv.setAttribute('camera-orbit', DEFAULT_CAMERA_ORBIT);
      mv.setAttribute('camera-target', DEFAULT_CAMERA_TARGET);
      setZoomed(false);
      setZoomedLabel(null);
    }
  }, [focusCameraOrbit, focusCameraTarget, selectedPartId]);

  const bgColor = isDark ? '#1C1C1E' : '#F2F2F7';
  const A = '#0D9488';

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <style>{`
        /* ===== 핫스팟 — 미니멀 글래스 ===== */
        .acu-hotspot {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: transparent;
          cursor: pointer;
          position: relative;
          z-index: 10;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          animation: acu-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: var(--acu-delay, 0s);
          -webkit-tap-highlight-color: transparent;
        }
        @keyframes acu-fade-in {
          from { opacity: 0; transform: scale(0.3); }
          to   { opacity: 1; transform: scale(1); }
        }

        /* 코어 — 글래스모피즘 도트 */
        .acu-core {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: ${isDark
            ? 'rgba(94, 234, 212, 0.85)'
            : 'rgba(13, 148, 136, 0.8)'};
          backdrop-filter: blur(4px);
          border: 1.5px solid ${isDark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.7)'};
          box-shadow: 0 0 12px ${A}55, 0 2px 8px rgba(0,0,0,0.1);
          animation: acu-breathe 3s ease-in-out infinite;
          animation-delay: var(--acu-delay, 0s);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 3;
        }
        @keyframes acu-breathe {
          0%, 100% { opacity: 0.75; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        /* 하이라이트 — 안쓰이지만 DOM에 있으므로 숨김 */
        .acu-highlight {
          display: none;
        }

        /* 링 — 얇고 깨끗한 단일 웨이브 */
        .acu-ring {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid ${isDark ? 'rgba(94,234,212,0.4)' : `${A}40`};
          animation: acu-wave 2.8s ease-out infinite;
          pointer-events: none;
          z-index: 1;
        }
        .acu-ring:nth-child(2) { animation-delay: 0.9s; }
        .acu-ring:nth-child(3) { animation-delay: 1.8s; }
        @keyframes acu-wave {
          0%   { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(3.5); opacity: 0; }
        }

        /* ===== 호버 ===== */
        .acu-hotspot:hover,
        .acu-hotspot.is-hovered {
          transform: scale(1.15);
        }
        .acu-hotspot:hover .acu-core,
        .acu-hotspot.is-hovered .acu-core {
          width: 14px;
          height: 14px;
          background: ${isDark ? 'rgba(94,234,212,1)' : 'rgba(13,148,136,0.95)'};
          border-color: rgba(255,255,255,0.9);
          box-shadow: 0 0 18px ${A}88, 0 0 36px ${A}33;
          animation: none;
        }
        .acu-hotspot:hover .acu-ring,
        .acu-hotspot.is-hovered .acu-ring {
          border-color: ${isDark ? 'rgba(94,234,212,0.5)' : `${A}55`};
        }

        /* ===== 선택 ===== */
        .acu-hotspot.is-selected {
          transform: scale(1.25);
        }
        .acu-hotspot.is-selected .acu-core {
          width: 16px;
          height: 16px;
          background: white;
          border: 2px solid ${A};
          box-shadow: 0 0 16px ${A}AA, 0 0 32px ${A}44;
          animation: none;
        }
        .acu-hotspot.is-selected .acu-ring {
          border-color: ${A}88;
          animation: acu-sel-wave 1.8s ease-out infinite;
        }
        @keyframes acu-sel-wave {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }

        /* ===== 하이라이트 ===== */
        .acu-hotspot.is-highlighted {
          transform: scale(1.1);
        }
        .acu-hotspot.is-highlighted .acu-core {
          width: 14px;
          height: 14px;
          background: ${isDark ? 'rgba(94,234,212,0.8)' : 'rgba(13,148,136,0.8)'};
          border-color: rgba(255,255,255,0.9);
          box-shadow: 0 0 18px ${A}88, 0 0 36px ${A}33;
          animation: none;
        }
        .acu-hotspot.is-highlighted .acu-ring {
          border-color: ${isDark ? 'rgba(94,234,212,0.5)' : `${A}55`};
        }

        /* ===== 라벨 — 글래스 필 ===== */
        .acu-label {
          position: absolute;
          top: -34px; left: 50%;
          transform: translateX(-50%) translateY(6px);
          background: ${isDark ? 'rgba(38,38,40,0.88)' : 'rgba(255,255,255,0.92)'};
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          color: ${isDark ? '#F5F5F7' : '#1C1C1E'};
          font-size: 11px;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 8px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px rgba(0,0,0,${isDark ? '0.4' : '0.1'});
          font-family: 'Noto Sans KR', system-ui, sans-serif;
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
          z-index: 20;
          letter-spacing: 0.02em;
        }
        .acu-label::after {
          content: '';
          position: absolute;
          bottom: -3px; left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 6px; height: 6px;
          background: inherit;
          border-right: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
          border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
        }

        .acu-hotspot:hover .acu-label,
        .acu-hotspot.is-hovered .acu-label {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        .acu-hotspot.is-selected .acu-label {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
          background: ${A};
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 16px ${A}55;
        }
        .acu-hotspot.is-selected .acu-label::after {
          background: ${A};
          border-color: transparent;
        }

        @keyframes acu-burst {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
        @keyframes acu-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* model-viewer 컨테이너 */}
      <div
        id="mv-wrapper"
        className="w-full h-full"
        style={{ backgroundColor: bgColor }}
      >
        {!ready && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            {loadError ? (
              /* ── 에러 상태 ── */
              <div className="flex flex-col items-center gap-3 text-center px-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#F87171' : '#EF4444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p className="text-[15px]" style={{ color: isDark ? '#E5E5EA' : '#374151', fontWeight: 600 }}>
                  3D 모델을 불러오지 못했어요
                </p>
                <p className="text-[13px]" style={{ color: isDark ? '#A1A1AA' : '#6B7280', fontWeight: 400 }}>
                  네트워크 연결을 확인하고 다시 시도해주세요.
                </p>
                <button
                  onClick={() => { setLoadError(false); window.location.reload(); }}
                  className="mt-2 px-6 py-2.5 rounded-xl text-[14px] cursor-pointer active:scale-[0.97] transition-transform"
                  style={{
                    background: A,
                    color: 'white',
                    fontWeight: 700,
                    boxShadow: `0 4px 16px ${A}44`,
                  }}
                >
                  다시 시도
                </button>
              </div>
            ) : (
              /* ── 로딩 스켈레톤 ── */
              <>
            {/* 인체 실루엣 스켈레톤 */}
            <div className="relative flex flex-col items-center" style={{ animation: 'skeleton-pulse 1.8s ease-in-out infinite' }}>
              <svg width="120" height="280" viewBox="0 0 120 280" fill="none" style={{ opacity: 0.15 }}>
                {/* 머리 */}
                <circle cx="60" cy="28" r="20" fill={isDark ? '#A1A1AA' : '#9CA3AF'} />
                {/* 목 */}
                <rect x="52" y="48" width="16" height="12" rx="4" fill={isDark ? '#A1A1AA' : '#9CA3AF'} />
                {/* 몸통 */}
                <path d="M30 60H90C92 60 94 62 94 64V140C94 142 92 144 90 144H30C28 144 26 142 26 140V64C26 62 28 60 30 60Z" fill={isDark ? '#A1A1AA' : '#9CA3AF'} rx="12" />
                {/* 왼팔 */}
                <path d="M26 68C18 70 8 90 4 120C2 130 6 134 10 132L26 100" fill={isDark ? '#A1A1AA' : '#9CA3AF'} />
                {/* 오른팔 */}
                <path d="M94 68C102 70 112 90 116 120C118 130 114 134 110 132L94 100" fill={isDark ? '#A1A1AA' : '#9CA3AF'} />
                {/* 골반 */}
                <path d="M34 144H86L90 170H30L34 144Z" fill={isDark ? '#A1A1AA' : '#9CA3AF'} />
                {/* 왼다리 */}
                <rect x="34" y="170" width="20" height="80" rx="8" fill={isDark ? '#A1A1AA' : '#9CA3AF'} />
                {/* 오른다리 */}
                <rect x="66" y="170" width="20" height="80" rx="8" fill={isDark ? '#A1A1AA' : '#9CA3AF'} />
                {/* 왼발 */}
                <ellipse cx="44" cy="256" rx="14" ry="6" fill={isDark ? '#A1A1AA' : '#9CA3AF'} />
                {/* 오른발 */}
                <ellipse cx="76" cy="256" rx="14" ry="6" fill={isDark ? '#A1A1AA' : '#9CA3AF'} />
              </svg>
              {/* 핫스팟 스켈레톤 도트 */}
              {[
                { x: 60, y: 28 }, { x: 60, y: 55 }, { x: 60, y: 90 },
                { x: 60, y: 120 }, { x: 44, y: 200 }, { x: 76, y: 200 },
              ].map((dot, i) => (
                <span
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: dot.x - 4,
                    top: dot.y - 4,
                    width: 8,
                    height: 8,
                    background: A,
                    opacity: 0.25,
                    animation: `skeleton-dot 1.5s ${i * 0.2}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
            <span
              className="text-[13px] mt-2"
              style={{ color: isDark ? '#A1A1AA' : '#6B7280', fontWeight: 500 }}
            >
              3D 모델 불러오는 중...
            </span>
            <style>{`
              @keyframes skeleton-pulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
              }
              @keyframes skeleton-dot {
                0%, 100% { transform: scale(1); opacity: 0.2; }
                50% { transform: scale(1.8); opacity: 0.5; }
              }
            `}</style>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── 줌인 폭발 이펙트 오버레이 ── */}
      {showBurst && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 40,
                height: 40,
                border: `2px solid ${A}`,
                animation: `acu-burst 0.8s ${i * 0.12}s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                opacity: 0,
              }}
            />
          ))}
          <div
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: 'white',
              boxShadow: `0 0 20px ${A}, 0 0 40px ${A}88`,
              animation: 'acu-burst 0.6s 0s ease-out forwards',
            }}
          />
        </div>
      )}

      {/* ── 하단: 줌 상태 플로팅 배지 ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        {zoomed && zoomedLabel ? (
          <div
            className="flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-xl border shadow-lg"
            style={{
              backgroundColor: isDark ? 'rgba(13,148,136,0.2)' : 'rgba(13,148,136,0.1)',
              borderColor: `${A}55`,
              animation: 'acu-fade-up 0.4s ease-out both',
            }}
          >
            {/* 라이브 도트 */}
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: A }}
            />
            <span
              className="text-[13px]"
              style={{ color: A, fontWeight: 700 }}
            >
              {zoomedLabel}
            </span>
            <span
              className="text-[11px]"
              style={{ color: isDark ? '#A1A1AA' : '#6B7280', fontWeight: 500 }}
            >
              부위를 확대 중
            </span>
          </div>
        ) : (
          <div
            className="px-4 py-2 rounded-full text-[12px] backdrop-blur-md border pointer-events-none"
            style={{
              backgroundColor: isDark ? 'rgba(44,44,46,0.7)' : 'rgba(255,255,255,0.7)',
              borderColor: isDark ? 'rgba(99,99,102,0.3)' : 'rgba(209,213,219,0.5)',
              color: isDark ? '#A1A1AA' : '#6B7280',
              fontWeight: 500,
            }}
          >
            {CALIBRATION_MODE
              ? '📍 캘리브레이션 모드 — 모델을 클릭하면 좌표가 표시됩니다'
              : '드래그로 회전 · 빛나는 부위를 터치해보세요'}
          </div>
        )}
      </div>

      {/* ── 줌 리셋 버튼 ── */}
      {zoomed && (
        <button
          onClick={(e) => { e.stopPropagation(); resetZoom(); }}
          className="absolute top-4 right-4 z-20 px-4 py-2.5 rounded-full text-[13px] backdrop-blur-xl border cursor-pointer transition-all duration-300 active:scale-90 flex items-center gap-2"
          style={{
            backgroundColor: isDark ? 'rgba(44,44,46,0.9)' : 'rgba(255,255,255,0.92)',
            borderColor: isDark ? 'rgba(99,99,102,0.3)' : 'rgba(209,213,219,0.5)',
            color: isDark ? '#E5E5EA' : '#374151',
            fontWeight: 700,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            animation: 'acu-fade-up 0.3s ease-out both',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          전체 보기
        </button>
      )}

      {/* 캘리브레이션 로그 */}
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
                onClick={() => {
                  const text = `position: '${log.position}', normal: '${log.normal}'`;
                  const ta = document.createElement('textarea');
                  ta.value = text;
                  ta.style.position = 'fixed';
                  ta.style.opacity = '0';
                  document.body.appendChild(ta);
                  ta.select();
                  document.execCommand('copy');
                  document.body.removeChild(ta);
                }}
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