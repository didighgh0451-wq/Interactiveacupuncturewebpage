export interface Symptom {
  id: string;
  title: string;
  emoji: string;
}

export interface AcupressurePoint {
  name: string;
  location: string;
  method: string;
  duration: string;
  repetitions: string;
  effects: string[];
}

export interface BodyPart {
  id: string;
  label: string;
  emoji: string;
  symptoms: Symptom[];
}

export interface PointResult {
  symptomId: string;
  point: AcupressurePoint;
}

export const BODY_PARTS: BodyPart[] = [
  {
    id: 'head',
    label: '머리',
    emoji: '🧠',
    symptoms: [
      { id: 'headache', title: '두통', emoji: '😣' },
      { id: 'focus', title: '집중력 저하', emoji: '😶‍🌫️' },
      { id: 'dizzy', title: '어지러움', emoji: '😵‍💫' },
    ],
  },
  {
    id: 'eyes',
    label: '눈',
    emoji: '👁️',
    symptoms: [
      { id: 'eye-fatigue', title: '눈 피로', emoji: '😩' },
      { id: 'blurry', title: '시야 흐림', emoji: '🌫️' },
      { id: 'dry-eyes', title: '눈 건조', emoji: '💧' },
    ],
  },
  {
    id: 'neck-shoulder',
    label: '목/어깨',
    emoji: '💪',
    symptoms: [
      { id: 'stiff-neck', title: '목 뻣뻣', emoji: '😖' },
      { id: 'shoulder-pain', title: '어깨 결림', emoji: '🤕' },
      { id: 'turtle-neck', title: '거북목 통증', emoji: '🐢' },
    ],
  },
  {
    id: 'stomach',
    label: '배',
    emoji: '🫄',
    symptoms: [
      { id: 'indigestion', title: '소화불량', emoji: '🤢' },
      { id: 'bloating', title: '복부 팽만감', emoji: '🎈' },
      { id: 'period-pain', title: '생리통', emoji: '😰' },
    ],
  },
  {
    id: 'hands',
    label: '손',
    emoji: '🤲',
    symptoms: [
      { id: 'cold-hands', title: '수족냉증', emoji: '🥶' },
      { id: 'wrist-pain', title: '손목 통증', emoji: '⌨️' },
      { id: 'numbness', title: '손 저림', emoji: '🫳' },
    ],
  },
  {
    id: 'back',
    label: '허리',
    emoji: '🦴',
    symptoms: [
      { id: 'back-pain', title: '허리 통증', emoji: '😫' },
      { id: 'chronic-fatigue', title: '만성 피로', emoji: '😴' },
      { id: 'posture', title: '자세 불균형', emoji: '🧍' },
    ],
  },
  {
    id: 'legs',
    label: '다리',
    emoji: '🦵',
    symptoms: [
      { id: 'leg-swelling', title: '다리 부종', emoji: '🦶' },
      { id: 'leg-cramp', title: '다리 쥐남', emoji: '⚡' },
      { id: 'insomnia', title: '불면증', emoji: '🌙' },
    ],
  },
];

