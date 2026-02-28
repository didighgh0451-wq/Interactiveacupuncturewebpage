// ============================================================
// 모던 미니멀 바디맵 — 6 존 마커(풀뷰) + 세부 핫스팟(줌뷰)
// ============================================================

// ── 타입 ──
export interface ZoneMarker {
  id: string;       // "zone_head" etc → 클릭 시 해당 그룹으로 줌
  group: string;
  x: number;
  y: number;
  r: number;
  label: string;
  labelDir?: 'left' | 'right' | 'top' | 'bottom';
}

export interface DetailMarker {
  id: string;       // SUB_PARTS 키와 동일
  group: string;
  x: number;
  y: number;
  r: number;
  label: string;
  labelDir?: 'left' | 'right' | 'top' | 'bottom';
  bilateral?: boolean; // true → x=200 기준 좌우 대칭 렌더
}

// ── 존 마커 (풀뷰에서만 노출, 6개) ──
export const ZONE_MARKERS: ZoneMarker[] = [
  { id: 'zone_head',    group: 'head',    x: 200, y: 55,  r: 22, label: '머리·눈·목' },
  { id: 'zone_chest',   group: 'chest',   x: 200, y: 145, r: 22, label: '어깨·가슴', labelDir: 'right' },
  { id: 'zone_abdomen', group: 'abdomen', x: 200, y: 250, r: 20, label: '배·골반' },
  { id: 'zone_back',    group: 'back',    x: 258, y: 218, r: 16, label: '등·허리', labelDir: 'right' },
  { id: 'zone_arms',    group: 'arms',    x: 110, y: 260, r: 18, label: '팔·손', labelDir: 'left' },
  { id: 'zone_legs',    group: 'legs',    x: 200, y: 470, r: 22, label: '다리·발' },
];

// ── 세부 마커 (줌뷰에서만 노출) ──
export const DETAIL_MARKERS: DetailMarker[] = [
  // head
  { id: 'head_main',    group: 'head', x: 200, y: 44,  r: 14, label: '머리', labelDir: 'top' },
  { id: 'eyes',         group: 'head', x: 200, y: 62,  r: 10, label: '눈' },
  { id: 'neck',         group: 'head', x: 200, y: 102, r: 10, label: '목' },
  // chest
  { id: 'shoulder',     group: 'chest', x: 148, y: 132, r: 14, label: '어깨', labelDir: 'left', bilateral: true },
  { id: 'chest_main',   group: 'chest', x: 200, y: 158, r: 14, label: '가슴' },
  // abdomen
  { id: 'abdomen_main', group: 'abdomen', x: 200, y: 218, r: 14, label: '상복부' },
  { id: 'pelvis',       group: 'abdomen', x: 200, y: 282, r: 14, label: '하복부' },
  // back
  { id: 'back_upper',   group: 'back', x: 244, y: 188, r: 12, label: '등', labelDir: 'right' },
  { id: 'back_lower',   group: 'back', x: 244, y: 250, r: 12, label: '허리', labelDir: 'right' },
  // arms (bilateral)
  { id: 'arm_upper',    group: 'arms', x: 120, y: 190, r: 12, label: '윗팔', labelDir: 'left', bilateral: true },
  { id: 'arm_lower',    group: 'arms', x: 108, y: 260, r: 12, label: '아랫팔', labelDir: 'left', bilateral: true },
  { id: 'hand',         group: 'arms', x: 96,  y: 330, r: 12, label: '손', labelDir: 'left', bilateral: true },
  // legs (bilateral)
  { id: 'leg_upper',    group: 'legs', x: 182, y: 380, r: 14, label: '허벅지', labelDir: 'left', bilateral: true },
  { id: 'leg_lower',    group: 'legs', x: 178, y: 488, r: 14, label: '종아리', labelDir: 'left', bilateral: true },
  { id: 'foot',         group: 'legs', x: 174, y: 580, r: 12, label: '발', labelDir: 'left', bilateral: true },
];

