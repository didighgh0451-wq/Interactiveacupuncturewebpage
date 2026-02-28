import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronLeft, ChevronRight, ClipboardList, MapPin, Hand, Clock, RotateCcw, Sparkles, Shield, Share2, ArrowLeft, X, Zap, Box, Layers } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { BodyMap } from './components/body-map';
import { BodyMap3D } from './components/body-map-3d';

// ============================================================
// 데이터 정의
// ============================================================

interface SymptomData {
  title: string;
  point: string;
}

interface SubPartData {
  name: string;
  group: string;
  note?: string;          // "양쪽 동일하게 적용" 등
  symptoms: SymptomData[];
}

interface BodyGroupData {
  id: string;
  name: string;
  zoomOrg: string;
  zoomScale: number;
}

interface PointDetail {
  name: string;
  location: string;
  method: string;
  duration: string;
  repetitions: string;
  effects: string[];
}

interface SituationShortcut {
  icon: string;
  title: string;
  desc: string;
  partId: string;
  symptomTitle: string;
}

const BODY_GROUPS: Record<string, BodyGroupData> = {
  head:    { id: 'head',    name: '머리·눈·목',  zoomOrg: 'center 12%', zoomScale: 2.5 },
  chest:   { id: 'chest',   name: '어깨·가슴',   zoomOrg: 'center 24%', zoomScale: 2.2 },
  abdomen: { id: 'abdomen', name: '배·골반',     zoomOrg: 'center 42%', zoomScale: 2.2 },
  back:    { id: 'back',    name: '등·허리',     zoomOrg: 'center 38%', zoomScale: 2 },
  arms:    { id: 'arms',    name: '팔·손',       zoomOrg: 'center 42%', zoomScale: 1.5 },
  legs:    { id: 'legs',    name: '다리·발',     zoomOrg: 'center 78%', zoomScale: 2 },
};

// ── 좌/우 통합 완료 (22 → 14개) ──
const SUB_PARTS: Record<string, SubPartData> = {
  head_main:    { name: '머리',         group: 'head',    symptoms: [{ title: '지끈지끈 두통·스트레스', point: '백회혈' }, { title: '머리가 멍하고 어지러움', point: '풍지혈' }] },
  eyes:         { name: '눈',           group: 'head',    symptoms: [{ title: '눈 피로·침침함', point: '찬죽혈' }, { title: '눈 충혈·건조함', point: '태양혈' }, { title: '눈 떨림·안면 경련', point: '사백혈' }] },
  neck:         { name: '목',           group: 'head',    symptoms: [{ title: '뒷목 뻐근함·거북목', point: '천주혈' }] }, // ✅ 견정혈→천주혈
  shoulder:     { name: '어깨',         group: 'chest',   note: '양쪽 동일하게 적용', symptoms: [{ title: '어깨 결림·뭉침', point: '견정혈' }, { title: '날개뼈 주변 통증', point: '천종혈' }] },
  chest_main:   { name: '가슴',         group: 'chest',   symptoms: [{ title: '가슴 답답함·화병', point: '단중혈' }, { title: '호흡이 얕고 불안함', point: '옥당혈' }] }, // ✅ 전중혈→옥당혈
  abdomen_main: { name: '상복부',       group: 'abdomen', symptoms: [{ title: '소화불량·급체', point: '중완혈' }, { title: '속쓰림·위장장애', point: '거궐혈' }] },
  pelvis:       { name: '하복부·골반',   group: 'abdomen', symptoms: [{ title: '생리통·아랫배 냉증', point: '관원혈(단전)' }, { title: '변비·장 기능 저하', point: '천추혈' }] },
  back_upper:   { name: '등',           group: 'back',    symptoms: [{ title: '등 뻐근함·담 결림', point: '풍문혈' }] },
  back_lower:   { name: '허리',         group: 'back',    symptoms: [{ title: '만성 허리 통증', point: '신수혈' }, { title: '허리 삐끗·급성 요통', point: '요양관혈' }, { title: '엉덩이~다리 뻗치는 통증', point: '환도혈' }] }, // ✅ 좌골신경통 → 일상 표현
  arm_upper:    { name: '윗팔',         group: 'arms',    note: '양쪽 동일하게 적용', symptoms: [{ title: '어깨부터 팔까지 저림', point: '견우혈' }] },
  arm_lower:    { name: '아랫팔',       group: 'arms',    note: '양쪽 동일하게 적용', symptoms: [{ title: '팔뚝 시큰거림', point: '수삼리혈' }, { title: '손목 쓸 때 찌릿찌릿', point: '내관혈' }] }, // ✅ 손목터널증후군 → 일상 표현
  hand:         { name: '손',           group: 'arms',    note: '양쪽 동일하게 적용', symptoms: [{ title: '체했을 때 (다용도 혈자리)', point: '합곡혈' }, { title: '수족냉증·긴장 완화', point: '노궁혈' }] }, // ✅ 만병통치 → 다용도 혈자리
  leg_upper:    { name: '허벅지',       group: 'legs',    note: '양쪽 동일하게 적용', symptoms: [{ title: '허벅지 피로감·저림', point: '풍시혈' }] },
  leg_lower:    { name: '종아리',       group: 'legs',    note: '양쪽 동일하게 적용', symptoms: [{ title: '다리 부종·밤에 쥐날 때', point: '승산혈' }, { title: '하체 무력감·피로', point: '족삼리혈' }] },
  foot:         { name: '발',           group: 'legs',    note: '양쪽 동일하게 적용', symptoms: [{ title: '전신 피로 회복·발바닥 통증', point: '용천혈' }, { title: '불면증·마음 안정', point: '태충혈' }] },
};

