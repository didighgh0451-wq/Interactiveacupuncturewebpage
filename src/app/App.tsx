import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronRight, ClipboardList, MapPin, Hand, Clock, RotateCcw, Sparkles, Shield, Share2, ArrowLeft, X, Zap, MousePointerClick, Move3D, ListChecks, Download, MessageCircle, Calendar, ChevronDown } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import html2canvas from 'html2canvas';
import { Drawer } from 'vaul';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { BodyMap3D } from './components/body-map-3d';

// 햅틱 유틸
const haptic = (ms = 12) => { try { navigator?.vibrate?.(ms); } catch {} };

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

// ── 부위 데이터 (10~30대 공감형 카피) ──
const SUB_PARTS: Record<string, SubPartData> = {
  head_main: { name: '머리', group: 'head', symptoms: [
    { title: '머리가 지끈지끈할 때', point: '백회혈' },
    { title: '머리가 멍하고 핑 돌 때', point: '풍지혈' },
    { title: '숙취로 머리가 깨질 것 같을 때', point: '풍지혈' },
    { title: '집중이 안 되고 멍할 때', point: '백회혈' },
  ] },
  eyes: { name: '눈', group: 'head', symptoms: [
    { title: '화면 보다가 눈이 뻑뻑할 때', point: '찬죽혈' },
    { title: '눈이 빨갛고 건조할 때', point: '태양혈' },
    { title: '눈 밑이 파르르 떨릴 때', point: '사백혈' },
  ] },
  neck: { name: '목', group: 'head', symptoms: [
    { title: '뒷목이 뻣뻣하고 당길 때', point: '천주혈' },
    { title: '목이 안 돌아갈 정도로 뻐근할 때', point: '풍지혈' },
  ] },
  shoulder: { name: '어깨', group: 'chest', note: '양쪽 동일하게 적용', symptoms: [
    { title: '어깨가 돌덩이처럼 굳었을 때', point: '견정혈' },
    { title: '등 뒤 날개뼈가 쑤실 때', point: '천종혈' },
    { title: '하루종일 앉아있더니 어깨가 올라갔을 때', point: '견정혈' },
  ] },
  chest_main: { name: '가슴', group: 'chest', symptoms: [
    { title: '가슴이 답답하고 숨이 막힐 때', point: '단중혈' },
    { title: '긴장해서 숨이 얕아질 때', point: '옥당혈' },
    { title: '긴장하면 심장이 두근두근할 때', point: '단중혈' },
  ] },
  abdomen_main: { name: '상복부', group: 'abdomen', symptoms: [
    { title: '방금 먹은 게 안 내려갈 때', point: '중완혈' },
    { title: '속이 쓰리고 울렁거릴 때', point: '거궐혈' },
    { title: '먹고 나서 배가 빵빵할 때', point: '중완혈' },
    { title: '배에서 소리만 나고 소화가 안 될 때', point: '거궐혈' },
  ] },
  pelvis: { name: '하복부·골반', group: 'abdomen', symptoms: [
    { title: '그날이 너무 아플 때', point: '관원혈(단전)' },
    { title: '화장실이 안 통할 때', point: '천추혈' },
    { title: '급하게 화장실 가야 할 때', point: '천추혈' },
    { title: '아랫배가 차갑고 으슬으슬할 때', point: '관원혈(단전)' },
  ] },
  back_upper: { name: '등', group: 'back', symptoms: [
    { title: '등에 담 걸린 것 같을 때', point: '풍문혈' },
    { title: '등이 뻣뻣하고 결릴 때', point: '풍문혈' },
  ] },
  back_lower: { name: '허리', group: 'back', symptoms: [
    { title: '허리가 하루종일 욱신거릴 때', point: '신수혈' },
    { title: '허리 삐끗해서 못 움직일 때', point: '요양관혈' },
    { title: '엉덩이부터 다리까지 저릴 때', point: '환도혈' },
    { title: '오래 앉아서 허리가 끊어질 것 같을 때', point: '신수혈' },
  ] },
  arm_upper: { name: '윗팔', group: 'arms', note: '양쪽 동일하게 적용', symptoms: [
    { title: '어깨부터 팔까지 찌릿할 때', point: '견우혈' },
  ] },
  arm_lower: { name: '아랫팔', group: 'arms', note: '양쪽 동일하게 적용', symptoms: [
    { title: '팔뚝이 시큰시큰할 때', point: '수삼리혈' },
    { title: '손목 쓸 때마다 찌릿할 때', point: '내관혈' },
    { title: '멀미나서 속이 울렁거릴 때', point: '내관혈' },
  ] },
  hand: { name: '손', group: 'arms', note: '양쪽 동일하게 적용', symptoms: [
    { title: '체했을 때 일단 여기부터', point: '합곡혈' },
    { title: '손이 차갑고 긴장될 때', point: '노궁혈' },
    { title: '두통약 없을 때 응급처치', point: '합곡혈' },
    { title: '발표 전에 손에 땀이 날 때', point: '노궁혈' },
  ] },
  leg_upper: { name: '허벅지', group: 'legs', note: '양쪽 동일하게 적용', symptoms: [
    { title: '허벅지가 무겁고 저릴 때', point: '풍시혈' },
    { title: '오래 앉았다가 일어나면 다리가 뻣뻣할 때', point: '풍시혈' },
  ] },
  leg_lower: { name: '종아리', group: 'legs', note: '양쪽 동일하게 적용', symptoms: [
    { title: '다리 붓고 밤에 쥐날 때', point: '승산혈' },
    { title: '다리에 힘이 안 들어갈 때', point: '족삼리혈' },
    { title: '오래 서있어서 종아리가 터질 것 같을 때', point: '승산혈' },
  ] },
  foot: { name: '발', group: 'legs', note: '양쪽 동일하게 적용', symptoms: [
    { title: '온몸이 찌뿌둥하고 지칠 때', point: '용천혈' },
    { title: '자려고 누웠는데 잠이 안 올 때', point: '태충혈' },
    { title: '스트레스 받아서 화가 치밀 때', point: '태충혈' },
    { title: '발이 차가워서 잠이 안 올 때', point: '용천혈' },
  ] },
};