// ── Props ──
interface BodyMapProps {
  isDark: boolean;
  hoveredPartId: string | null;
  selectedPartId: string | null;
  zoomLevel: string;
  searchQuery: string;
  searchResultPartIds: string[];
  bodyGroups: Record<string, { zoomOrg: string; zoomScale: number }>;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

// ── 인체 실루엣 ──
function BodySilhouette({ isDark }: { isDark: boolean }) {
  const fill = isDark ? '#2C2C2E' : '#E2E2E8';
  const stroke = isDark ? '#444446' : '#C8C8D0';
  const sw = 0.6;
  const jointFill = isDark ? '#3A3A3C' : '#D4D4DC';

  return (
    <g>
      <ellipse cx={200} cy={48} rx={26} ry={30} fill={fill} stroke={stroke} strokeWidth={sw} />
      <rect x={189} y={76} width={22} height={22} rx={6} fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M189,94 C189,94 170,96 148,112 C138,120 132,128 132,132 L268,132 C268,128 262,120 252,112 C230,96 211,94 211,94" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d={`M132,132 C132,132 130,160 132,188 C134,210 138,228 142,244 C146,260 150,274 152,288 C154,298 156,306 158,312 L242,312 C244,306 246,298 248,288 C250,274 254,260 258,244 C262,228 266,210 268,188 C270,160 268,132 268,132 Z`} fill={fill} stroke={stroke} strokeWidth={sw} />
      <line x1={200} y1={98} x2={200} y2={310} stroke={stroke} strokeWidth={0.4} strokeOpacity={0.5} />
      {/* 왼팔 */}
      <path d={`M132,132 C128,134 124,140 120,150 C116,164 114,180 112,196 C110,210 108,224 108,234 L116,238 C116,228 118,214 120,200 C122,186 124,172 128,158 C132,146 136,138 140,132 Z`} fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d={`M108,234 C106,250 104,266 102,282 C100,298 98,312 96,322 L104,326 C104,316 106,302 108,286 C110,270 112,254 116,238 Z`} fill={fill} stroke={stroke} strokeWidth={sw} />
      <ellipse cx={100} cy={336} rx={10} ry={14} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* 오른팔 */}
      <path d={`M268,132 C272,134 276,140 280,150 C284,164 286,180 288,196 C290,210 292,224 292,234 L284,238 C284,228 282,214 280,200 C278,186 276,172 272,158 C268,146 264,138 260,132 Z`} fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d={`M292,234 C294,250 296,266 298,282 C300,298 302,312 304,322 L296,326 C296,316 294,302 292,286 C290,270 288,254 284,238 Z`} fill={fill} stroke={stroke} strokeWidth={sw} />
      <ellipse cx={300} cy={336} rx={10} ry={14} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* 골반 */}
      <path d={`M158,312 C158,324 160,336 166,344 C170,350 174,354 178,356 L192,356 L192,316 Z`} fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d={`M242,312 C242,324 240,336 234,344 C230,350 226,354 222,356 L208,356 L208,316 Z`} fill={fill} stroke={stroke} strokeWidth={sw} />
      <rect x={192} y={316} width={16} height={40} rx={2} fill={isDark ? '#1C1C1E' : '#F2F2F7'} />
      {/* 왼다리 */}
      <path d={`M178,356 C176,370 174,390 174,410 C174,430 174,446 174,456 L192,456 C192,446 192,430 192,410 C192,390 192,370 192,356 Z`} fill={fill} stroke={stroke} strokeWidth={sw} />
      <ellipse cx={183} cy={460} rx={11} ry={6} fill={jointFill} stroke={stroke} strokeWidth={sw} />
      <path d={`M172,464 C170,480 168,500 168,520 C168,540 170,556 172,566 L192,566 C192,556 192,540 192,520 C192,500 192,480 192,464 Z`} fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d={`M172,566 C170,574 168,580 164,586 C160,590 158,592 158,594 L192,594 C192,590 192,582 192,574 C192,570 192,568 192,566 Z`} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* 오른다리 */}
      <path d={`M222,356 C224,370 226,390 226,410 C226,430 226,446 226,456 L208,456 C208,446 208,430 208,410 C208,390 208,370 208,356 Z`} fill={fill} stroke={stroke} strokeWidth={sw} />
      <ellipse cx={217} cy={460} rx={11} ry={6} fill={jointFill} stroke={stroke} strokeWidth={sw} />
      <path d={`M228,464 C230,480 232,500 232,520 C232,540 230,556 228,566 L208,566 C208,556 208,540 208,520 C208,500 208,480 208,464 Z`} fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d={`M228,566 C230,574 232,580 236,586 C240,590 242,592 242,594 L208,594 C208,590 208,582 208,574 C208,570 208,568 208,566 Z`} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* 관절 */}
      <circle cx={136} cy={132} r={4} fill={jointFill} stroke={stroke} strokeWidth={sw} />
      <circle cx={264} cy={132} r={4} fill={jointFill} stroke={stroke} strokeWidth={sw} />
      <circle cx={112} cy={234} r={3.5} fill={jointFill} stroke={stroke} strokeWidth={sw} />
      <circle cx={288} cy={234} r={3.5} fill={jointFill} stroke={stroke} strokeWidth={sw} />
      <circle cx={100} cy={322} r={3} fill={jointFill} stroke={stroke} strokeWidth={sw} />
      <circle cx={300} cy={322} r={3} fill={jointFill} stroke={stroke} strokeWidth={sw} />
    </g>
  );
}

