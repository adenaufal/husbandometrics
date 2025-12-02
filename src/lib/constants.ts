import { Character, SourceType, Trend } from '../types';

export const MOCK_CHARACTERS: Character[] = [
  {
    id: "gojo-satoru",
    rank: 1,
    name: "Gojo Satoru",
    name_jp: "五条悟",
    source: "Jujutsu Kaisen",
    source_type: SourceType.ANIME,
    image_url: "https://picsum.photos/seed/gojo/200/200",
    scores: {
      pixiv: 98,
      ao3: 92,
      google_trends: 95,
      booru: 88,
      twitter: 90
    },
    weighted_total: 93.4,
    trend: Trend.STABLE,
    description: "The strongest sorcerer. His overwhelming power and relaxed personality have created a massive global fanbase, dominating fanart and social media trends consistently."
  },
  {
    id: "aventurine",
    rank: 2,
    name: "Aventurine",
    name_jp: "アベンチュリン",
    source: "Honkai: Star Rail",
    source_type: SourceType.GAME,
    image_url: "https://picsum.photos/seed/aventurine/200/200",
    scores: {
      pixiv: 94,
      ao3: 85,
      google_trends: 88,
      booru: 75,
      twitter: 92
    },
    weighted_total: 87.9,
    trend: Trend.RISING
  },
  {
    id: "astarion",
    rank: 3,
    name: "Astarion Ancunin",
    name_jp: "アスタリオン",
    source: "Baldur's Gate 3",
    source_type: SourceType.GAME,
    image_url: "https://picsum.photos/seed/astarion/200/200",
    scores: {
      pixiv: 65,
      ao3: 99,
      google_trends: 80,
      booru: 60,
      twitter: 85
    },
    weighted_total: 81.3,
    trend: Trend.STABLE
  },
  {
    id: "toji-fushiguro",
    rank: 4,
    name: "Toji Fushiguro",
    name_jp: "伏黒甚爾",
    source: "Jujutsu Kaisen",
    source_type: SourceType.ANIME,
    image_url: "https://picsum.photos/seed/toji/200/200",
    scores: {
      pixiv: 85,
      ao3: 78,
      google_trends: 82,
      booru: 90,
      twitter: 75
    },
    weighted_total: 81.0,
    trend: Trend.FALLING
  },
  {
    id: "alhaitham",
    rank: 5,
    name: "Alhaitham",
    name_jp: "アルハイゼン",
    source: "Genshin Impact",
    source_type: SourceType.GAME,
    image_url: "https://picsum.photos/seed/alhaitham/200/200",
    scores: {
      pixiv: 88,
      ao3: 75,
      google_trends: 65,
      booru: 80,
      twitter: 70
    },
    weighted_total: 77.2,
    trend: Trend.STABLE
  },
  {
    id: "levi-ackerman",
    rank: 6,
    name: "Levi Ackerman",
    name_jp: "リヴァイ",
    source: "Attack on Titan",
    source_type: SourceType.ANIME,
    image_url: "https://picsum.photos/seed/levi/200/200",
    scores: {
      pixiv: 90,
      ao3: 65,
      google_trends: 60,
      booru: 85,
      twitter: 60
    },
    weighted_total: 74.0,
    trend: Trend.FALLING
  },
  {
    id: "zhongli",
    rank: 7,
    name: "Zhongli",
    name_jp: "鍾離",
    source: "Genshin Impact",
    source_type: SourceType.GAME,
    image_url: "https://picsum.photos/seed/zhongli/200/200",
    scores: {
      pixiv: 80,
      ao3: 70,
      google_trends: 55,
      booru: 75,
      twitter: 65
    },
    weighted_total: 70.3,
    trend: Trend.STABLE
  },
  {
    id: "guts",
    rank: 8,
    name: "Guts",
    name_jp: "ガッツ",
    source: "Berserk",
    source_type: SourceType.MANGA,
    image_url: "https://picsum.photos/seed/guts/200/200",
    scores: {
      pixiv: 60,
      ao3: 40,
      google_trends: 85,
      booru: 70,
      twitter: 80
    },
    weighted_total: 64.5,
    trend: Trend.RISING
  },
  {
    id: "leon-kennedy",
    rank: 9,
    name: "Leon S. Kennedy",
    name_jp: "レオン・S・ケネディ",
    source: "Resident Evil",
    source_type: SourceType.GAME,
    image_url: "https://picsum.photos/seed/leon/200/200",
    scores: {
      pixiv: 55,
      ao3: 60,
      google_trends: 75,
      booru: 65,
      twitter: 70
    },
    weighted_total: 63.3,
    trend: Trend.RISING
  },
  {
    id: "geto-suguru",
    rank: 10,
    name: "Geto Suguru",
    name_jp: "夏油傑",
    source: "Jujutsu Kaisen",
    source_type: SourceType.ANIME,
    image_url: "https://picsum.photos/seed/geto/200/200",
    scores: {
      pixiv: 70,
      ao3: 80,
      google_trends: 50,
      booru: 60,
      twitter: 55
    },
    weighted_total: 65.5,
    trend: Trend.FALLING
  }
];