// ── 혈자리 상세 정보 (촌→손가락 마디 통일, 의학용어 순화) ──
const POINT_DETAILS: Record<string, PointDetail> = {
  '백회혈': {
    name: '백회혈 (百會穴, GV20)',
    location: '정수리 꼭대기, 양쪽 귀를 연결하는 선과 코에서 뒤통수로 넘어가는 선이 만나는 점',
    method: '검지와 중지로 부드럽게 원을 그리며 지압합니다. 숨을 내쉬면서 천천히 눌러주세요.',
    duration: '3~5초간 누르고 2초 쉬기',
    repetitions: '10~15회 반복',
    effects: ['긴장성 두통 완화', '스트레스 해소', '정신 맑아짐', '혈액순환 촉진'],
  },
  '풍지혈': {
    name: '풍지혈 (風池穴, GB20)',
    location: '뒷머리 아래, 목 뒤 양쪽 움푹 들어간 부분 (후두부 아래 좌우 오목한 곳)',
    method: '양쪽 엄지로 두개골 방향(위쪽)으로 눌러줍니다.',
    duration: '5~7초간 지속 압박',
    repetitions: '8~10회 반복',
    effects: ['어지러움 완화', '두통 해소', '목 뒤 긴장 해소', '혈액순환 촉진'],
  },
  // ✅ 신규: 천주혈 (목 전용)
  '천주혈': {
    name: '천주혈 (天柱穴, BL10)',
    location: '뒷목 중앙, 머리카락이 시작되는 지점에서 양쪽으로 손가락 한 마디 반(약 3cm) 바깥, 목 뒤 두꺼운 근육 바깥쪽 오목한 곳',
    method: '양쪽 엄지를 목 뒤에 대고 두개골 방향(위쪽)으로 천천히 눌러줍니다. 고개를 살짝 숙이면 찾기 쉬워요.',
    duration: '5~7초간 지속 압박',
    repetitions: '8~10회 반복',
    effects: ['뒷목 뻐근함 해소', '거북목 통증 완화', '두통 완화', '목 피로 해소'],
  },
  '견정혈': {
    name: '견정혈 (肩井穴, GB21)',
    location: '목과 어깨 끝의 중간 지점, 어깨 위쪽의 가장 높은 곳',
    method: '반대편 손의 중지로 어깨 위를 강하게 누릅니다.',
    duration: '5~7초간 누르기',
    repetitions: '8~10회 반복 (양쪽)',
    effects: ['어깨 결림 해소', '어깨 뭉침 완화', '상체 혈액순환', '목·어깨 긴장 이완'],
  },
  '단중혈': {
    name: '단중혈 (膻中穴, CV17)',
    location: '양쪽 유두를 연결하는 선의 정중앙, 가슴뼈(흉골) 위',
    method: '검지와 중지로 흉골 위를 부드럽게 원형으로 문질러줍니다.',
    duration: '5초간 누르기',
    repetitions: '10~15회 반복',
    effects: ['가슴 답답함 해소', '화병 완화', '기혈 순환 촉진', '정서 안정'],
  },
  // ✅ 전중혈 삭제, 옥당혈 신규 추가
  '옥당혈': {
    name: '옥당혈 (玉堂穴, CV18)',
    location: '가슴뼈(흉골) 위, 단중혈에서 위로 손가락 한 마디 반(약 3cm) 지점',
    method: '손바닥을 가슴에 대고 따뜻하게 감싸면서 부드럽게 시계 방향으로 문질러줍니다.',
    duration: '7~10초간 부드럽게 누르기',
    repetitions: '10~12회 반복',
    effects: ['호흡 안정', '가슴 답답함 해소', '기관지 건강', '심폐 기능 강화'],
  },
  '중완혈': {
    name: '중완혈 (中脘穴, CV12)',
    location: '배꼽과 명치(갈비뼈 아래 움푹한 곳)의 정중앙',
    method: '손바닥으로 시계 방향으로 부드럽게 문질러줍니다.',
    duration: '5~10초간 부드럽게 누르기',
    repetitions: '15~20회 반복',
    effects: ['소화 촉진', '위장 기능 강화', '속쓰림 완화', '복부 불쾌감 해소'],
  },
  '거궐혈': {
    name: '거궐혈 (巨闕穴, CV14)',
    location: '명치 바로 아래 움푹 파인 곳, 갈비뼈가 만나는 지점 바로 아래', // ✅ 6촌 제거
    method: '검지와 중지로 명치 아래를 부드럽게 눌러줍니다. 식후 30분 후에 시행하세요.',
    duration: '3~5초간 누르기',
    repetitions: '10~12회 반복',
    effects: ['속쓰림 완화', '위산 역류 개선', '위장 기능 안정', '소화 촉진'],
  },
  '관원혈(단전)': {
    name: '관원혈 (關元穴, CV4)',
    location: '배꼽에서 아래로 손가락 네 마디(약 7cm) 떨어진 하복부',
    method: '손바닥을 대고 따뜻하게 감싸면서 부드럽게 시계 방향으로 누릅니다.',
    duration: '7~10초간 지속 압박',
    repetitions: '10~15회 반복',
    effects: ['생리통 완화', '하복부 냉증 개선', '자궁 건강', '기력 회복'],
  },
  '견우혈': {
    name: '견우혈 (肩髃穴, LI15)',
    location: '어깨 끝에서 약간 앞쪽 아래, 팔을 들면 나타나는 오목한 곳',
    method: '반대편 손으로 어깨 앞쪽 오목한 부분을 엄지로 꾹 눌러줍니다.',
    duration: '5초간 누르고 3초 쉬기',
    repetitions: '10~12회 반복 (양쪽)',
    effects: ['어깨~팔 저림 완화', '어깨 통증 해소', '상지 혈행 촉진', '관절 유연성 개선'],
  },
  '수삼리혈': {
    name: '수삼리혈 (手三里穴, LI10)',
    location: '팔꿈치 바깥쪽 주름에서 손목 방향으로 손가락 세 마디(약 5cm) 아래',
    method: '반대편 엄지로 팔 바깥쪽을 세게 눌러줍니다.',
    duration: '5~7초간 누르기',
    repetitions: '10~15회 반복 (양쪽)',
    effects: ['팔뚝 통증 완화', '팔 피로 해소', '소화 기능 보조', '상지 혈행 촉진'],
  },
  '합곡혈': {
    name: '합곡혈 (合谷穴, LI4)',
    location: '엄지와 검지 사이 물갈퀴 부분에서 검지뼈를 따라 살짝 올라간 움푹 파인 곳', // ✅ 의학용어 순화
    method: '반대 손 엄지와 검지로 합곡혈을 잡고 강하게 눌러줍니다.',
    duration: '5~7초간 누르기',
    repetitions: '10~15회 반복 (양손)',
    effects: ['체기 해소 (다용도 혈자리)', '두통·치통 완화', '면역력 강화', '전신 기혈 순환'], // ✅ 만병통치 → 다용도 혈자리
  },
  '노궁혈': {
    name: '노궁혈 (勞宮穴, PC8)',
    location: '손바닥 한가운데, 주먹을 쥘 때 중지 끝이 닿는 지점',
    method: '반대쪽 엄지로 손바닥 중앙을 꾹 눌러줍니다.',
    duration: '3~5초간 누르기',
    repetitions: '15~20회 반복 (양손)',
    effects: ['수족냉증 개선', '손 혈액순환 촉진', '긴장 완화', '마음 안정'],
  },
  '풍시혈': {
    name: '풍시혈 (風市穴, GB31)',
    location: '차렷 자세에서 중지 끝이 닿는 허벅지 바깥쪽 지점',
    method: '주먹으로 허벅지 바깥을 가볍게 두드리거나 엄지로 눌러줍니다.',
    duration: '5초간 누르기',
    repetitions: '10~15회 반복 (양쪽)',
    effects: ['허벅지 피로 해소', '하지 저림 완화', '하체 혈행 촉진', '다리 가벼워짐'],
  },
  '승산혈': {
    name: '승산혈 (承山穴, BL57)',
    location: '종아리 뒤쪽 중간, 까치발을 들었을 때 종아리 근육이 갈라지는 V자 지점',
    method: '엄지로 종아리 V자 부분을 천천히 강하게 눌러줍니다.',
    duration: '5~7초간 누르기',
    repetitions: '10~15회 반복 (양쪽)',
    effects: ['다리 부종 완화', '종아리 피로 해소', '혈액순환 촉진', '다리 쥐남 방지'],
  },
  '족삼리혈': {
    name: '족삼리혈 (足三里穴, ST36)',
    location: '무릎뼈 바깥쪽 아래 움푹 파인 곳에서 손가락 네 마디(약 7cm) 아래',
    method: '엄지로 정강이 바깥쪽을 세게 눌러줍니다.',
    duration: '5~7초간 누르기',
    repetitions: '10~15회 반복 (양쪽)',
    effects: ['하체 무력감 해소', '소화 기능 강화', '체력 증진', '면역력 향상'],
  },
  '용천혈': {
    name: '용천혈 (湧泉穴, KI1)',
    location: '발바닥 앞쪽 1/3 지점, 발가락을 구부렸을 때 움푹 파이는 곳',
    method: '엄지로 발바닥을 강하게 눌러줍니다. 취침 전에 하면 효과적입니다.',
    duration: '5~7초간 누르기',
    repetitions: '15~20회 반복 (양발)',
    effects: ['전신 피로 회복', '발바닥 통증 완화', '신장 기능 강화', '하체 냉증 개선'],
  },
  '태충혈': {
    name: '태충혈 (太衝穴, LR3)',
    location: '발등, 엄지발가락과 둘째 발가락 사이 뼈가 만나는 움푹 파인 곳',
    method: '엄지로 발등의 V자 뼈 사이를 눌러줍니다. 취침 전에 하면 효과적입니다.',
    duration: '3~5초간 누르기',
    repetitions: '15~20회 반복 (양발)',
    effects: ['불면증 개선', '스트레스 해소', '간 기능 안정', '마음 안정·이완'],
  },
  '찬죽혈': {
    name: '찬죽혈 (攢竹穴, BL2)',
    location: '눈썹 안쪽 끝, 눈썹이 시작되는 움푹 파인 곳',
    method: '양쪽 엄지로 눈썹 안쪽 끝을 부드럽게 원을 그리며 눌러줍니다. 눈을 감고 시행하세요.',
    duration: '3~5초간 누르기',
    repetitions: '10~15회 반복',
    effects: ['눈 피로 해소', '시력 보호', '두통 완화', '눈 주위 혈행 촉진'],
  },
  '태양혈': {
    name: '태양혈 (太陽穴, EX-HN5)',
    location: '눈꼬리와 눈썹 끝 사이에서 손가락 한 마디 정도(약 2cm) 뒤쪽, 관자놀이 움푹 파인 곳', // ✅ 1촌→손가락 한 마디
    method: '양쪽 검지로 관자놀이를 부드럽게 원형으로 마사지합니다.',
    duration: '5~7초간 부드럽게 누르기',
    repetitions: '10~15회 반복',
    effects: ['눈 충혈 완화', '안구 건조 개선', '편두통 완화', '눈 주위 긴장 해소'],
  },
  '사백혈': {
    name: '사백혈 (四白穴, ST2)',
    location: '눈동자 바로 아래, 눈 아래뼈 가장자리에서 손가락 한 마디 정도(약 2cm) 아래 움푹한 곳', // ✅ 1촌→손가락 한 마디
    method: '검지로 눈 아래를 부드럽게 눌러줍니다. 강하게 누르지 마세요.',
    duration: '3~5초간 부드럽게 누르기',
    repetitions: '10~12회 반복',
    effects: ['눈 떨림 완화', '안면 경련 해소', '눈 피로 회복', '안면 혈행 촉진'],
  },
  '천종혈': {
    name: '천종혈 (天宗穴, SI11)',
    location: '등 뒤쪽 날개뼈 중앙의 움푹 파인 곳, 손을 뒤로 돌려 만지면 찾기 쉬움',
    method: '테니스공을 벽과 등 사이에 놓고 문지르거나, 반대편 손으로 날개뼈 중앙을 눌러줍니다.',
    duration: '5~7초간 누르기',
    repetitions: '10~15회 반복 (양쪽)',
    effects: ['어깨 뭉침 해소', '날개뼈 통증 완화', '상체 혈행 촉진', '어깨 유연성 개선'],
  },
  '풍문혈': {
    name: '풍문혈 (風門穴, BL12)',
    location: '등 위쪽, 목 아래 두 번째 뼈 양옆 손가락 한 마디 반(약 3cm) 지점', // ✅ 1.5촌→손가락 한 마디 반
    method: '테니스공 두 개를 양말에 넣어 등 아래에 놓고 굴리거나, 파트너가 엄지로 눌러줍니다.',
    duration: '5~7초간 눌러 풀기',
    repetitions: '10~12회 반복',
    effects: ['등 뻐근함 해소', '담 결림 완화', '감기 예방', '등 근육 이완'],
  },
  '신수혈': {
    name: '신수혈 (腎兪穴, BL23)',
    location: '허리 양쪽, 배꼽 높이 척추뼈 양옆 손가락 한 마디 반(약 3cm) 지점', // ✅ 1.5촌→손가락 한 마디 반
    method: '양손 주먹으로 허리 양쪽을 가볍게 두드리거나, 엄지로 눌러줍니다.',
    duration: '5~10초간 지속 압박',
    repetitions: '15~20회 반복',
    effects: ['만성 허리 통증 완화', '신장 기능 강화', '기력 회복', '하체 냉증 개선'],
  },
  '요양관혈': {
    name: '요양관혈 (腰陽關穴, GV3)',
    location: '허리 정중앙, 골반 위쪽 높이의 척추 한가운데',
    method: '엄지 또는 손바닥으로 허리 중앙을 눌러주고, 따뜻하게 감싸줍니다.',
    duration: '7~10초간 지속 압박',
    repetitions: '10~15회 반복',
    effects: ['급성 요통 완화', '허리 유연성 개선', '하체 혈행 촉진', '허리 온기 보충'],
  },
  '환도혈': {
    name: '환도혈 (環跳穴, GB30)',
    location: '엉덩이 바깥쪽, 옆으로 누웠을 때 엉덩이에서 가장 튀어나온 뼈와 꼬리뼈 사이 오목한 곳', // ✅ 의학용어 순화
    method: '테니스공 위에 엉덩이를 올려놓고 체중으로 눌러주거나, 엄지로 강하게 눌러줍니다.',
    duration: '5~7초간 누르기',
    repetitions: '10~12회 반복 (양쪽)',
    effects: ['엉덩이~다리 통증 완화', '엉덩이 뻐근함 해소', '하지 혈행 촉진', '고관절 유연성 개선'],
  },
  '천추혈': {
    name: '천추혈 (天樞穴, ST25)',
    location: '배꼽 양옆 손가락 두 마디(약 4cm) 지점', // ✅ 2촌→손가락 두 마디
    method: '검지와 중지로 배꼽 양쪽을 동시에 부드럽게 눌러줍니다. 시계 방향으로 문질러도 좋습니다.',
    duration: '5~7초간 부드럽게 누르기',
    repetitions: '15~20회 반복',
    effects: ['변비 해소', '장 기능 활성화', '복부 팽만감 완화', '소화 촉진'],
  },
  '내관혈': {
    name: '내관혈 (內關穴, PC6)',
    location: '손목 안쪽 주름에서 팔꿈치 방향으로 손가락 세 마디(약 5cm) 위, 두 힘줄 사이',
    method: '반대 손 엄지로 손목 안쪽을 부드럽게 눌러줍니다.',
    duration: '3~5초간 누르기',
    repetitions: '10~15회 반복 (양손)',
    effects: ['손목 통증 완화', '멀미·메스꺼움 해소', '심장 안정', '정서 안정'],
  },
};