// ── 마커 렌더링 헬퍼 ──
const THEME = '#0D9488';

function getLabelPos(x: number, y: number, r: number, dir?: string) {
  const gap = r + 14;
  switch (dir) {
    case 'left':   return { x: x - gap - 24, y, anchor: 'end' as const };
    case 'right':  return { x: x + gap + 24, y, anchor: 'start' as const };
    case 'bottom': return { x, y: y + gap + 4, anchor: 'middle' as const };
    default:       return { x, y: y - gap - 2, anchor: 'middle' as const };
  }
}

interface MarkerDotProps {
  id: string;
  cx: number;
  cy: number;
  r: number;
  label: string;
  labelDir?: string;
  isActive: boolean;
  isHighlight: boolean;
  isDim: boolean;
  isDark: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
  hitR?: number;
  isZone?: boolean;
}

function MarkerDot({ id, cx, cy, r, label, labelDir, isActive, isHighlight, isDim, isDark, onHover, onClick, hitR, isZone }: MarkerDotProps) {
  const showGlow = isActive || isHighlight;
  const dotR = isActive ? (isZone ? 10 : 6) : showGlow ? (isZone ? 8 : 5) : (isZone ? 6 : 3.5);
  const dotFill = showGlow ? THEME : (isDark ? '#555557' : '#AEAEB6');

  return (
    <g
      className="cursor-pointer"
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(id)}
      style={{ opacity: isDim ? 0.12 : 1, transition: 'opacity 0.3s' }}
    >
      <circle cx={cx} cy={cy} r={(hitR ?? r) + 6} fill="transparent" />

      {showGlow && (
        <circle cx={cx} cy={cy} r={r * 2} fill="url(#hotGlow)">
          {isActive && (
            <>
              <animate attributeName="r" values={`${r * 1.5};${r * 2.5};${r * 1.5}`} dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
            </>
          )}
        </circle>
      )}

      {isActive && (
        <circle cx={cx} cy={cy} r={dotR + 4} fill="none" stroke={THEME} strokeWidth="1.2">
          <animate attributeName="r" values={`${dotR + 2};${dotR + 12};${dotR + 2}`} dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="1.8s" repeatCount="indefinite" />
        </circle>
      )}

      <circle
        cx={cx} cy={cy} r={dotR}
        fill={dotFill}
        stroke={showGlow ? '#fff' : 'transparent'}
        strokeWidth={isActive ? 2.5 : 1.5}
        filter={showGlow ? 'url(#mShadow)' : undefined}
        style={{ transition: 'all 0.2s ease' }}
      />

      {/* 존 마커: 항상 라벨 표시 (단, isDim이 아닐 때) */}
      {isZone && !isDim && (() => {
        const lp = getLabelPos(cx, cy, r, labelDir);
        return (
          <text
            x={lp.x} y={lp.y + 4}
            textAnchor={lp.anchor}
            fill={isActive ? THEME : (isDark ? '#A1A1AA' : '#71717A')}
            fontSize={isActive ? '12' : '11'}
            fontWeight={isActive ? '800' : '600'}
            fontFamily="'Noto Sans KR', system-ui, sans-serif"
            style={{ pointerEvents: 'none', transition: 'all 0.2s ease' }}
          >
            {label}
          </text>
        );
      })()}

      {/* 세부 마커: 활성 시에만 라벨 + 연결선 */}
      {!isZone && isActive && (() => {
        const lp = getLabelPos(cx, cy, r, labelDir);
        return (
          <g style={{ pointerEvents: 'none' }}>
            <line x1={cx} y1={cy} x2={lp.x} y2={lp.y} stroke={THEME} strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="2,2" />
            <text
              x={lp.x} y={lp.y + 4}
              textAnchor={lp.anchor}
              fill={isDark ? '#E5E5EA' : '#1C1C1E'}
              fontSize="11"
              fontWeight="700"
              fontFamily="'Noto Sans KR', system-ui, sans-serif"
            >
              {label}
            </text>
          </g>
        );
      })()}
    </g>
  );
}