export const POINT_RESULTS: Record<string, AcupressurePoint> = {
  headache: {
    name: '백회혈 (百會穴)',
    location: '정수리 꼭대기, 양쪽 귀를 연결하는 선과 코에서 뒤통수로 넘어가는 선이 만나는 점',
    method: '검지와 중지로 부드럽게 원을 그리며 지압합니다. 숨을 내쉬면서 천천히 눌러주세요.',
    duration: '3~5초간 누르고 2초 쉬기',
    repetitions: '10~15회 반복',
    effects: ['긴장성 두통 완화', '스트레스 해소', '정신 맑아짐', '혈액순환 촉진'],
  },
  focus: {
    name: '신정혈 (神庭穴)',
    location: '이마 중앙, 앞 머리카락이 시작되는 지점에서 약 0.5촌(약 1cm) 위',
    method: '엄지로 가볍게 누르면서 위아래로 문질러줍니다.',
    duration: '5초간 누르기',
    repetitions: '15~20회 반복',
    effects: ['집중력 향상', '머리 맑아짐', '기억력 개선', '정신 안정'],
  },
  dizzy: {
    name: '풍지혈 (風池穴)',
    location: '뒷머리 아래, 목 뒤 양쪽 움푹 들어간 부분 (후두부 아래 좌우 오목한 곳)',
    method: '양쪽 엄지로 두개골 방향(위쪽)으로 눌러줍니다.',
    duration: '5~7초간 지속 압박',
    repetitions: '8~10회 반복',
    effects: ['어지러움 완화', '두통 해소', '목 뒤 긴장 해소', '혈액순환 촉진'],
  },
  'eye-fatigue': {
    name: '찬죽혈 (攢竹穴)',
    location: '눈썹 안쪽 끝, 눈썹이 시작되는 지점의 움푹 파인 곳',
    method: '엄지 끝으로 눈썹 안쪽을 부드럽게 눌러줍니다. 눈을 감고 시행하세요.',
    duration: '3~5초간 누르기',
    repetitions: '10~15회 반복',
    effects: ['눈 피로 해소', '시력 보호', '눈 주변 혈액순환', '두통 완화'],
  },
  blurry: {
    name: '정명혈 (睛明穴)',
    location: '눈 안쪽 모서리(눈시울)와 콧등 사이의 움푹 파인 곳',
    method: '엄지와 검지로 양쪽 정명혈을 동시에 집어 누르듯 지압합니다.',
    duration: '3초간 누르고 3초 쉬기',
    repetitions: '10회 반복',
    effects: ['시야 개선', '눈 충혈 완화', '눈물 분비 촉진', '안구 피로 해소'],
  },
  'dry-eyes': {
    name: '사백혈 (四白穴)',
    location: '눈동자 바로 아래, 눈 아래뼈(하안와연) 가장자리에서 약 1cm 아래',
    method: '검지로 부드럽게 원을 그리며 마사지합니다.',
    duration: '3~5초간 누르기',
    repetitions: '12~15회 반복',
    effects: ['눈 건조 개선', '눈가 혈행 촉진', '안면 피로 해소', '눈 밑 다크서클 완화'],
  },
  'stiff-neck': {
    name: '천주혈 (天柱穴)',
    location: '뒷목 중앙의 두꺼운 근육(승모근) 바깥쪽, 머리카락이 시작되는 부분',
    method: '양손 엄지를 목 뒤에 대고 위쪽으로 밀어 올리듯 눌러줍니다.',
    duration: '5초간 누르고 3초 쉬기',
    repetitions: '10~12회 반복',
    effects: ['목 뻣뻣함 완화', '뒷목 통증 해소', '두통 완화', '혈액순환 개선'],
  },
  'shoulder-pain': {
    name: '견정혈 (肩井穴)',
    location: '목과 어깨 끝의 중간 지점, 어깨 위쪽의 가장 높은 곳',
    method: '반대편 손의 중지로 어깨 위를 강하게 누릅니다.',
    duration: '5~7초간 누르기',
    repetitions: '8~10회 반복 (양쪽)',
    effects: ['어깨 결림 해소', '어깨 통증 완화', '상체 혈액순환', '스트레스 해소'],
  },
  'turtle-neck': {
    name: '대추혈 (大椎穴)',
    location: '고개를 숙였을 때 목 뒤에 가장 많이 튀어나오는 뼈(제7경추) 바로 아래',
    method: '검지와 중지로 뼈 아래를 부드럽게 원형으로 문질러줍니다.',
    duration: '5초간 누르기',
    repetitions: '10~15회 반복',
    effects: ['거북목 통증 완화', '목 유연성 회복', '등 상부 통증 완화', '기혈 순환 촉진'],
  },
  indigestion: {
    name: '중완혈 (中脘穴)',
    location: '배꼽과 명치(갈비뼈 아래 움푹한 곳)의 정중앙',
    method: '손바닥으로 시계 방향으로 부드럽게 문질러줍니다.',
    duration: '5~10초간 부드럽게 누르기',
    repetitions: '15~20회 반복',
    effects: ['소화 촉진', '위장 기능 강화', '속쓰림 완화', '복부 불쾌감 해소'],
  },
  bloating: {
    name: '천추혈 (天樞穴)',
    location: '배꼽 양쪽으로 손가락 세 마디(약 5cm) 떨어진 곳',
    method: '양쪽을 동시에 검지와 중지로 부드럽게 눌러줍니다.',
    duration: '5초간 누르고 3초 쉬기',
    repetitions: '10~15회 반복',
    effects: ['복부 팽만감 해소', '장 운동 촉진', '변비 개선', '복부 가스 배출'],
  },
  'period-pain': {
    name: '관원혈 (關元穴)',
    location: '배꼽에서 아래로 손가락 네 마디(약 7cm) 떨어진 하복부',
    method: '손바닥을 대고 따뜻하게 감싸면서 부드럽게 시계 방향으로 누릅니다.',
    duration: '7~10초간 지속 압박',
    repetitions: '10~15회 반복',
    effects: ['생리통 완화', '하복부 냉증 개선', '자궁 건강', '기력 회복'],
  },
  'cold-hands': {
    name: '노궁혈 (勞宮穴)',
    location: '손바닥 한가운데, 주먹을 쥘 때 중지 끝이 닿는 지점',
    method: '반대쪽 엄지로 손바닥 중앙을 꾹 눌러줍니다.',
    duration: '3~5초간 누르기',
    repetitions: '15~20회 반복 (양손)',
    effects: ['수족냉증 개선', '손 혈액순환 촉진', '긴장 완화', '마음 안정'],
  },
  'wrist-pain': {
    name: '대릉혈 (大陵穴)',
    location: '손목 안쪽 가로 주름의 정중앙',
    method: '반대쪽 엄지로 손목 주름 중앙을 부드럽게 눌러줍니다.',
    duration: '5초간 누르기',
    repetitions: '10~12회 반복 (양쪽)',
    effects: ['손목 통증 완화', '손목 터널 증후군 예방', '상지 혈행 촉진', '긴장 해소'],
  },
  numbness: {
    name: '합곡혈 (合谷穴)',
    location: '엄지와 검지 사이 물갈퀴 부분, 제2 중수골 중간의 움푹 파인 곳',
    method: '반대 손 엄지와 검지로 합곡혈을 잡고 강하게 눌러줍니다.',
    duration: '5~7초간 누르기',
    repetitions: '10~15회 반복 (양손)',
    effects: ['손 저림 완화', '만병통치혈', '두통·치통 완화', '면역력 강화'],
  },
  'back-pain': {
    name: '신수혈 (腎兪穴)',
    location: '허리 뒤쪽, 배꼽 높이에서 척추 양쪽으로 손가락 두 마디(약 3cm) 떨어진 곳',
    method: '양쪽 엄지를 허리에 대고 안쪽으로 원형 마사지합니다. 따뜻한 손으로 하면 더 좋습니다.',
    duration: '5~7초간 누르기',
    repetitions: '10~15회 반복',
    effects: ['허리 통증 완화', '신장 기능 강화', '하체 피로 해소', '원기 회복'],
  },
  'chronic-fatigue': {
    name: '명문혈 (命門穴)',
    location: '허리 뒤쪽 정중앙, 배꼽과 같은 높이의 척추(제2요추) 사이',
    method: '양손을 포갠 후 손바닥으로 따뜻하게 감싸며 문질러줍니다.',
    duration: '7~10초간 지속 압박',
    repetitions: '10~12회 반복',
    effects: ['만성 피로 회복', '양기 보충', '허리 강화', '전신 활력 증진'],
  },
  posture: {
    name: '위중혈 (委中穴)',
    location: '무릎 뒤쪽 오금(무릎 접히는 부분)의 정중앙',
    method: '앉아서 무릎을 살짝 구부린 채 엄지로 오금 중앙을 눌러줍니다.',
    duration: '5초간 누르기',
    repetitions: '10~15회 반복 (양쪽)',
    effects: ['허리·등 통증 완화', '자세 교정 보조', '하체 혈행 촉진', '근육 이완'],
  },
  'leg-swelling': {
    name: '승산혈 (承山穴)',
    location: '종아리 뒤쪽 중간, 까치발을 들었을 때 종아리 근육이 갈라지는 V자 지점',
    method: '엄지로 종아리 V자 부분을 천천히 강하게 눌러줍니다.',
    duration: '5~7초간 누르기',
    repetitions: '10~15회 반복 (양쪽)',
    effects: ['다리 부종 완화', '종아리 피로 해소', '혈액순환 촉진', '하체 무거움 해소'],
  },
  'leg-cramp': {
    name: '족삼리혈 (足三里穴)',
    location: '무릎뼈 바깥쪽 아래 움푹 파인 곳에서 손가락 네 마디(약 7cm) 아래',
    method: '엄지로 정강이 바깥쪽을 세게 눌러줍니다.',
    duration: '5~7초간 누르기',
    repetitions: '10~15회 반복 (양쪽)',
    effects: ['다리 경련 완화', '소화 기능 강화', '체력 증진', '면역력 향상'],
  },
  insomnia: {
    name: '태충혈 (太衝穴)',
    location: '발등, 엄지발가락과 둘째 발가락 사이 뼈가 만나는 움푹 파인 곳',
    method: '엄지로 발등의 V자 뼈 사이를 눌러줍니다. 취침 전에 하면 효과적입니다.',
    duration: '3~5초간 누르기',
    repetitions: '15~20회 반복 (양쪽)',
    effects: ['불면증 개선', '스트레스 해소', '간 기능 안정', '마음 안정·이완'],
  },
};