// ── ✅ 신규: 상황별 바로가기 ──
const SITUATION_SHORTCUTS: SituationShortcut[] = [
  { icon: '😰', title: '시험·면접 전 긴장',   desc: '마음 안정 + 집중력',        partId: 'hand',         symptomTitle: '수족냉증·긴장 완화' },
  { icon: '🍺', title: '회식 후 더부룩할 때',   desc: '소화 촉진 + 위장 안정',     partId: 'abdomen_main', symptomTitle: '소화불량·급체' },
  { icon: '😴', title: '잠이 안 올 때',        desc: '수면 유도 + 이완',          partId: 'foot',         symptomTitle: '불면증·마음 안정' },
  { icon: '📱', title: '폰·PC 오래 봤을 때',    desc: '눈 피로 + 목 풀기',         partId: 'eyes',         symptomTitle: '눈 피로·침침함' },
  { icon: '💢', title: '생리통이 심할 때',       desc: '하복부 온기 + 통증 완화',    partId: 'pelvis',       symptomTitle: '생리통·아랫배 냉증' },
  { icon: '😫', title: '온몸이 찌뿌둥할 때',     desc: '전신 순환 + 기력 충전',      partId: 'foot',         symptomTitle: '전신 피로 회복·발바닥 통증' },
];


// ============================================================
// 인트로 오버레이
// ============================================================