// ── 혈자리 상세 정보 (촌→손가락 마디 통일, 의학용어 순화) ──
const POINT_DETAILS: Record<string, PointDetail> = {
  '백회혈': {
    name: '백회혈',
    location: '정수리 꼭대기, 양쪽 귀를 연결하는 선과 코에서 뒤통수로 넘어가는 선이 만나는 점',
    method: '검지와 중지로 부드럽게 원을 그리며 지압합니다. 숨을 내쉬면서 천천히 눌러주세요.',
    duration: '3~5초간 누르고 2초 쉬기',
    repetitions: '10~15회 반복',
    effects: ['긴장성 두통 완화', '스트레스 해소', '정신 맑아짐', '혈액순환 촉진'],
  },
  '풍지혈': {
    name: '풍지혈',
    location: '뒷머리 아래, 목 뒤 양쪽 움푹 들어간 부분 (후두부 아래 좌우 오목한 곳)',
    method: '양쪽 엄지로 두개골 방향(위쪽)으로 눌러줍니다.',
    duration: '5~7초간 지속 압박',
    repetitions: '8~10회 반복',
    effects: ['어지러움 완화', '두통 해소', '목 뒤 긴장 해소', '혈액순환 촉진'],
  },
  // ✅ 신규: 천주혈 (목 전용)
  '천주혈': {
    name: '천주혈',
    location: '뒷목 중앙, 머리카락이 시작되는 지점에서 양쪽으로 손가락 한 마디 반(약 3cm) 바깥, 목 뒤 두꺼운 근육 바깥쪽 오목한 곳',
    method: '양쪽 엄지를 목 뒤에 대고 두개골 방향(위쪽)으로 천천히 눌러줍니다. 고개를 살짝 숙이면 찾기 쉬워요.',
    duration: '5~7초간 지속 압박',
    repetitions: '8~10회 반복',
    effects: ['뒷목 뻐근함 해소', '거북목 통증 완화', '두통 완화', '목 피로 해소'],
  },
  '견정혈': {
    name: '견정혈',
    location: '목과 어깨 끝의 중간 지점, 어깨 위쪽의 가장 높은 곳',
    method: '반대편 손의 중지로 어깨 위를 강하게 누릅니다.',
    duration: '5~7초간 누르기',
    repetitions: '8~10회 반복 (양쪽)',
    effects: ['어깨 결림 해소', '어깨 뭉침 완화', '상체 혈액순환', '목·어깨 긴장 이완'],
  },
  '단중혈': {
    name: '단중혈',
    location: '양쪽 유두를 연결하는 선의 정중앙, 가슴뼈(흉골) 위',
    method: '검지와 중지로 흉골 위를 부드럽게 원형으로 문질러줍니다.',
    duration: '5초간 누르기',
    repetitions: '10~15회 반복',
    effects: ['가슴 답답함 해소', '화병 완화', '기혈 순환 촉진', '정서 안정'],
  },
  // ✅ 전중혈 삭제, 옥당혈 신규 추가
  '옥당혈': {
    name: '옥당혈',
    location: '가슴뼈(흉골) 위, 단중혈에서 위로 손가락 한 마디 반(약 3cm) 지점',
    method: '손바닥을 가슴에 대고 따뜻하게 감싸면서 부드럽게 시계 방향으로 문질러줍니다.',
    duration: '7~10초간 부드럽게 누르기',
    repetitions: '10~12회 반복',
    effects: ['호흡 안정', '가슴 답답함 해소', '기관지 건강', '심폐 기능 강화'],
  },
  '중완혈': {
    name: '중완혈',
    location: '배꼽과 명치(갈비뼈 아래 움푹한 곳)의 정중앙',
    method: '손바닥으로 시계 방향으로 부드럽게 문질러줍니다.',
    duration: '5~10초간 부드럽게 누르기',
    repetitions: '15~20회 반복',
    effects: ['소화 촉진', '위장 기능 강화', '속쓰림 완화', '복부 불쾌감 해소'],
  },
  '거궐혈': {
    name: '거궐혈',
    location: '명치 바로 아래 움푹 파인 곳, 갈비뼈가 만나는 지점 바로 아래', // ✅ 6촌 제거
    method: '검지와 중지로 명치 아래를 부드럽게 눌러줍니다. 식후 30분 후에 시행하세요.',
    duration: '3~5초간 누르기',
    repetitions: '10~12회 반복',
    effects: ['속쓰림 완화', '위산 역류 개선', '위장 기능 안정', '소화 촉진'],
  },
  '관원혈(단전)': {
    name: '관원혈',
    location: '배꼽에서 아래로 손가락 네 마디(약 7cm) 떨어진 하복부',
    method: '손바닥을 대고 따뜻하게 감싸면서 부드럽게 시계 방향으로 누릅니다.',
    duration: '7~10초간 지속 압박',
    repetitions: '10~15회 반복',
    effects: ['생리통 완화', '하복부 냉증 개선', '자궁 건강', '기력 회복'],
  },
  '견우혈': {
    name: '견우혈',
    location: '어깨 끝에서 약간 앞쪽 아래, 팔을 들면 나타나는 오목한 곳',
    method: '반대편 손으로 어깨 앞쪽 오목한 부분을 엄지로 꾹 눌러줍니다.',
    duration: '5초간 누르고 3초 쉬기',
    repetitions: '10~12회 반복 (양쪽)',
    effects: ['어깨~팔 저림 완화', '어깨 통증 해소', '상지 혈행 촉진', '관절 유연성 개선'],
  },
  '수삼리혈': {
    name: '수삼리혈',
    location: '팔꿈치 바깥쪽 주름에서 손목 방향으로 손가락 세 마디(약 5cm) 아래',
    method: '반대편 엄지로 팔 바깥쪽을 세게 눌러줍니다.',
    duration: '5~7초간 누르기',
    repetitions: '10~15회 반복 (양쪽)',
    effects: ['팔뚝 통증 완화', '팔 피로 해소', '소화 기능 보조', '상지 혈행 촉진'],
  },
  '합곡혈': {
    name: '합곡혈',
    location: '엄지와 검지 사이 물갈퀴 부분에서 검지뼈를 따라 살짝 올라간 움푹 파인 곳', // ✅ 의학용어 순화
    method: '반대 손 엄지와 검지로 합곡혈을 잡고 강하게 눌러줍니다.',
    duration: '5~7초간 누르기',
    repetitions: '10~15회 반복 (양손)',
    effects: ['체기 해소', '두통·치통 완화', '면역력 강화', '전신 기혈 순환'],
  },
  '노궁혈': {
    name: '노궁혈',
    location: '손바닥 한가운데, 주먹을 쥘 때 중지 끝이 닿는 지점',
    method: '반대쪽 엄지로 손바닥 중앙을 꾹 눌러줍니다.',
    duration: '3~5초간 누르기',
    repetitions: '15~20회 반복 (양손)',
    effects: ['수족냉증 개선', '손 혈액순환 촉진', '긴장 완화', '마음 안정'],
  },
  '풍시혈': {
    name: '풍시혈',
    location: '차렷 자세에서 중지 끝이 닿는 허벅지 바깥쪽 지점',
    method: '주먹으로 허벅지 바깥을 가볍게 두드리거나 엄지로 눌러줍니다.',
    duration: '5초간 누르기',
    repetitions: '10~15회 반복 (양쪽)',
    effects: ['허벅지 피로 해소', '하지 저림 완화', '하체 혈행 촉진', '다리 가벼워짐'],
  },
  '승산혈': {
    name: '승산혈',
    location: '종아리 뒤쪽 중간, 까치발을 들었을 때 종아리 근육이 갈라지는 V자 지점',
    method: '엄지로 종아리 V자 부분을 천천히 강하게 눌러줍니다.',
    duration: '5~7초간 누르기',
    repetitions: '10~15회 반복 (양쪽)',
    effects: ['다리 부종 완화', '종아리 피로 해소', '혈액순환 촉진', '다리 쥐남 방지'],
  },
  '족삼리혈': {
    name: '족삼리혈',
    location: '무릎뼈 바깥쪽 아래 움푹 파인 곳에서 손가락 네 마디(약 7cm) 아래',
    method: '엄지로 정강이 바깥쪽을 세게 눌러줍니다.',
    duration: '5~7초간 누르기',
    repetitions: '10~15회 반복 (양쪽)',
    effects: ['하체 무력감 해소', '소화 기능 강화', '체력 증진', '면역력 향상'],
  },
  '용천혈': {
    name: '용천혈',
    location: '발바닥 앞쪽 1/3 지점, 발가락을 구부렸을 때 움푹 파이는 곳',
    method: '엄지로 발바닥을 강하게 눌러줍니다. 취침 전에 하면 효과적입니다.',
    duration: '5~7초간 누르기',
    repetitions: '15~20회 반복 (양발)',
    effects: ['전신 피로 회복', '발바닥 통증 완화', '신장 기능 강화', '하체 냉증 개선'],
  },
  '태충혈': {
    name: '태충혈',
    location: '발등, 엄지발가락과 둘째 발가락 사이 뼈가 만나는 움푹 파인 곳',
    method: '엄지로 발등의 V자 뼈 사이를 눌러줍니다. 취침 전에 하면 효과적입니다.',
    duration: '3~5초간 누르기',
    repetitions: '15~20회 반복 (양발)',
    effects: ['불면증 개선', '스트레스 해소', '간 기능 안정', '마음 안정·이완'],
  },
  '찬죽혈': {
    name: '찬죽혈',
    location: '눈썹 안쪽 끝, 눈썹이 시작되는 움푹 파인 곳',
    method: '양쪽 엄지로 눈썹 안쪽 끝을 부드럽게 원을 그리며 눌러줍니다. 눈을 감고 시행하세요.',
    duration: '3~5초간 누르기',
    repetitions: '10~15회 반복',
    effects: ['눈 피로 해소', '시력 보호', '두통 완화', '눈 주위 혈행 촉진'],
  },
  '태양혈': {
    name: '태양혈',
    location: '눈꼬리와 눈썹 끝 사이에서 손가락 한 마디 정도(약 2cm) 뒤쪽, 관자놀이 움푹 파인 곳', // ✅ 1촌→손가락 한 마디
    method: '양쪽 검지로 관자놀이를 부드럽게 원형으로 마사지합니다.',
    duration: '5~7초간 부드럽게 누르기',
    repetitions: '10~15회 반복',
    effects: ['눈 충혈 완화', '안구 건조 개선', '편두통 완화', '눈 주위 긴장 해소'],
  },
  '사백혈': {
    name: '사백혈',
    location: '눈동자 바로 아래, 눈 아래뼈 가장자리에서 손가락 한 마디 정도(약 2cm) 아래 움푹한 곳', // ✅ 1촌→손가락 한 마디
    method: '검지로 눈 아래를 부드럽게 눌러줍니다. 강하게 누르지 마세요.',
    duration: '3~5초간 부드럽게 누르기',
    repetitions: '10~12회 반복',
    effects: ['눈 떨림 완화', '안면 경련 해소', '눈 피로 회복', '안면 혈행 촉진'],
  },
  '천종혈': {
    name: '천종혈',
    location: '등 뒤쪽 날개뼈 중앙의 움푹 파인 곳, 손을 뒤로 돌려 만지면 찾기 쉬움',
    method: '테니스공을 벽과 등 사이에 놓고 문지르거나, 반대편 손으로 날개뼈 중앙을 눌러줍니다.',
    duration: '5~7초간 누르기',
    repetitions: '10~15회 반복 (양쪽)',
    effects: ['어깨 뭉침 해소', '날개뼈 통증 완화', '상체 혈행 촉진', '어깨 유연성 개선'],
  },
  '풍문혈': {
    name: '풍문혈',
    location: '등 위쪽, 목 아래 두 번째 뼈 양옆 손가락 한 마디 반(약 3cm) 지점', // ✅ 1.5촌→손가락 한 마디 반
    method: '테니스공 두 개를 양말에 넣어 등 아래에 놓고 굴리거나, 파트너가 엄지로 눌러줍니다.',
    duration: '5~7초간 눌러 풀기',
    repetitions: '10~12회 반복',
    effects: ['등 뻐근함 해소', '담 결림 완화', '감기 예방', '등 근육 이완'],
  },
  '신수혈': {
    name: '신수혈',
    location: '허리 양쪽, 배꼽 높이 척추뼈 양옆 손가락 한 마디 반(약 3cm) 지점', // ✅ 1.5촌→손가락 한 마디 반
    method: '양손 주먹으로 허리 양쪽을 가볍게 두드리거나, 엄지로 눌러줍니다.',
    duration: '5~10초간 지속 압박',
    repetitions: '15~20회 반복',
    effects: ['만성 허리 통증 완화', '신장 기능 강화', '기력 회복', '하체 냉증 개선'],
  },
  '요양관혈': {
    name: '요양관혈',
    location: '허리 정중앙, 골반 위쪽 높이의 척추 한가운데',
    method: '엄지 또는 손바닥으로 허리 중앙을 눌러주고, 따뜻하게 감싸줍니다.',
    duration: '7~10초간 지속 압박',
    repetitions: '10~15회 반복',
    effects: ['급성 요통 완화', '허리 유연성 개선', '하체 혈행 촉진', '허리 온기 보충'],
  },
  '환도혈': {
    name: '환도혈',
    location: '엉덩이 바깥쪽, 옆으로 누웠을 때 엉덩이에서 가장 튀어나온 뼈와 꼬리뼈 사이 오목한 곳', // ✅ 의학용어 순화
    method: '테니스공 위에 엉덩이를 올려놓고 체중으로 눌러주거나, 엄지로 강하게 눌러줍니다.',
    duration: '5~7초간 누르기',
    repetitions: '10~12회 반복 (양쪽)',
    effects: ['엉덩이~다리 통증 완화', '엉덩이 뻐근함 해소', '하지 혈행 촉진', '고관절 유연성 개선'],
  },
  '천추혈': {
    name: '천추혈',
    location: '배꼽 양옆 손가락 두 마디(약 4cm) 지점', // ✅ 2촌→손가락 두 마디
    method: '검지와 중지로 배꼽 양쪽을 동시에 부드럽게 눌러줍니다. 시계 방향으로 문질러도 좋습니다.',
    duration: '5~7초간 부드럽게 누르기',
    repetitions: '15~20회 반복',
    effects: ['변비 해소', '장 기능 활성화', '복부 팽만감 완화', '소화 촉진'],
  },
  '내관혈': {
    name: '내관혈',
    location: '손목 안쪽 주름에서 팔꿈치 방향으로 손가락 세 마디(약 5cm) 위, 두 힘줄 사이',
    method: '반대 손 엄지로 손목 안쪽을 부드럽게 눌러줍니다.',
    duration: '3~5초간 누르기',
    repetitions: '10~15회 반복 (양손)',
    effects: ['손목 통증 완화', '멀미·메스꺼움 해소', '심장 안정', '정서 안정'],
  },
};

