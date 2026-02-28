// ============================================================
// 3D 바디맵 — Google Model Viewer + 핫스팟
// 동적 로딩으로 Lit dev-mode 경고 제거
// ============================================================
import { useEffect, useRef, useState } from 'react';

// ── 캘리브레이션 모드: 모델 클릭 시 좌표를 표시 ──
const CALIBRATION_MODE = false; // 좌표 작업 완료 → 비활성화

// ── 3D 핫스팟 위치 (인체 모델 기준 좌표) ──
interface Hotspot3D {
  id: string;
  slot: string;
  position: string;
  normal: string;
  label: string;
}

const HOTSPOTS_3D: Hotspot3D[] = [
  { id: 'head_main',    slot: 'hotspot-head',       position: '0.001 1.394 0.102',      normal: '0.019 0.873 0.487',   label: '머리' },
  { id: 'eyes',         slot: 'hotspot-eyes',       position: '-0.058 1.243 0.161',     normal: '-0.588 0.076 0.806',  label: '눈' },
  { id: 'neck',         slot: 'hotspot-neck',       position: '0.002 0.998 0.067',      normal: '0.088 -0.240 0.967',  label: '목' },
  { id: 'shoulder',     slot: 'hotspot-shoulder',   position: '-0.298 0.882 0.019',     normal: '-0.204 0.895 0.397',  label: '어깨' },
  { id: 'chest_main',   slot: 'hotspot-chest',      position: '-0.003 0.648 0.216',     normal: '0.174 -0.156 0.972',  label: '가슴' },
  { id: 'abdomen_main', slot: 'hotspot-abdomen',    position: '-0.002 0.426 0.194',     normal: '0.375 -0.143 0.916',  label: '상복부' },
  { id: 'pelvis',       slot: 'hotspot-pelvis',     position: '0.001 0.233 0.211',      normal: '-0.075 0.007 0.997',  label: '하복부' },
  { id: 'back_upper',   slot: 'hotspot-backupper',  position: '0.003 0.733 -0.225',     normal: '-0.174 -0.025 -0.984', label: '등' },
  { id: 'back_lower',   slot: 'hotspot-backlower',  position: '0.001 0.362 -0.128',     normal: '-0.142 0.037 -0.989', label: '허리' },
  { id: 'arm_upper',    slot: 'hotspot-armupper',   position: '-0.541 0.605 0.029',     normal: '-0.244 0.110 0.964',  label: '윗팔' },
  { id: 'arm_lower',    slot: 'hotspot-armlower',   position: '-0.723 0.467 0.033',     normal: '0.503 -0.360 0.786',  label: '아랫팔' },
  { id: 'hand',         slot: 'hotspot-hand',       position: '-1.004 0.270 0.170',     normal: '-0.364 -0.148 0.919', label: '손' },
  { id: 'leg_upper',    slot: 'hotspot-legupper',   position: '-0.262 -0.131 0.145',    normal: '-0.534 0.044 0.844',  label: '허벅지' },
  { id: 'leg_lower',    slot: 'hotspot-leglower',   position: '-0.188 -0.890 -0.072',   normal: '0.703 -0.206 0.681',  label: '종아리' },
  { id: 'foot',         slot: 'hotspot-foot',       position: '-0.288 -1.338 0.124',    normal: '-0.253 0.893 0.371',  label: '발' },
];

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/models/gltf/Xbot.glb';
// ↑ 인체 GLB 모델 URL로 교체 필요
// 예: const MODEL_URL = '/models/human-body.glb';
// 예: const MODEL_URL = 'https://cdn.jsdelivr.net/gh/유저명/레포/models/body.glb';

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
  const [calibrationLog, setCalibrationLog] = useState<
    { position: string; normal: string }[]
  >([]);

  // ── 1) 프로덕션 빌드용 model-viewer 스크립트 동적 로딩 ──
  useEffect(() => {
    // 이미 등록되어 있으면 스킵
    if (customElements.get('model-viewer')) {
      setReady(true);
      return;
    }

    // 이미 로딩 중인 스크립트가 있는지 확인
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

    return () => {
      // 스크립트는 제거하지 않음 (재사용)
    };
  }, []);

  // ── 2) model-viewer 엘리먼트 생성 (imperative, Lit 업데이트 충돌 방지) ──
  useEffect(() => {
    if (!ready || !containerRef.current) return;

    const wrapper = containerRef.current.querySelector('#mv-wrapper');
    if (!wrapper) return;

    // 이미 있으면 스킵
    if (viewerRef.current) return;

    const mv = document.createElement('model-viewer') as any;
    mv.setAttribute('src', MODEL_URL);
    mv.setAttribute('camera-controls', '');
    mv.setAttribute('shadow-intensity', '0.5');
    mv.setAttribute('camera-orbit', '0deg 80deg 2.5m');
    mv.setAttribute('min-camera-orbit', 'auto auto 1.5m');
    mv.setAttribute('max-camera-orbit', 'auto auto 5m');
    mv.setAttribute('field-of-view', '30deg');
    mv.setAttribute('interaction-prompt', 'none');
    mv.setAttribute('auto-rotate', '');
    mv.setAttribute('auto-rotate-delay', '5000');
    mv.setAttribute('rotation-per-second', '8deg');
    mv.setAttribute('alt', '3D 인체 혈자리 모델');
    mv.style.width = '100%';
    mv.style.height = '100%';
    mv.style.setProperty('--poster-color', 'transparent');

    // ── 캘리브레이션 모드: 클릭 시 좌표 출력 ──
    if (CALIBRATION_MODE) {
      mv.addEventListener('click', (e: MouseEvent) => {
        // model-viewer의 positionAndNormalFromPoint 사용
        if (typeof mv.positionAndNormalFromPoint === 'function') {
          const rect = mv.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const hit = mv.positionAndNormalFromPoint(x, y);
          if (hit) {
            const pos = `${hit.position.x.toFixed(3)} ${hit.position.y.toFixed(3)} ${hit.position.z.toFixed(3)}`;
            const nor = `${hit.normal.x.toFixed(3)} ${hit.normal.y.toFixed(3)} ${hit.normal.z.toFixed(3)}`;
            console.log(`🎯 혈자리 좌표 —  position: '${pos}',  normal: '${nor}'`);
            setCalibrationLog((prev) => [...prev.slice(-9), { position: pos, normal: nor }]);
          }
        }
      });
    }

    // 핫스팟 버튼 삽입
    HOTSPOTS_3D.forEach((h) => {
      const btn = document.createElement('button');
      btn.slot = h.slot;
      btn.className = 'acupoint-hotspot';
      btn.dataset.hotspotId = h.id;
      btn.dataset.position = h.position;
      btn.dataset.normal = h.normal;
      btn.dataset.visibilityAttribute = 'visible';

      const label = document.createElement('span');
      label.className = 'acupoint-label';
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

  // ── 3) 테마(다크모드) 업데이트 ──
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

    const buttons = mv.querySelectorAll('.acupoint-hotspot') as NodeListOf<HTMLElement>;
    buttons.forEach((btn) => {
      const id = btn.dataset.hotspotId;
      btn.classList.toggle('active', id === hoveredPartId);
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
        if (id) onClick(id);
      }
    };

    const handleOver = (e: Event) => {
      const target = (e.target as HTMLElement).closest('[data-hotspot-id]');
      if (target) {
        const id = (target as HTMLElement).dataset.hotspotId;
        if (id) onHover(id);
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
  }, [onClick, onHover]);

  const bgColor = isDark ? '#1C1C1E' : '#F2F2F7';
  const accentColor = '#0D9488';

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* 글로벌 핫스팟 스타일 */}
      <style>{`
        .acupoint-hotspot {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid ${accentColor}99;
          background-color: ${accentColor}33;
          box-shadow: 0 0 12px ${accentColor}66;
          cursor: pointer;
          position: relative;
          transition: all 0.3s ease;
          z-index: 10;
        }
        .acupoint-hotspot::before {
          content: '';
          width: 6px;
          height: 6px;
          background-color: ${accentColor};
          border-radius: 50%;
          box-shadow: 0 0 8px ${accentColor};
        }
        .acupoint-hotspot::after {
          content: '';
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 100%; height: 100%;
          border-radius: 50%;
          border: 1.5px solid ${accentColor};
          animation: pulse3d 2s infinite ease-out;
          box-sizing: content-box;
        }
        .acupoint-hotspot:hover,
        .acupoint-hotspot.active {
          transform: scale(1.4);
          background-color: ${accentColor}55;
          border-color: ${accentColor};
          box-shadow: 0 0 20px ${accentColor}88;
        }
        .acupoint-hotspot.selected {
          transform: scale(1.5);
          background-color: ${accentColor}77;
          border-color: white;
          box-shadow: 0 0 24px ${accentColor}AA;
        }
        .acupoint-label {
          position: absolute;
          top: -28px; left: 50%;
          transform: translateX(-50%);
          background: ${isDark ? 'rgba(44,44,46,0.95)' : 'rgba(255,255,255,0.95)'};
          color: ${isDark ? '#E5E5EA' : '#1C1C1E'};
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          font-family: 'Noto Sans KR', system-ui, sans-serif;
        }
        .acupoint-hotspot:hover .acupoint-label,
        .acupoint-hotspot.active .acupoint-label,
        .acupoint-hotspot.selected .acupoint-label {
          opacity: 1;
        }
        @keyframes pulse3d {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
      `}</style>

      {/* model-viewer가 삽입될 컨테이너 */}
      <div
        id="mv-wrapper"
        className="w-full h-full"
        style={{ backgroundColor: bgColor }}
      >
        {!ready && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div
              className="w-10 h-10 border-3 rounded-full animate-spin"
              style={{ borderColor: `${accentColor}33`, borderTopColor: accentColor }}
            />
            <span
              className="text-[13px]"
              style={{ color: isDark ? '#A1A1AA' : '#6B7280', fontWeight: 500 }}
            >
              3D 모델 로딩 중...
            </span>
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
            : '드래그로 회전 · 핀치로 확대 · 혈자리를 터치하세요'}
        </div>
      </div>

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
            <span
              className="text-[11px]"
              style={{ color: isDark ? '#A1A1AA' : '#6B7280', fontWeight: 700 }}
            >
              📍 클릭 좌표 로그 (최근 10개)
            </span>
            <button
              className="text-[10px] px-2 py-0.5 rounded"
              style={{
                backgroundColor: isDark ? 'rgba(99,99,102,0.3)' : 'rgba(0,0,0,0.06)',
                color: isDark ? '#E5E5EA' : '#374151',
              }}
              onClick={() => setCalibrationLog([])}
            >
              초기화
            </button>
          </div>
          {calibrationLog.map((log, i) => (
            <div
              key={i}
              className="mb-1.5 p-2 rounded-lg text-[10px] font-mono"
              style={{
                backgroundColor: isDark ? 'rgba(44,44,46,0.8)' : 'rgba(0,0,0,0.03)',
                color: isDark ? '#E5E5EA' : '#1F2937',
              }}
            >
              <div>
                <span style={{ color: '#0D9488', fontWeight: 700 }}>pos:</span> '{log.position}'
              </div>
              <div>
                <span style={{ color: '#8B5CF6', fontWeight: 700 }}>nor:</span> '{log.normal}'
              </div>
              <button
                className="mt-1 text-[9px] px-2 py-0.5 rounded"
                style={{
                  backgroundColor: '#0D948822',
                  color: '#0D9488',
                  fontWeight: 600,
                }}
                onClick={() => {
                  const text = `position: '${log.position}', normal: '${log.normal}'`;
                  navigator.clipboard.writeText(text);
                }}
              >
                📋 복사
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}