function IntroOverlay({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-teal-50 via-white to-emerald-50/40 dark:from-[#0a1a18] dark:via-[#1C1C1E] dark:to-[#0d1f1a]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[12%] left-[8%] w-80 h-80 bg-teal-200/30 dark:bg-teal-700/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-[15%] right-[8%] w-96 h-96 bg-emerald-200/25 dark:bg-emerald-800/15 rounded-full blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 9, repeat: Infinity }}
        />
      </div>

      <motion.div className="relative z-10 flex flex-col items-center max-w-lg text-center px-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.15 }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-xl shadow-teal-500/25">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="11" r="5.5" fill="white" opacity="0.92" />
              <path d="M24 18C18.5 18 15 24 15 30L18.5 42H29.5L33 30C33 24 29.5 18 24 18Z" fill="white" opacity="0.92" />
              <circle cx="24" cy="27" r="2" fill="#0d9488" />
              <circle cx="24" cy="33" r="1.5" fill="#0d9488" opacity="0.65" />
              <circle cx="20.5" cy="25" r="1.4" fill="#0d9488" opacity="0.45" />
              <circle cx="27.5" cy="25" r="1.4" fill="#0d9488" opacity="0.45" />
            </svg>
          </div>
        </motion.div>

        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-50 dark:bg-teal-900/40 border border-teal-100 dark:border-teal-800/50 rounded-full text-teal-700 dark:text-teal-300 text-[13px] mb-5"
          style={{ fontWeight: 600 }}
        >
          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
          한의학 셀프케어 가이드
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="text-[34px] md:text-[44px] text-gray-900 dark:text-gray-100 tracking-tight !leading-[1.2] mb-4"
          style={{ fontWeight: 800 }}
        >
          내 몸이 보내는 신호,
          <br />
          <span className="bg-gradient-to-r from-teal-600 to-emerald-500 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
            혈자리로 풀어봐
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="text-gray-500 dark:text-gray-400 text-[16px] md:text-[17px] mb-10 max-w-sm !leading-[1.75]"
          style={{ fontWeight: 400 }}
        >
          불편한 부위를 클릭하면<br />
          맞춤 혈자리와 지압법을 알려드려요.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="px-10 py-4 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-2xl text-[17px] shadow-lg shadow-teal-500/25 cursor-pointer"
          style={{ fontWeight: 700 }}
        >
          시작하기 →
        </motion.button>
      </motion.div>
    </motion.div>
  );
}


// ============================================================
// 결과 상세 패널
// ============================================================

function ResultDetail({
  partName,
  partNote,
  symptom,
  point,
  onBack,
  onDisclaimer,
}: {
  partName: string;
  partNote?: string;
  symptom: SymptomData;
  point: PointDetail;
  onBack: () => void;
  onDisclaimer: () => void;
}) {
  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 60, opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full"
    >
      <div className="px-5 md:px-6 pt-4 md:pt-8 pb-3 md:pb-4 bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-xl sticky top-0 z-10 border-b border-gray-100/50 dark:border-gray-700/50">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors mb-3 cursor-pointer text-[14px]"
          style={{ fontWeight: 500 }}
        >
          <ArrowLeft className="w-4 h-4" />
          증상 목록으로
        </button>
        <div className="flex items-center gap-1.5 text-[12px] text-gray-400 dark:text-gray-500 mb-2 flex-wrap" style={{ fontWeight: 500 }}>
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md">{partName}</span>
          {partNote && <span className="text-[10px] text-gray-400 dark:text-gray-500">({partNote})</span>}
          <ChevronRight className="w-3 h-3" />
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md">{symptom.title}</span>
        </div>
        <h2 className="text-[20px] md:text-[22px] text-gray-900 dark:text-gray-100 tracking-tight" style={{ fontWeight: 700 }}>
          추천 혈자리
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 bg-[#F9F9FB] dark:bg-[#1C1C1E]">
        {/* Point hero */}
        <div className="bg-gradient-to-br from-teal-500 to-emerald-500 rounded-[20px] p-4 md:p-5 shadow-lg shadow-teal-500/15">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <svg viewBox="0 0 48 48" width="36" height="36">
                <circle cx="24" cy="24" r="8" fill="white" opacity="0.3">
                  <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="24" cy="24" r="4" fill="white" opacity="0.85" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-teal-100 text-[11px] mb-0.5" style={{ fontWeight: 500 }}>추천 지압 포인트</p>
              <h3 className="text-white text-[16px] md:text-[18px] tracking-tight !leading-snug" style={{ fontWeight: 800 }}>
                {point.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white dark:bg-[#2C2C2E] border border-gray-100 dark:border-gray-700/50 rounded-2xl p-4 shadow-sm dark:shadow-none">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-[18px] h-[18px] text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h4 className="text-[14px] text-gray-900 dark:text-gray-100 mb-1" style={{ fontWeight: 700 }}>위치</h4>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 !leading-[1.7]" style={{ fontWeight: 400 }}>{point.location}</p>
            </div>
          </div>
        </div>

        {/* Method */}
        <div className="bg-white dark:bg-[#2C2C2E] border border-gray-100 dark:border-gray-700/50 rounded-2xl p-4 shadow-sm dark:shadow-none">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Hand className="w-[18px] h-[18px] text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="text-[14px] text-gray-900 dark:text-gray-100 mb-1" style={{ fontWeight: 700 }}>지압 방법</h4>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 !leading-[1.7]" style={{ fontWeight: 400 }}>{point.method}</p>
            </div>
          </div>
        </div>

        {/* Duration + Repetitions */}
        <div className="grid grid-cols-2 gap-2.5 md:gap-3">
          <div className="bg-white dark:bg-[#2C2C2E] border border-gray-100 dark:border-gray-700/50 rounded-2xl p-3 md:p-3.5 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span className="text-[11px] text-gray-400 dark:text-gray-500" style={{ fontWeight: 600 }}>시간</span>
            </div>
            <p className="text-[12px] md:text-[13px] text-gray-800 dark:text-gray-200" style={{ fontWeight: 600 }}>{point.duration}</p>
          </div>
          <div className="bg-white dark:bg-[#2C2C2E] border border-gray-100 dark:border-gray-700/50 rounded-2xl p-3 md:p-3.5 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-1.5 mb-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              <span className="text-[11px] text-gray-400 dark:text-gray-500" style={{ fontWeight: 600 }}>횟수</span>
            </div>
            <p className="text-[12px] md:text-[13px] text-gray-800 dark:text-gray-200" style={{ fontWeight: 600 }}>{point.repetitions}</p>
          </div>
        </div>

        {/* Effects */}
        <div className="bg-white dark:bg-[#2C2C2E] border border-gray-100 dark:border-gray-700/50 rounded-2xl p-4 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles className="w-[18px] h-[18px] text-teal-500 dark:text-teal-400" />
            <h4 className="text-[14px] text-gray-900 dark:text-gray-100" style={{ fontWeight: 700 }}>기대 효과</h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {point.effects.map((e, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg text-[12px]" style={{ fontWeight: 500 }}>
                <span className="w-1 h-1 bg-teal-400 rounded-full" />
                {e}
              </span>
            ))}
          </div>
        </div>

        {/* Warning */}
        <div className="bg-amber-50/60 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-2xl p-3.5">
          <p className="text-amber-800 dark:text-amber-300 text-[12px] !leading-[1.7]" style={{ fontWeight: 500 }}>
            ⚠️ 임산부, 심혈관 질환자, 피부 질환이 있는 부위에는 지압을 삼가주세요.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5 pb-4">
          <button
            onClick={onDisclaimer}
            className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-xl text-[15px] shadow-md shadow-teal-500/15 cursor-pointer active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            style={{ fontWeight: 700 }}
          >
            <Shield className="w-4 h-4" />
            정확한 진단은 전문가에게
          </button>
          <button
            onClick={async () => {
              if (navigator.share) {
                try { await navigator.share({ title: '혈자리 가이드', text: `${symptom.title} → ${point.name}`, url: window.location.href }); } catch { /* cancelled */ }
              } else {
                await navigator.clipboard.writeText(`${symptom.title} → ${point.name}\n위치: ${point.location}\n방법: ${point.method}`);
                toast.success('결과가 클립보드에 복사되었습니다!');
              }
            }}
            className="w-full py-3 bg-white dark:bg-[#3A3A3C] border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-[14px] cursor-pointer active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            style={{ fontWeight: 600 }}
          >
            <Share2 className="w-4 h-4" />
            결과 공유하기
          </button>
        </div>
      </div>
    </motion.div>
  );
}


// ============================================================
// 면책 모달
// ============================================================

function DisclaimerModal({ onClose, onRestart }: { onClose: () => void; onRestart: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-[90] flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative bg-white dark:bg-[#2C2C2E] rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/40 dark:to-emerald-900/30 border border-teal-100 dark:border-teal-800/50 flex items-center justify-center mb-6">
            <Shield className="w-7 h-7 text-teal-500 dark:text-teal-400" />
          </div>

          <h2 className="text-[22px] text-gray-900 dark:text-gray-100 tracking-tight mb-3 !leading-[1.3]" style={{ fontWeight: 700 }}>
            정확한 진단은<br />
            <span className="text-teal-600 dark:text-teal-400">전문가에게 맡겨주세요</span>
          </h2>

          <p className="text-gray-400 dark:text-gray-500 text-[14px] mb-6 !leading-[1.7]" style={{ fontWeight: 400 }}>
            이 콘텐츠는 일반적인 건강 정보 제공 목적이며,<br />
            의학적 진단이나 치료를 대체하지 않습니다.
          </p>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-xl p-3.5 mb-6 w-full text-left">
            <p className="text-amber-800 dark:text-amber-300 text-[12px] !leading-[1.7]" style={{ fontWeight: 500 }}>
              ⚠️ 임산부, 심혈관 질환자, 피부 질환이 있는 부위에는 지압을 삼가주세요.
              통증이 심하거나 증상이 지속되면 반드시 전문의와 상담하세요.
            </p>
          </div>

          <div className="w-full space-y-2.5">
            <a href="https://search.naver.com/search.naver?query=%EB%82%B4+%EA%B7%BC%EC%B2%98+%ED%95%9C%EC%9D%98%EC%9B%90" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-xl text-[15px] shadow-md shadow-teal-500/15 cursor-pointer active:scale-[0.98] transition-transform"
              style={{ fontWeight: 700 }}
            >
              <MapPin className="w-4 h-4" />
              가까운 한의원 찾기
            </a>

            <button
              onClick={async () => {
                if (navigator.share) {
                  try { await navigator.share({ title: '내 몸이 보내는 신호, 혈자리로 풀어봐', text: '한의학 셀프케어 가이드', url: window.location.href }); } catch { /* cancelled */ }
                } else {
                  await navigator.clipboard.writeText(window.location.href);
                  toast.success('링크가 복사되었습니다!');
                }
              }}
              className="flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-[#3A3A3C] border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-[14px] cursor-pointer active:scale-[0.98] transition-transform"
              style={{ fontWeight: 600 }}
            >
              <Share2 className="w-4 h-4" />
              결과 공유하기
            </button>

            <button onClick={onRestart} className="flex items-center justify-center gap-2 w-full py-2.5 text-gray-400 dark:text-gray-500 text-[13px] cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors" style={{ fontWeight: 500 }}>
              <RotateCcw className="w-3.5 h-3.5" />
              처음부터 다시 하기
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


// ============================================================
// 메인 App
// ============================================================

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [mobilePanel, setMobilePanel] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');

  // 다크모드 시스템 감지
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (e: MediaQueryListEvent | MediaQueryList) => {
      document.documentElement.classList.toggle('dark', e.matches);
      setIsDark(e.matches);
    };
    apply(mq);
    mq.addEventListener('change', apply as any);
    return () => mq.removeEventListener('change', apply as any);
  }, []);

  // 바디맵 상태
  const [zoomLevel, setZoomLevel] = useState<string>('full');
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  const [activeResult, setActiveResult] = useState<{ partId: string; symptom: SymptomData } | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  // ✅ 개선된 클릭 핸들러: 존 마커 vs 세부 마커 구분
  const handlePartClick = (id: string) => {
    if (id.startsWith('zone_')) {
      // 2D 존 마커 클릭 → 해당 그룹으로 줌
      const group = id.replace('zone_', '');
      setZoomLevel(group);
      setSelectedPartId(null);
      setActiveResult(null);
      setMobilePanel(true);
    } else if (SUB_PARTS[id]) {
      // 세부 마커 클릭 (2D 줌뷰 또는 3D) → 해당 파트 선택
      setSelectedPartId(id);
      setActiveResult(null);
      setMobilePanel(true);
    }
  };

  const handleSymptomClick = (partId: string, symptom: SymptomData) => {
    setActiveResult({ partId, symptom });
    setMobilePanel(true);
  };

  // ✅ 상황별 바로가기 클릭
  const handleShortcutClick = (shortcut: SituationShortcut) => {
    const part = SUB_PARTS[shortcut.partId];
    const symptom = part.symptoms.find(s => s.title === shortcut.symptomTitle);
    if (symptom) {
      setZoomLevel(part.group);
      setSelectedPartId(shortcut.partId);
      handleSymptomClick(shortcut.partId, symptom);
    }
  };

  const handleRestart = () => {
    setShowDisclaimer(false);
    setShowIntro(true);
    setZoomLevel('full');
    setSelectedPartId(null);
    setHoveredPartId(null);
    setSearchQuery('');
    setActiveResult(null);
    setMobilePanel(false);
  };

  // 검색
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: { partId: string; partName: string; title: string; point: string }[] = [];
    Object.entries(SUB_PARTS).forEach(([partId, partData]) => {
      partData.symptoms.forEach((symptom) => {
        if (symptom.title.toLowerCase().includes(query) || symptom.point.toLowerCase().includes(query) || partData.name.toLowerCase().includes(query)) {
          results.push({ partId, partName: partData.name, title: symptom.title, point: symptom.point });
        }
      });
    });
    return results;
  };
  const searchResults = getSearchResults();

  // 마우스 툴팁 텍스트
  let tooltipText: string | null = null;
  if (hoveredPartId) {
    if (hoveredPartId.startsWith('zone_')) {
      const group = hoveredPartId.replace('zone_', '');
      tooltipText = BODY_GROUPS[group]?.name ?? null;
    } else if (SUB_PARTS[hoveredPartId]) {
      tooltipText = SUB_PARTS[hoveredPartId].name;
      if (SUB_PARTS[hoveredPartId].note) {
        tooltipText += ` (${SUB_PARTS[hoveredPartId].note})`;
      }
    }
  }

  // 줌된 그룹에 속하는 세부 파트 목록
  const zoomedParts = zoomLevel !== 'full'
    ? Object.entries(SUB_PARTS).filter(([, v]) => v.group === zoomLevel)
    : [];

  return (
    <div className="h-screen w-full overflow-hidden" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <Toaster position="top-center" richColors />

      <AnimatePresence>
        {showIntro && <IntroOverlay onStart={() => setShowIntro(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showDisclaimer && (
          <DisclaimerModal onClose={() => setShowDisclaimer(false)} onRestart={handleRestart} />
        )}
      </AnimatePresence>

      {/* ===== 메인 레이아웃 ===== */}
      <div className="flex flex-col md:flex-row h-full w-full bg-[#F2F2F7] dark:bg-[#1C1C1E]" onMouseMove={handleMouseMove}>

        {/* ─── 좌측 패널 (데스크탑: 사이드바, 모바일: 바텀시트) ─── */}
        <div
          className={[
            'md:w-[420px] md:h-full md:relative md:rounded-r-[40px] md:shadow-[4px_0_40px_rgba(0,0,0,0.03)]',
            'fixed bottom-0 left-0 right-0 z-40 md:z-20',
            'bg-white dark:bg-[#2C2C2E]',
            'flex flex-col overflow-hidden',
            'transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
            mobilePanel ? 'h-[60vh] rounded-t-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.15)]' : 'h-0 md:!h-full',
          ].join(' ')}
          style={{ minHeight: typeof window !== 'undefined' && window.innerWidth >= 768 ? '100%' : undefined }}
        >
          {/* 모바일 드래그 핸들 */}
          <div className="md:hidden flex justify-center py-2 flex-shrink-0">
            <button
              className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full cursor-pointer"
              onClick={() => setMobilePanel(false)}
            />
          </div>

          <AnimatePresence mode="wait">
            {activeResult ? (
              <ResultDetail
                key="result"
                partName={SUB_PARTS[activeResult.partId].name}
                partNote={SUB_PARTS[activeResult.partId].note}
                symptom={activeResult.symptom}
                point={POINT_DETAILS[activeResult.symptom.point] || {
                  name: activeResult.symptom.point,
                  location: '상세 위치 정보를 준비 중입니다.',
                  method: '엄지로 부드럽게 눌러주세요.',
                  duration: '5초간 누르기',
                  repetitions: '10회 반복',
                  effects: ['증상 완화', '혈액순환 촉진'],
                }}
                onBack={() => setActiveResult(null)}
                onDisclaimer={() => setShowDisclaimer(true)}
              />
            ) : (
              <motion.div
                key="list"
                className="flex flex-col h-full"
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Header */}
                <div className="px-5 md:px-8 pt-3 md:pt-10 pb-3 md:pb-5 bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-xl sticky top-0 z-10 border-b border-gray-100/50 dark:border-gray-700/50">
                  <h1 className="text-[22px] md:text-[28px] text-gray-900 dark:text-gray-100 mb-3 md:mb-5 tracking-tight" style={{ fontWeight: 700 }}>
                    증상별 혈자리 찾기
                  </h1>
                  <div className="flex items-center bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-[14px] px-4 py-2.5 md:py-3 transition-all focus-within:ring-2 focus-within:ring-teal-600/30">
                    <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2.5" strokeWidth={2.5} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="예: 소화불량, 두통, 붓기"
                      className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[15px] md:text-[16px]"
                      style={{ fontWeight: 500 }}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="w-5 h-5 flex items-center justify-center bg-gray-300 dark:bg-gray-600 rounded-full text-white text-xs cursor-pointer" style={{ fontWeight: 700 }}>×</button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F9F9FB] dark:bg-[#1C1C1E]">
                  {searchQuery.trim() !== '' ? (
                    /* ── 검색 결과 ── */
                    <div>
                      <h3 className="text-[12px] text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-3 ml-1" style={{ fontWeight: 700 }}>
                        검색 결과 ({searchResults.length})
                      </h3>
                      {searchResults.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-gray-400 mt-14">
                          <p className="text-gray-500 dark:text-gray-400 text-[16px]" style={{ fontWeight: 600 }}>검색 결과가 없습니다.</p>
                          <p className="text-[13px] mt-1.5 text-gray-400 dark:text-gray-500" style={{ fontWeight: 400 }}>다른 키워드로 검색해보세요.</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {searchResults.map((res, idx) => (
                            <button
                              key={`${res.partId}-${idx}`}
                              onClick={() => { setSearchQuery(''); setZoomLevel(SUB_PARTS[res.partId].group); setSelectedPartId(res.partId); handleSymptomClick(res.partId, { title: res.title, point: res.point }); }}
                              onMouseEnter={() => setHoveredPartId(res.partId)}
                              onMouseLeave={() => setHoveredPartId(null)}
                              className="w-full text-left bg-white dark:bg-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-gray-700/50 p-4 rounded-[18px] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] active:scale-[0.98] group cursor-pointer"
                            >
                              <div className="flex items-center justify-between w-full mb-1.5">
                                <span className="text-[15px] md:text-[16px] text-gray-800 dark:text-gray-200" style={{ fontWeight: 600 }}>{res.title}</span>
                                <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-teal-600 transition-colors">
                                  <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-500 group-hover:text-white" strokeWidth={3} />
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[11px] rounded-md" style={{ fontWeight: 600 }}>{res.partName}</span>
                                <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-[11px] rounded-md" style={{ fontWeight: 600 }}>추천</span>
                                <span className="text-[13px] text-teal-600 dark:text-teal-400" style={{ fontWeight: 700 }}>{res.point}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : selectedPartId ? (
                    /* ── 선택된 파트의 증상 목록 ── */
                    <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                      <div className="flex items-center gap-2 mb-3 ml-1">
                        <h3 className="text-[12px] text-teal-600 dark:text-teal-400 uppercase tracking-wider" style={{ fontWeight: 700 }}>
                          {SUB_PARTS[selectedPartId].name} 맞춤 혈자리
                        </h3>
                        {SUB_PARTS[selectedPartId].note && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded" style={{ fontWeight: 500 }}>
                            {SUB_PARTS[selectedPartId].note}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2.5">
                        {SUB_PARTS[selectedPartId].symptoms.map((symptom, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSymptomClick(selectedPartId, symptom)}
                            className="w-full text-left bg-white dark:bg-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-gray-700/50 p-4 rounded-[18px] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] active:scale-[0.98] group cursor-pointer"
                          >
                            <div className="flex items-center justify-between w-full mb-1.5">
                              <span className="text-[15px] md:text-[16px] text-gray-800 dark:text-gray-200" style={{ fontWeight: 600 }}>{symptom.title}</span>
                              <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-teal-600 transition-colors">
                                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-500 group-hover:text-white" strokeWidth={3} />
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-[11px] rounded-md" style={{ fontWeight: 600 }}>추천 지압점</span>
                              <span className="text-[13px] text-teal-600 dark:text-teal-400" style={{ fontWeight: 700 }}>{symptom.point}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : zoomLevel !== 'full' ? (
                    /* ── 줌뷰: 해당 그룹의 세부 파트 목록 ── */
                    <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                      <h3 className="text-[12px] text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1 ml-1" style={{ fontWeight: 700 }}>
                        {BODY_GROUPS[zoomLevel]?.name}
                      </h3>
                      <p className="text-[12px] text-gray-400 dark:text-gray-500 mb-3 ml-1" style={{ fontWeight: 400 }}>
                        세부 부위를 터치하거나 아래에서 선택하세요.
                      </p>
                      <div className="space-y-2">
                        {zoomedParts.map(([partId, partData]) => (
                          <button
                            key={partId}
                            onClick={() => { setSelectedPartId(partId); setMobilePanel(true); }}
                            onMouseEnter={() => setHoveredPartId(partId)}
                            onMouseLeave={() => setHoveredPartId(null)}
                            className="w-full text-left bg-white dark:bg-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-gray-700/50 p-3.5 rounded-[16px] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] active:scale-[0.98] group cursor-pointer"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <span className="text-[15px] text-gray-800 dark:text-gray-200" style={{ fontWeight: 600 }}>{partData.name}</span>
                                {partData.note && (
                                  <span className="text-[10px] text-gray-400 dark:text-gray-500" style={{ fontWeight: 400 }}>({partData.note})</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-gray-400 dark:text-gray-500" style={{ fontWeight: 500 }}>{partData.symptoms.length}개 증상</span>
                                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-500 group-hover:text-teal-500" strokeWidth={2.5} />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    /* ── 빈 상태 + 상황별 바로가기 ── */
                    <div className="flex flex-col h-full">
                      <div className="flex flex-col items-center text-center mb-6 pt-4 md:pt-8">
                        <ClipboardList className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2.5" strokeWidth={1.5} />
                        <p className="text-gray-500 dark:text-gray-400 text-[16px]" style={{ fontWeight: 600 }}>어디가 불편하신가요?</p>
                        <p className="text-[13px] mt-1 text-gray-400 dark:text-gray-500 text-center max-w-[240px] !leading-relaxed" style={{ fontWeight: 400 }}>
                          바디맵에서 불편한 부위를 터치하거나,<br />아래 상황을 골라보세요.
                        </p>
                      </div>

                      {/* ✅ 상황별 바로가기 */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-3 ml-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <h3 className="text-[12px] text-gray-500 dark:text-gray-400 tracking-wider" style={{ fontWeight: 700 }}>
                            이런 상황이라면?
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {SITUATION_SHORTCUTS.map((s) => (
                            <button
                              key={s.title}
                              onClick={() => handleShortcutClick(s)}
                              className="flex flex-col items-start bg-white dark:bg-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-gray-700/50 p-3.5 rounded-[16px] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] active:scale-[0.97] cursor-pointer text-left"
                            >
                              <span className="text-[20px] mb-1.5">{s.icon}</span>
                              <span className="text-[13px] text-gray-800 dark:text-gray-200 !leading-snug" style={{ fontWeight: 600 }}>{s.title}</span>
                              <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>{s.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 모바일: 패널 뒤 딤 배경 */}
        {mobilePanel && (
          <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setMobilePanel(false)} />
        )}

        {/* ─── 우측: 바디맵 ─── */}
        <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden min-h-0">

          {/* 모바일 상단 바: 타이틀 + 검색 */}
          <div className="md:hidden absolute top-0 left-0 right-0 z-20 px-5 pb-3 bg-gradient-to-b from-[#F2F2F7] dark:from-[#1C1C1E] via-[#F2F2F7]/90 dark:via-[#1C1C1E]/90 to-transparent" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-[17px] text-gray-900 dark:text-gray-100 tracking-tight" style={{ fontWeight: 700 }}>
                어디가 불편하신가요?
              </h2>
              {viewMode === '2d' && zoomLevel !== 'full' && (
                <button
                  onClick={() => { setZoomLevel('full'); setSelectedPartId(null); setHoveredPartId(null); setActiveResult(null); setMobilePanel(false); }}
                  className="flex items-center gap-1 text-teal-600 dark:text-teal-400 text-[13px] px-3 py-1.5 bg-white/70 dark:bg-[#2C2C2E]/80 backdrop-blur-sm rounded-full border border-white/40 dark:border-gray-600/40 cursor-pointer"
                  style={{ fontWeight: 600 }}
                >
                  <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
                  전체
                </button>
              )}
            </div>
            <div className="flex items-center bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-sm rounded-[12px] px-3.5 py-2.5 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" strokeWidth={2.5} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim()) setMobilePanel(true);
                }}
                onFocus={() => { if (searchQuery.trim()) setMobilePanel(true); }}
                placeholder="증상 또는 혈자리 검색"
                className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[14px]"
                style={{ fontWeight: 500 }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="w-5 h-5 flex items-center justify-center bg-gray-300 dark:bg-gray-600 rounded-full text-white text-xs cursor-pointer" style={{ fontWeight: 700 }}>×</button>
              )}
            </div>
          </div>

          {/* 2D/3D 토글 + 전체 보기 (데스크탑) */}
          <div className="absolute top-8 right-8 z-20 hidden md:flex gap-2">
            {/* 뷰 모드 토글 */}
            <button
              onClick={() => { setViewMode(viewMode === '3d' ? '2d' : '3d'); setZoomLevel('full'); setSelectedPartId(null); setHoveredPartId(null); }}
              className="flex bg-white/70 dark:bg-[#2C2C2E]/80 backdrop-blur-xl border border-white/40 dark:border-gray-600/40 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded-full text-[13px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] items-center gap-1.5 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              style={{ fontWeight: 600 }}
            >
              {viewMode === '3d' ? <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" /> : <Box className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
              {viewMode === '3d' ? '2D 보기' : '3D 보기'}
            </button>
            {/* 전체 보기 (2D 줌 시) */}
            {viewMode === '2d' && zoomLevel !== 'full' && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => { setZoomLevel('full'); setSelectedPartId(null); setHoveredPartId(null); setActiveResult(null); setMobilePanel(false); }}
                className="flex bg-white/70 dark:bg-[#2C2C2E]/80 backdrop-blur-xl border border-white/40 dark:border-gray-600/40 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded-full text-[13px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] items-center gap-1.5 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                style={{ fontWeight: 700 }}
              >
                <ChevronLeft className="w-4 h-4 text-teal-600 dark:text-teal-400" strokeWidth={2.5} />
                전체
              </motion.button>
            )}
          </div>

          {/* 모바일 2D/3D 토글 */}
          <button
            onClick={() => { setViewMode(viewMode === '3d' ? '2d' : '3d'); setZoomLevel('full'); setSelectedPartId(null); setHoveredPartId(null); }}
            className="md:hidden absolute top-[calc(env(safe-area-inset-top,0px)+80px)] right-4 z-20 flex bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-[12px] shadow-sm items-center gap-1 cursor-pointer"
            style={{ fontWeight: 600 }}
          >
            {viewMode === '3d' ? <Layers className="w-3.5 h-3.5" /> : <Box className="w-3.5 h-3.5" />}
            {viewMode === '3d' ? '2D' : '3D'}
          </button>

          {/* ── 바디맵 렌더링 ── */}
          {viewMode === '3d' ? (
            <BodyMap3D
              isDark={isDark}
              hoveredPartId={hoveredPartId}
              selectedPartId={selectedPartId}
              onHover={setHoveredPartId}
              onClick={handlePartClick}
            />
          ) : (
            <BodyMap
              isDark={isDark}
              hoveredPartId={hoveredPartId}
              selectedPartId={selectedPartId}
              zoomLevel={zoomLevel}
              searchQuery={searchQuery}
              searchResultPartIds={searchResults.map(r => r.partId)}
              bodyGroups={BODY_GROUPS}
              onHover={setHoveredPartId}
              onClick={handlePartClick}
            />
          )}

          {/* 마우스 따라다니는 툴팁 (2D 전용) */}
          {viewMode === '2d' && tooltipText && (
            <div
              className="fixed z-50 pointer-events-none bg-gray-900/85 dark:bg-gray-100/90 backdrop-blur-md text-white dark:text-gray-900 text-[13px] px-3.5 py-1.5 rounded-lg shadow-xl border border-white/10 dark:border-gray-800/10 whitespace-nowrap hidden md:block"
              style={{ left: mousePos.x + 15, top: mousePos.y + 15, fontWeight: 600 }}
            >
              {tooltipText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