// ── 상황별 바로가기 (12개) ──
const SITUATION_SHORTCUTS: SituationShortcut[] = [
  { icon: '🚽', title: '급하게 화장실 가야 할 때',   desc: '장 운동 활성화',             partId: 'pelvis',       symptomTitle: '급하게 화장실 가야 할 때' },
  { icon: '🍻', title: '숙취로 머리가 깨질 때',      desc: '두통 해소 + 해독',           partId: 'head_main',    symptomTitle: '숙취로 머리가 깨질 것 같을 때' },
  { icon: '😪', title: '회의 중에 졸릴 때',          desc: '정신 각성 + 집중력',         partId: 'head_main',    symptomTitle: '집중이 안 되고 멍할 때' },
  { icon: '🫣', title: '발표 전에 떨릴 때',          desc: '긴장 완화 + 마음 안정',      partId: 'hand',         symptomTitle: '발표 전에 손에 땀이 날 때' },
  { icon: '🍕', title: '먹고 나서 배 터질 것 같을 때', desc: '소화 촉진 + 더부룩함 해소',  partId: 'abdomen_main', symptomTitle: '먹고 나서 배가 빵빵할 때' },
  { icon: '📱', title: '화면 너무 오래 봤을 때',      desc: '눈 피로 + 시력 보호',        partId: 'eyes',         symptomTitle: '화면 보다가 눈이 뻑뻑할 때' },
  { icon: '🌙', title: '새벽인데 잠이 안 올 때',      desc: '수면 유도 + 이완',           partId: 'foot',         symptomTitle: '자려고 누웠는데 잠이 안 올 때' },
  { icon: '💢', title: '그날이 너무 힘들 때',         desc: '하복부 온기 + 통증 완화',    partId: 'pelvis',       symptomTitle: '그날이 너무 아플 때' },
  { icon: '🪨', title: '어깨가 돌덩이가 됐을 때',     desc: '어깨 이완 + 혈행 촉진',     partId: 'shoulder',     symptomTitle: '어깨가 돌덩이처럼 굳었을 때' },
  { icon: '⚡', title: '체했을 때 응급처치',          desc: '체기 해소 + 소화 촉진',      partId: 'hand',         symptomTitle: '체했을 때 일단 여기부터' },
  { icon: '🪑', title: '오래 앉아서 허리 끊어질 때',   desc: '허리 통증 완화',             partId: 'back_lower',   symptomTitle: '오래 앉아서 허리가 끊어질 것 같을 때' },
  { icon: '🥶', title: '온몸이 찌뿌둥한 날',          desc: '전신 순환 + 기력 충전',      partId: 'foot',         symptomTitle: '온몸이 찌뿌둥하고 지칠 때' },
];