// ── 메인 컴포넌트 ──
export function BodyMap({
  isDark,
  hoveredPartId,
  selectedPartId,
  zoomLevel,
  searchQuery,
  searchResultPartIds,
  bodyGroups,
  onHover,
  onClick,
}: BodyMapProps) {
  const isFullView = zoomLevel === 'full';
  const isSearching = searchQuery.trim() !== '';

  const zoomStyle = !isFullView && bodyGroups[zoomLevel]
    ? { transform: `scale(${bodyGroups[zoomLevel].zoomScale})`, transformOrigin: bodyGroups[zoomLevel].zoomOrg }
    : { transform: 'scale(1)', transformOrigin: 'center center' };

  return (
    <div
      className="h-[55vh] md:h-[75vh] w-auto max-w-[220px] md:max-w-[340px] mt-20 md:mt-0 transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={zoomStyle}
    >
      <svg viewBox="60 0 280 610" className="w-full h-full" overflow="visible">
        <defs>
          <radialGradient id="hotGlow">
            <stop offset="0%" stopColor={THEME} stopOpacity="0.45" />
            <stop offset="60%" stopColor={THEME} stopOpacity="0.1" />
            <stop offset="100%" stopColor={THEME} stopOpacity="0" />
          </radialGradient>
          <filter id="mShadow" x="-100%" y="-100%" width="300%" height="300%">
            <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor={THEME} floodOpacity="0.35" />
          </filter>
        </defs>

        <BodySilhouette isDark={isDark} />

        {/* ── 풀뷰: 존 마커 ── */}
        {isFullView && ZONE_MARKERS.map((z) => {
          const isHov = hoveredPartId === z.id;
          // 검색 중에는 해당 그룹에 매칭 결과가 있는지 확인
          const hasMatch = isSearching && DETAIL_MARKERS.some(d => d.group === z.group && searchResultPartIds.includes(d.id));
          const dim = isSearching && !hasMatch;

          return (
            <MarkerDot
              key={z.id}
              id={z.id}
              cx={z.x} cy={z.y} r={z.r}
              label={z.label}
              labelDir={z.labelDir}
              isActive={isHov}
              isHighlight={!isSearching ? false : hasMatch}
              isDim={dim}
              isDark={isDark}
              onHover={onHover}
              onClick={onClick}
              isZone
            />
          );
        })}

        {/* ── 줌뷰: 세부 마커 ── */}
        {!isFullView && DETAIL_MARKERS
          .filter(d => d.group === zoomLevel)
          .map((d) => {
            const isHov = hoveredPartId === d.id;
            const isSel = selectedPartId === d.id;

            const renderDot = (cx: number, cy: number, key: string, flipLabelDir?: string) => (
              <MarkerDot
                key={key}
                id={d.id}
                cx={cx} cy={cy} r={d.r}
                label={d.label}
                labelDir={flipLabelDir ?? d.labelDir}
                isActive={isHov || isSel}
                isHighlight={false}
                isDim={false}
                isDark={isDark}
                onHover={onHover}
                onClick={onClick}
              />
            );

            if (d.bilateral) {
              const mirrorX = 400 - d.x;
              const mirrorDir = d.labelDir === 'left' ? 'right' : d.labelDir === 'right' ? 'left' : d.labelDir;
              return (
                <g key={d.id}>
                  {renderDot(d.x, d.y, `${d.id}_l`)}
                  {renderDot(mirrorX, d.y, `${d.id}_r`, mirrorDir)}
                </g>
              );
            }

            return renderDot(d.x, d.y, d.id);
          })}
      </svg>
    </div>
  );
}