// ── 지점 데이터 ──
interface BranchData {
  name: string;
  naverUrl: string;
  kakaoUrl: string;
}

const BRANCHES: BranchData[] = [
  { name: '잠실점',     naverUrl: '#naver-jamsil',     kakaoUrl: '#kakao-jamsil' },
  { name: '대치점',     naverUrl: '#naver-daechi',     kakaoUrl: '#kakao-daechi' },
  { name: '강남점',     naverUrl: '#naver-gangnam',    kakaoUrl: '#kakao-gangnam' },
  { name: '분당점',     naverUrl: '#naver-bundang',    kakaoUrl: '#kakao-bundang' },
  { name: '하남미사점', naverUrl: '#naver-hanam',      kakaoUrl: '#kakao-hanam' },
  { name: '마곡점',     naverUrl: '#naver-magok',      kakaoUrl: '#kakao-magok' },
  { name: '천안아산점', naverUrl: '#naver-cheonan',    kakaoUrl: '#kakao-cheonan' },
  { name: '여의도점',   naverUrl: '#naver-yeouido',    kakaoUrl: '#kakao-yeouido' },
  { name: '광교점',     naverUrl: '#naver-gwanggyo',   kakaoUrl: '#kakao-gwanggyo' },
  { name: '과천점',     naverUrl: '#naver-gwacheon',   kakaoUrl: '#kakao-gwacheon' },
  { name: '광화문점',   naverUrl: '#naver-gwanghwamun', kakaoUrl: '#kakao-gwanghwamun' },
];


// ============================================================
// 온보딩 가이드 (3단계 코치마크)
// ============================================================

const ONBOARDING_STEPS = [
  {
    icon: Move3D,
    title: '3D 모델을 돌려봐',
    desc: '드래그하면 인체 모델이 회전해.\n두 손가락으로 확대/축소도 돼!',
  },
  {
    icon: MousePointerClick,
    title: '반짝이는 부위를 터치!',
    desc: '아픈 부위에 빛나는 점이 보이지?\n터치하면 증상 목록이 쭉 나와.',
  },
  {
    icon: ListChecks,
    title: '증상 고르면 끝!',
    desc: '증상을 선택하면 딱 맞는 혈자리와\n지압법을 바로 알려줄게.',
  },
];

function OnboardingOverlay({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const current = ONBOARDING_STEPS[step];
  const Icon = current.icon;
  const isLast = step === ONBOARDING_STEPS.length - 1;

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-label={`온보딩 가이드 ${step + 1}/${ONBOARDING_STEPS.length} 단계`}
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 bg-white dark:bg-[#2C2C2E] rounded-3xl shadow-2xl max-w-xs w-full mx-6 overflow-hidden"
      >
        <div className="bg-gradient-to-br from-teal-500 to-emerald-500 px-6 pt-8 pb-6 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
            className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4"
          >
            <Icon className="w-8 h-8 text-white" strokeWidth={1.8} />
          </motion.div>
          <div className="flex gap-2">
            {ONBOARDING_STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 20 : 6,
                  backgroundColor: i === step ? 'white' : 'rgba(255,255,255,0.35)',
                }}
              />
            ))}
          </div>
        </div>
        <div className="px-6 pt-5 pb-6 text-center">
          <h3 className="text-[18px] text-gray-900 dark:text-gray-100 mb-2" style={{ fontWeight: 700 }}>
            {current.title}
          </h3>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 !leading-[1.7] whitespace-pre-line mb-6" style={{ fontWeight: 400 }}>
            {current.desc}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onComplete}
              className="flex-1 py-3 rounded-xl text-[14px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-[#3A3A3C] cursor-pointer active:scale-[0.97] transition-transform"
              style={{ fontWeight: 600 }}
            >
              건너뛰기
            </button>
            <button
              onClick={() => { if (isLast) onComplete(); else setStep(s => s + 1); }}
              className="flex-1 py-3 rounded-xl text-[14px] text-white bg-gradient-to-r from-teal-600 to-emerald-500 cursor-pointer active:scale-[0.97] transition-transform shadow-md shadow-teal-500/20"
              style={{ fontWeight: 700 }}
            >
              {isLast ? '바로 시작!' : `다음 (${step + 1}/${ONBOARDING_STEPS.length})`}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


// ============================================================
// 5단계 진행 표시
// ============================================================

const FLOW_STEPS = [
  { short: '시작' },
  { short: '부위' },
  { short: '증상' },
  { short: '결과' },
  { short: '마무리' },
];

function StepIndicator({ currentStep, isDark }: { currentStep: number; isDark: boolean }) {
  return (
    <div className="flex items-center gap-1 w-full max-w-xs">
      {FLOW_STEPS.map((s, i) => {
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full h-[3px] rounded-full transition-all duration-500"
              style={{
                backgroundColor: isDone || isActive ? '#0D9488' : isDark ? 'rgba(99,99,102,0.3)' : 'rgba(209,213,219,0.6)',
                opacity: isActive ? 1 : isDone ? 0.6 : 0.4,
              }}
            />
            <span
              className="text-[9px] transition-all duration-300 whitespace-nowrap"
              style={{
                color: isActive ? '#0D9488' : isDone ? (isDark ? '#6B7280' : '#9CA3AF') : (isDark ? 'rgba(99,99,102,0.5)' : 'rgba(156,163,175,0.5)'),
                fontWeight: isActive ? 700 : 500,
                opacity: isActive || isDone ? 1 : 0.6,
              }}
            >
              {s.short}
            </span>
          </div>
        );
      })}
    </div>
  );
}


// ============================================================
// 인트로 오버레이
// ============================================================

function IntroOverlay({ onStart }: { onStart: () => void }) {
  const [exiting, setExiting] = useState(false);

  const handleStart = () => {
    setExiting(true);
    setTimeout(onStart, 700);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-label="인트로 화면"
    >
      {/* 배경 — 퇴장 시 블러+스케일업 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-teal-50 via-white to-emerald-50/40 dark:from-[#0a1a18] dark:via-[#1C1C1E] dark:to-[#0d1f1a]"
        animate={exiting ? { scale: 1.15, filter: 'blur(20px)', opacity: 0 } : { scale: 1, filter: 'blur(0px)', opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[12%] left-[8%] w-80 h-80 bg-teal-200/30 dark:bg-teal-700/20 rounded-full blur-3xl"
          animate={exiting
            ? { scale: 2, opacity: 0, x: -100, y: -100 }
            : { scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={exiting ? { duration: 0.6, ease: 'easeOut' } : { duration: 7, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-[15%] right-[8%] w-96 h-96 bg-emerald-200/25 dark:bg-emerald-800/15 rounded-full blur-3xl"
          animate={exiting
            ? { scale: 2, opacity: 0, x: 100, y: 100 }
            : { scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
          transition={exiting ? { duration: 0.6, ease: 'easeOut' } : { duration: 9, repeat: Infinity }}
        />
      </div>

      {/* 콘텐츠 — 퇴장 시 위로 슬라이드+축소+페이드 */}
      <motion.div
        className="relative z-10 flex flex-col items-center max-w-lg text-center px-6"
        animate={exiting ? { y: -60, opacity: 0, scale: 0.92 } : { y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.15 }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-xl shadow-teal-500/25 overflow-hidden">
            <img src="/99.png" alt="로고" className="w-16 h-16 object-contain" onError={(e) => {
              // 로고 없으면 기본 SVG 폴백
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) {
                (e.target as HTMLImageElement).style.display = 'none';
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('width', '48');
                svg.setAttribute('height', '48');
                svg.setAttribute('viewBox', '0 0 48 48');
                svg.innerHTML = '<circle cx="24" cy="11" r="5.5" fill="white" opacity="0.92"/><path d="M24 18C18.5 18 15 24 15 30L18.5 42H29.5L33 30C33 24 29.5 18 24 18Z" fill="white" opacity="0.92"/><circle cx="24" cy="27" r="2" fill="#0d9488"/>';
                parent.appendChild(svg);
              }
            }} />
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
          3초 지압 셀프케어
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
          불편한 곳을 터치하면<br />
          딱 맞는 지압 포인트를 알려줄게요.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleStart}
          className="group relative px-10 py-4 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-2xl text-[17px] shadow-lg shadow-teal-500/25 cursor-pointer overflow-hidden"
          style={{ fontWeight: 700 }}
        >
          {/* 버튼 광택 애니메이션 */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <span className="relative">시작해볼까 →</span>
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const isDarkNow = document.documentElement.classList.contains('dark');

  const handleSaveImage = async () => {
    if (!cardRef.current || saving) return;
    haptic(20);
    setSaving(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: isDarkNow ? '#1C1C1E' : '#F9F9FB',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');

      if (navigator.share && navigator.canShare) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `혈자리_${point.name.split(' ')[0]}.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: '혈자리 가이드' });
          setSaving(false);
          return;
        }
      }

      const link = document.createElement('a');
      link.download = `혈자리_${point.name.split(' ')[0]}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('이미지 저장 완료!');
    } catch {
      toast.error('저장에 실패했어요.');
    }
    setSaving(false);
  };

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
          다른 증상 보기
        </button>
        <div className="flex items-center gap-1.5 text-[12px] text-gray-400 dark:text-gray-500 mb-2 flex-wrap" style={{ fontWeight: 500 }}>
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md">{partName}</span>
          {partNote && <span className="text-[10px] text-gray-400 dark:text-gray-500">({partNote})</span>}
          <ChevronRight className="w-3 h-3" />
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md">{symptom.title}</span>
        </div>
        <h2 className="text-[20px] md:text-[22px] text-gray-900 dark:text-gray-100 tracking-tight" style={{ fontWeight: 700 }}>
          이 혈자리 눌러봐
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 bg-[#F9F9FB] dark:bg-[#1C1C1E]">
        {/* 저장용 카드 영역 시작 */}
        <div ref={cardRef} className="space-y-3 md:space-y-4">
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
              <p className="text-teal-100 text-[11px] mb-0.5" style={{ fontWeight: 500 }}>여기를 눌러봐</p>
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
            임산부이거나, 심혈관 질환이 있거나, 피부에 상처가 있다면 지압은 건너뛰세요.
          </p>
        </div>

        {/* 브랜딩 워터마크 (이미지 저장 시 포함됨) */}
        <div className="flex items-center justify-center gap-2 pt-3 pb-1 opacity-60">
          <img src="/99.png" alt="로고" className="w-5 h-5 rounded object-contain" />
          <span className="text-[11px] text-gray-400 dark:text-gray-500" style={{ fontWeight: 600 }}>
            내 몸이 보내는 신호, 혈자리로 풀어봐
          </span>
        </div>
        </div>{/* cardRef 끝 */}

        {/* Buttons */}
        <div className="space-y-2.5 pb-4">
          {/* 이미지로 저장 */}
          <button
            onClick={handleSaveImage}
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-500 text-white rounded-xl text-[14px] shadow-md shadow-violet-500/15 cursor-pointer active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ fontWeight: 700 }}
          >
            <Download className="w-4 h-4" />
            {saving ? '저장 중...' : '이미지로 저장하기'}
          </button>
          <button
            onClick={() => { haptic(); onDisclaimer(); }}
            className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-xl text-[15px] shadow-md shadow-teal-500/15 cursor-pointer active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            style={{ fontWeight: 700 }}
          >
            <Shield className="w-4 h-4" />
            더 정확하게 알고 싶다면
          </button>
          <button
            onClick={async () => {
              haptic();
              if (navigator.share) {
                try { await navigator.share({ title: '혈자리 가이드', text: `${symptom.title} → ${point.name}`, url: window.location.href }); } catch { /* cancelled */ }
              } else {
                await navigator.clipboard.writeText(`${symptom.title} → ${point.name}\n위치: ${point.location}\n방법: ${point.method}`);
                toast.success('복사 완료! 붙여넣기 해봐요.');
              }
            }}
            className="w-full py-3 bg-white dark:bg-[#3A3A3C] border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-[14px] cursor-pointer active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            style={{ fontWeight: 600 }}
          >
            <Share2 className="w-4 h-4" />
            친구한테 공유하기
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
  const [selectedBranch, setSelectedBranch] = useState<BranchData | null>(null);
  const [branchOpen, setBranchOpen] = useState(false);

  return (
    <motion.div className="fixed inset-0 z-[90] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="면책 조항 및 예약">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <motion.div
        className="relative bg-white dark:bg-[#2C2C2E] rounded-3xl shadow-2xl max-w-md w-full p-5 md:p-8 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer" aria-label="닫기">
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* 로고 */}
          <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/40 dark:to-emerald-900/30 border border-teal-100 dark:border-teal-800/50 flex items-center justify-center mb-5 overflow-hidden">
            <img src="/99.png" alt="로고" className="w-10 h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>

          <h2 className="text-[22px] text-gray-900 dark:text-gray-100 tracking-tight mb-2.5 !leading-[1.3]" style={{ fontWeight: 700 }}>
            더 정확한 진단은<br />
            <span className="text-teal-600 dark:text-teal-400">전문가한테 맡기자</span>
          </h2>

          <p className="text-gray-400 dark:text-gray-500 text-[14px] mb-5 !leading-[1.7]" style={{ fontWeight: 400 }}>
            여기 나온 건 건강 정보 차원이지,<br />
            의학적 진단이나 치료를 대신하진 않아요.
          </p>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-xl p-3.5 mb-5 w-full text-left">
            <p className="text-amber-800 dark:text-amber-300 text-[12px] !leading-[1.7]" style={{ fontWeight: 500 }}>
              임산부이거나, 심혈관 질환이 있거나, 피부에 상처가 있다면 지압은 건너뛰세요.
              통증이 심하거나 계속된다면 꼭 전문의와 상담하세요.
            </p>
          </div>

          {/* ─── 지점 선택 + 예약 섹션 ─── */}
          <div className="w-full mb-4">
            <div className="flex items-center gap-1.5 mb-2.5 ml-0.5">
              <MapPin className="w-3.5 h-3.5 text-teal-500" />
              <span className="text-[12px] text-gray-500 dark:text-gray-400 tracking-wider" style={{ fontWeight: 700 }}>
                가까운 지점에서 바로 예약
              </span>
            </div>

            {/* 지점 드롭다운 */}
            <div className="relative mb-2.5">
              <button
                onClick={() => setBranchOpen(!branchOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#3A3A3C] border border-gray-200 dark:border-gray-600 rounded-xl text-[14px] cursor-pointer active:scale-[0.99] transition-transform"
                style={{ fontWeight: 600 }}
              >
                <span className={selectedBranch ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}>
                  {selectedBranch ? selectedBranch.name : '지점을 선택해주세요'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${branchOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* 드롭다운 목록 */}
              <AnimatePresence>
                {branchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#3A3A3C] border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-20 overflow-hidden max-h-[200px] overflow-y-auto origin-top"
                  >
                    {BRANCHES.map((branch) => (
                      <button
                        key={branch.name}
                        onClick={() => { setSelectedBranch(branch); setBranchOpen(false); haptic(8); }}
                        className={`w-full text-left px-4 py-2.5 text-[13px] cursor-pointer transition-colors ${
                          selectedBranch?.name === branch.name
                            ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                        style={{ fontWeight: selectedBranch?.name === branch.name ? 700 : 500 }}
                      >
                        {branch.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 예약 버튼 2개 */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={selectedBranch?.naverUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!selectedBranch) { e.preventDefault(); toast.error('지점을 먼저 선택해주세요!'); return; }
                  haptic(15);
                }}
                className={`flex items-center justify-center gap-1.5 py-3 rounded-xl text-[13px] transition-all active:scale-[0.97] ${
                  selectedBranch
                    ? 'bg-[#03C75A] text-white shadow-md shadow-[#03C75A]/20 cursor-pointer'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
                style={{ fontWeight: 700 }}
              >
                <Calendar className="w-4 h-4" />
                네이버 예약
              </a>
              <a
                href={selectedBranch?.kakaoUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!selectedBranch) { e.preventDefault(); toast.error('지점을 먼저 선택해주세요!'); return; }
                  haptic(15);
                }}
                className={`flex items-center justify-center gap-1.5 py-3 rounded-xl text-[13px] transition-all active:scale-[0.97] ${
                  selectedBranch
                    ? 'bg-[#FEE500] text-[#3C1E1E] shadow-md shadow-[#FEE500]/20 cursor-pointer'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
                style={{ fontWeight: 700 }}
              >
                <MessageCircle className="w-4 h-4" />
                카카오톡 예약
              </a>
            </div>
          </div>

          <div className="w-full space-y-2.5">
            <button
              onClick={async () => {
                if (navigator.share) {
                  try { await navigator.share({ title: '내 몸이 보내는 신호, 혈자리로 풀어봐', text: '3초 지압 셀프케어', url: window.location.href }); } catch { /* cancelled */ }
                } else {
                  await navigator.clipboard.writeText(window.location.href);
                  toast.success('링크 복사 완료!');
                }
              }}
              className="flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-[#3A3A3C] border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-[14px] cursor-pointer active:scale-[0.98] transition-transform"
              style={{ fontWeight: 600 }}
            >
              <Share2 className="w-4 h-4" />
              친구한테 알려주기
            </button>

            <button onClick={onRestart} className="flex items-center justify-center gap-2 w-full py-2.5 text-gray-400 dark:text-gray-500 text-[13px] cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors" style={{ fontWeight: 500 }}>
              <RotateCcw className="w-3.5 h-3.5" />
              처음부터 다시 해볼래
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


// ============================================================
// 패널 콘텐츠 (데스크탑 사이드바 & 모바일 바텀시트 공유)
// ============================================================

interface PanelContentProps {
  activeResult: { partId: string; symptom: SymptomData } | null;
  selectedPartId: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: { partId: string; partName: string; title: string; point: string }[];
  setHoveredPartId: (id: string | null) => void;
  setSelectedPartId: (id: string | null) => void;
  handleSymptomClick: (partId: string, symptom: SymptomData) => void;
  handleShortcutClick: (s: SituationShortcut) => void;
  setActiveResult: (r: { partId: string; symptom: SymptomData } | null) => void;
  setShowDisclaimer: () => void;
  currentFlowStep: number;
  isDark: boolean;
  isMobile: boolean;
}

function PanelContent({
  activeResult, selectedPartId, searchQuery, setSearchQuery, searchResults,
  setHoveredPartId, setSelectedPartId,
  handleSymptomClick, handleShortcutClick, setActiveResult, setShowDisclaimer,
  currentFlowStep, isDark, isMobile,
}: PanelContentProps) {
  return (
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
          onDisclaimer={setShowDisclaimer}
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
          {/* Header — 데스크탑에서만 표시 */}
          {!isMobile && (
            <div className="px-8 pt-10 pb-5 bg-white/80 dark:bg-[#2C2C2E]/80 backdrop-blur-xl sticky top-0 z-10 border-b border-gray-100/50 dark:border-gray-700/50">
              <div className="flex justify-center mb-4">
                <StepIndicator currentStep={currentFlowStep} isDark={isDark} />
              </div>
              <h1 className="text-[28px] text-gray-900 dark:text-gray-100 mb-5 tracking-tight" style={{ fontWeight: 700 }}>
                오늘 몸 어디가 삐걱대?
              </h1>
              <div className="flex items-center bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-[14px] px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-teal-600/30">
                <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2.5" strokeWidth={2.5} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="두통, 소화불량, 허리 등"
                  className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[16px]"
                  style={{ fontWeight: 500 }}
                  aria-label="증상 검색"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="w-5 h-5 flex items-center justify-center bg-gray-300 dark:bg-gray-600 rounded-full text-white text-xs cursor-pointer" style={{ fontWeight: 700 }} aria-label="검색어 지우기">×</button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F9F9FB] dark:bg-[#1C1C1E]">
            {searchQuery.trim() !== '' ? (
              /* ── 검색 결과 ── */
              <div role="region" aria-label="검색 결과">
                <h3 className="text-[12px] text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-3 ml-1" style={{ fontWeight: 700 }}>
                  검색 결과 ({searchResults.length})
                </h3>
                {searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-gray-400 mt-14">
                    <p className="text-gray-500 dark:text-gray-400 text-[16px]" style={{ fontWeight: 600 }}>앗, 결과가 없어요</p>
                    <p className="text-[13px] mt-1.5 text-gray-400 dark:text-gray-500" style={{ fontWeight: 400 }}>다른 키워드로 검색해봐요.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5" role="list">
                    {searchResults.map((res, idx) => (
                      <button
                        key={`${res.partId}-${idx}`}
                        onClick={() => { setSearchQuery(''); setSelectedPartId(res.partId); handleSymptomClick(res.partId, { title: res.title, point: res.point }); }}
                        onMouseEnter={() => setHoveredPartId(res.partId)}
                        onMouseLeave={() => setHoveredPartId(null)}
                        className="w-full text-left bg-white dark:bg-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-gray-700/50 p-4 rounded-[18px] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] active:scale-[0.98] group cursor-pointer"
                        role="listitem"
                        aria-label={`${res.title} - ${res.point}`}
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
                    {SUB_PARTS[selectedPartId].name} - 이런 증상 있어?
                  </h3>
                  {SUB_PARTS[selectedPartId].note && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded" style={{ fontWeight: 500 }}>
                      {SUB_PARTS[selectedPartId].note}
                    </span>
                  )}
                </div>
                <div className="space-y-2.5" role="list" aria-label={`${SUB_PARTS[selectedPartId].name} 증상 목록`}>
                  {SUB_PARTS[selectedPartId].symptoms.map((symptom, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSymptomClick(selectedPartId, symptom)}
                      className="w-full text-left bg-white dark:bg-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-gray-700/50 p-4 rounded-[18px] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] active:scale-[0.98] group cursor-pointer"
                      role="listitem"
                      aria-label={`${symptom.title} - ${symptom.point}`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span className="text-[15px] md:text-[16px] text-gray-800 dark:text-gray-200" style={{ fontWeight: 600 }}>{symptom.title}</span>
                        <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-teal-600 transition-colors">
                          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-500 group-hover:text-white" strokeWidth={3} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-[11px] rounded-md" style={{ fontWeight: 600 }}>추천 혈자리</span>
                        <span className="text-[13px] text-teal-600 dark:text-teal-400" style={{ fontWeight: 700 }}>{symptom.point}</span>
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
                  <p className="text-gray-500 dark:text-gray-400 text-[16px]" style={{ fontWeight: 600 }}>오늘 어디가 불편해?</p>
                  <p className="text-[13px] mt-1 text-gray-400 dark:text-gray-500 text-center max-w-[240px] !leading-relaxed" style={{ fontWeight: 400 }}>
                    3D 바디맵에서 아픈 곳을 눌러보거나,<br />아래 상황에서 골라봐.
                  </p>
                </div>

                {/* 상황별 바로가기 */}
                <nav aria-label="상황별 바로가기">
                  <div className="flex items-center gap-1.5 mb-3 ml-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <h3 className="text-[12px] text-gray-500 dark:text-gray-400 tracking-wider" style={{ fontWeight: 700 }}>
                      지금 이런 상황이라면?
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {SITUATION_SHORTCUTS.map((s) => (
                      <button
                        key={s.title}
                        onClick={() => handleShortcutClick(s)}
                        className="flex flex-col items-start bg-white dark:bg-[#2C2C2E] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-gray-700/50 p-3.5 rounded-[16px] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] active:scale-[0.97] cursor-pointer text-left"
                        aria-label={`${s.title}: ${s.desc}`}
                      >
                        <span className="text-[20px] mb-1.5" aria-hidden="true">{s.icon}</span>
                        <span className="text-[13px] text-gray-800 dark:text-gray-200 !leading-snug" style={{ fontWeight: 600 }}>{s.title}</span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>{s.desc}</span>
                      </button>
                    ))}
                  </div>
                </nav>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


// ============================================================
// 메인 App
// ============================================================

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mobilePanel, setMobilePanel] = useState(false);
  const [isDark, setIsDark] = useState(false);

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

  // OG 메타태그 동적 삽입
  useEffect(() => {
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    document.title = '내 몸이 보내는 신호, 혈자리로 풀어봐';
    setMeta('og:title', '내 몸이 보내는 신호, 혈자리로 풀어봐');
    setMeta('og:description', '3D 바디맵으로 나한테 딱 맞는 지압 포인트를 찾아보세요. 두통, 소화불량, 생리통까지 46가지 증상별 혈자리 가이드.');
    setMeta('og:type', 'website');
    setMeta('og:image', `${window.location.origin}/99.png`);
    setMeta('og:url', window.location.href);

    // Twitter 카드
    let twitterCard = document.querySelector('meta[name="twitter:card"]') as HTMLMetaElement | null;
    if (!twitterCard) {
      twitterCard = document.createElement('meta');
      twitterCard.setAttribute('name', 'twitter:card');
      document.head.appendChild(twitterCard);
    }
    twitterCard.setAttribute('content', 'summary_large_image');

    // description
    let descMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', '3D 바디맵으로 나한테 딱 맞는 지압 포인트를 찾아보세요. 두통, 소화불량, 생리통까지 46가지 증상별 혈자리 가이드.');
  }, []);

  // 바디맵 상태
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeResult, setActiveResult] = useState<{ partId: string; symptom: SymptomData } | null>(null);

  // ── 온보딩 완료 체크 (localStorage) ──
  const onboardingSeen = typeof window !== 'undefined' && localStorage.getItem('onboarding_done') === '1';

  const handleIntroStart = () => {
    setShowIntro(false);
    if (!onboardingSeen) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboarding_done', '1');
  };

  // ── 현재 플로우 단계 계산 ──
  const currentFlowStep = showIntro
    ? 0
    : showDisclaimer
      ? 4
      : activeResult
        ? 3
        : selectedPartId
          ? 2
          : 1;

  const handlePartClick = (id: string) => {
    haptic(10);
    if (SUB_PARTS[id]) {
      setSelectedPartId(id);
      setActiveResult(null);
      setMobilePanel(true);
    }
  };

  const handleSymptomClick = (partId: string, symptom: SymptomData) => {
    haptic(15);
    setActiveResult({ partId, symptom });
    setMobilePanel(true);
  };

  // ✅ 상황별 바로가기 클릭
  const handleShortcutClick = (shortcut: SituationShortcut) => {
    const part = SUB_PARTS[shortcut.partId];
    const symptom = part.symptoms.find(s => s.title === shortcut.symptomTitle);
    if (symptom) {
      setSelectedPartId(shortcut.partId);
      handleSymptomClick(shortcut.partId, symptom);
    }
  };

  const handleRestart = () => {
    setShowDisclaimer(false);
    setShowIntro(true);
    setSelectedPartId(null);
    setHoveredPartId(null);
    setSearchQuery('');
    setActiveResult(null);
    setMobilePanel(false);
  };

  // 검색 (useMemo로 최적화)
  const searchResults = useMemo(() => {
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
  }, [searchQuery]);

  return (
    <div className="h-screen w-full overflow-hidden" style={{ fontFamily: "'Noto Sans KR', sans-serif" }} lang="ko">
      <Toaster position="top-center" richColors />

      <AnimatePresence>
        {showIntro && <IntroOverlay onStart={handleIntroStart} />}
      </AnimatePresence>

      <AnimatePresence>
        {showOnboarding && <OnboardingOverlay onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

      <AnimatePresence>
        {showDisclaimer && (
          <DisclaimerModal onClose={() => setShowDisclaimer(false)} onRestart={handleRestart} />
        )}
      </AnimatePresence>

      {/* ===== 메인 레이아웃 ===== */}
      <div className="flex flex-col md:flex-row h-full w-full bg-[#F2F2F7] dark:bg-[#1C1C1E]">

        {/* ─── 데스크탑 사이드바 (md 이상) ─── */}
        <div className="hidden md:flex md:w-[420px] md:h-full md:relative md:rounded-r-[40px] md:shadow-[4px_0_40px_rgba(0,0,0,0.03)] md:z-20 bg-white dark:bg-[#2C2C2E] flex-col overflow-hidden">
          <PanelContent
            activeResult={activeResult}
            selectedPartId={selectedPartId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            setHoveredPartId={setHoveredPartId}
            setSelectedPartId={setSelectedPartId}
            handleSymptomClick={handleSymptomClick}
            handleShortcutClick={handleShortcutClick}
            setActiveResult={setActiveResult}
            setShowDisclaimer={() => setShowDisclaimer(true)}
            currentFlowStep={currentFlowStep}
            isDark={isDark}
            isMobile={false}
          />
        </div>

        {/* ─── 모바일 바텀시트 (vaul Drawer) ─── */}
        <div className="md:hidden">
          <Drawer.Root
            open={mobilePanel}
            onOpenChange={setMobilePanel}
            shouldScaleBackground={false}
          >
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/30 z-30" />
              <Drawer.Content
                className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#2C2C2E] rounded-t-[28px] flex flex-col outline-none"
                style={{ height: activeResult ? '85vh' : '60vh', transition: 'height 0.3s ease' }}
                aria-describedby={undefined}
              >
                <VisuallyHidden.Root>
                  <Drawer.Title>증상 선택 패널</Drawer.Title>
                </VisuallyHidden.Root>
                {/* 드래그 핸들 */}
                <div className="flex justify-center py-2.5 flex-shrink-0">
                  <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" aria-hidden="true" />
                </div>
                <PanelContent
                  activeResult={activeResult}
                  selectedPartId={selectedPartId}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  searchResults={searchResults}
                  setHoveredPartId={setHoveredPartId}
                  setSelectedPartId={setSelectedPartId}
                  handleSymptomClick={handleSymptomClick}
                  handleShortcutClick={handleShortcutClick}
                  setActiveResult={setActiveResult}
                  setShowDisclaimer={() => setShowDisclaimer(true)}
                  currentFlowStep={currentFlowStep}
                  isDark={isDark}
                  isMobile={true}
                />
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>

        {/* ─── 우측: 바디맵 ─── */}
        <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden min-h-0">

          {/* 모바일 상단 바: 스텝 + 타이틀 + 검색 */}
          <div className="md:hidden absolute top-0 left-0 right-0 z-20 px-5 pb-3 bg-gradient-to-b from-[#F2F2F7] dark:from-[#1C1C1E] via-[#F2F2F7]/90 dark:via-[#1C1C1E]/90 to-transparent" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
            {/* 스텝 인디케이터 */}
            {!showIntro && (
              <div className="flex justify-center mb-2.5">
                <StepIndicator currentStep={currentFlowStep} isDark={isDark} />
              </div>
            )}
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-[17px] text-gray-900 dark:text-gray-100 tracking-tight" style={{ fontWeight: 700 }}>
                오늘 어디가 불편해?
              </h2>
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
                placeholder="두통, 소화불량, 허리 등"
                className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[14px]"
                style={{ fontWeight: 500 }}
                aria-label="증상 검색"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="w-5 h-5 flex items-center justify-center bg-gray-300 dark:bg-gray-600 rounded-full text-white text-xs cursor-pointer" style={{ fontWeight: 700 }} aria-label="검색어 지우기">×</button>
              )}
            </div>
          </div>

          {/* ── 3D 바디맵 ── */}
          <BodyMap3D
            isDark={isDark}
            hoveredPartId={hoveredPartId}
            selectedPartId={selectedPartId}
            onHover={setHoveredPartId}
            onClick={handlePartClick}
          />
        </div>
      </div>
    </div>
  );
}
