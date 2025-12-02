import { Character, SourceType, TimePeriod, Trend } from '../types';

export const MOCK_CHARACTERS: Character[] = [
  {
    id: "gojo-satoru",
    rank: 1,
    name: "Gojo Satoru",
    name_jp: "五条悟",
    romaji: "Gojo Satoru",
    aliases: ["Satoru Gojo", "Six Eyes"],
    source: "Jujutsu Kaisen",
    franchise: "Jujutsu Kaisen",
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
    description: "The strongest sorcerer. His overwhelming power and relaxed personality have created a massive global fanbase, dominating fanart and social media trends consistently.",
    history: [
      { label: 'Week 47', period: TimePeriod.WEEK, scores: { pixiv: 97, ao3: 90, google_trends: 94, booru: 87, twitter: 92 }, weighted_total: 92.1 },
      { label: 'Week 48', period: TimePeriod.WEEK, scores: { pixiv: 98, ao3: 91, google_trends: 95, booru: 88, twitter: 91 }, weighted_total: 92.9 },
      { label: 'Week 49', period: TimePeriod.WEEK, scores: { pixiv: 99, ao3: 92, google_trends: 95, booru: 89, twitter: 90 }, weighted_total: 93.4 },
      { label: 'Week 50', period: TimePeriod.WEEK, scores: { pixiv: 98, ao3: 93, google_trends: 96, booru: 90, twitter: 91 }, weighted_total: 94.0 },
      { label: 'Nov 2024', period: TimePeriod.MONTH, scores: { pixiv: 96, ao3: 90, google_trends: 93, booru: 87, twitter: 90 }, weighted_total: 92.0 },
      { label: 'Dec 2024', period: TimePeriod.MONTH, scores: { pixiv: 98, ao3: 92, google_trends: 95, booru: 88, twitter: 91 }, weighted_total: 93.2 },
      { label: '2023', period: TimePeriod.YEAR, scores: { pixiv: 94, ao3: 88, google_trends: 92, booru: 84, twitter: 88 }, weighted_total: 90.4 },
      { label: '2024', period: TimePeriod.YEAR, scores: { pixiv: 98, ao3: 92, google_trends: 95, booru: 88, twitter: 90 }, weighted_total: 93.4 }
    ]
  },
  {
    id: "aventurine",
    rank: 2,
    name: "Aventurine",
    name_jp: "アベンチュリン",
    romaji: "Abenchurin",
    aliases: ["Aventurine of Stratagems"],
    source: "Honkai: Star Rail",
    franchise: "Honkai",
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
    trend: Trend.RISING,
    history: [
      { label: 'Week 47', period: TimePeriod.WEEK, scores: { pixiv: 90, ao3: 80, google_trends: 84, booru: 73, twitter: 90 }, weighted_total: 83.4 },
      { label: 'Week 48', period: TimePeriod.WEEK, scores: { pixiv: 92, ao3: 83, google_trends: 86, booru: 74, twitter: 91 }, weighted_total: 85.5 },
      { label: 'Week 49', period: TimePeriod.WEEK, scores: { pixiv: 94, ao3: 85, google_trends: 88, booru: 75, twitter: 92 }, weighted_total: 87.9 },
      { label: 'Week 50', period: TimePeriod.WEEK, scores: { pixiv: 95, ao3: 86, google_trends: 90, booru: 78, twitter: 93 }, weighted_total: 89.4 },
      { label: 'Nov 2024', period: TimePeriod.MONTH, scores: { pixiv: 92, ao3: 83, google_trends: 85, booru: 74, twitter: 91 }, weighted_total: 85.0 },
      { label: 'Dec 2024', period: TimePeriod.MONTH, scores: { pixiv: 95, ao3: 86, google_trends: 90, booru: 77, twitter: 93 }, weighted_total: 88.5 },
      { label: '2023', period: TimePeriod.YEAR, scores: { pixiv: 80, ao3: 70, google_trends: 72, booru: 60, twitter: 78 }, weighted_total: 72.0 },
      { label: '2024', period: TimePeriod.YEAR, scores: { pixiv: 95, ao3: 86, google_trends: 90, booru: 77, twitter: 92 }, weighted_total: 88.2 }
    ]
  },
  {
    id: "astarion",
    rank: 3,
    name: "Astarion Ancunin",
    name_jp: "アスタリオン",
    romaji: "Asutarion Ankannin",
    aliases: ["Astarion", "Cazador's Spawn"],
    source: "Baldur's Gate 3",
    franchise: "Baldur's Gate",
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
    trend: Trend.STABLE,
    history: [
      { label: 'Week 47', period: TimePeriod.WEEK, scores: { pixiv: 63, ao3: 97, google_trends: 78, booru: 59, twitter: 83 }, weighted_total: 79.0 },
      { label: 'Week 48', period: TimePeriod.WEEK, scores: { pixiv: 64, ao3: 98, google_trends: 79, booru: 60, twitter: 84 }, weighted_total: 80.0 },
      { label: 'Week 49', period: TimePeriod.WEEK, scores: { pixiv: 65, ao3: 99, google_trends: 80, booru: 60, twitter: 85 }, weighted_total: 81.3 },
      { label: 'Week 50', period: TimePeriod.WEEK, scores: { pixiv: 66, ao3: 99, google_trends: 81, booru: 62, twitter: 86 }, weighted_total: 82.2 },
      { label: 'Nov 2024', period: TimePeriod.MONTH, scores: { pixiv: 64, ao3: 98, google_trends: 79, booru: 60, twitter: 84 }, weighted_total: 80.1 },
      { label: 'Dec 2024', period: TimePeriod.MONTH, scores: { pixiv: 66, ao3: 99, google_trends: 81, booru: 61, twitter: 86 }, weighted_total: 82.0 },
      { label: '2023', period: TimePeriod.YEAR, scores: { pixiv: 55, ao3: 95, google_trends: 70, booru: 52, twitter: 80 }, weighted_total: 74.4 },
      { label: '2024', period: TimePeriod.YEAR, scores: { pixiv: 66, ao3: 99, google_trends: 81, booru: 61, twitter: 86 }, weighted_total: 82.0 }
    ]
  },
  {
    id: "toji-fushiguro",
    rank: 4,
    name: "Toji Fushiguro",
    name_jp: "伏黒甚爾",
    romaji: "Fushiguro Toji",
    aliases: ["Toji Zenin", "Sorcerer Killer"],
    source: "Jujutsu Kaisen",
    franchise: "Jujutsu Kaisen",
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
    trend: Trend.FALLING,
    history: [
      { label: 'Week 47', period: TimePeriod.WEEK, scores: { pixiv: 88, ao3: 80, google_trends: 85, booru: 92, twitter: 78 }, weighted_total: 84.6 },
      { label: 'Week 48', period: TimePeriod.WEEK, scores: { pixiv: 87, ao3: 79, google_trends: 83, booru: 91, twitter: 77 }, weighted_total: 83.4 },
      { label: 'Week 49', period: TimePeriod.WEEK, scores: { pixiv: 85, ao3: 78, google_trends: 82, booru: 90, twitter: 75 }, weighted_total: 81.0 },
      { label: 'Week 50', period: TimePeriod.WEEK, scores: { pixiv: 83, ao3: 76, google_trends: 80, booru: 89, twitter: 74 }, weighted_total: 79.0 },
      { label: 'Nov 2024', period: TimePeriod.MONTH, scores: { pixiv: 87, ao3: 79, google_trends: 83, booru: 91, twitter: 77 }, weighted_total: 83.2 },
      { label: 'Dec 2024', period: TimePeriod.MONTH, scores: { pixiv: 84, ao3: 77, google_trends: 81, booru: 89, twitter: 75 }, weighted_total: 80.4 },
      { label: '2023', period: TimePeriod.YEAR, scores: { pixiv: 82, ao3: 72, google_trends: 78, booru: 86, twitter: 70 }, weighted_total: 76.6 },
      { label: '2024', period: TimePeriod.YEAR, scores: { pixiv: 84, ao3: 77, google_trends: 81, booru: 89, twitter: 75 }, weighted_total: 80.4 }
    ]
  },
  {
    id: "alhaitham",
    rank: 5,
    name: "Alhaitham",
    name_jp: "アルハイゼン",
    romaji: "Aruhaizen",
    aliases: ["Scribe", "Akademiya Scribe"],
    source: "Genshin Impact",
    franchise: "Genshin Impact",
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
    trend: Trend.STABLE,
    history: [
      { label: 'Week 47', period: TimePeriod.WEEK, scores: { pixiv: 87, ao3: 74, google_trends: 64, booru: 79, twitter: 70 }, weighted_total: 76.8 },
      { label: 'Week 48', period: TimePeriod.WEEK, scores: { pixiv: 88, ao3: 75, google_trends: 65, booru: 80, twitter: 70 }, weighted_total: 77.2 },
      { label: 'Week 49', period: TimePeriod.WEEK, scores: { pixiv: 89, ao3: 75, google_trends: 66, booru: 81, twitter: 71 }, weighted_total: 78.0 },
      { label: 'Week 50', period: TimePeriod.WEEK, scores: { pixiv: 88, ao3: 76, google_trends: 65, booru: 82, twitter: 71 }, weighted_total: 77.8 },
      { label: 'Nov 2024', period: TimePeriod.MONTH, scores: { pixiv: 88, ao3: 75, google_trends: 65, booru: 81, twitter: 70 }, weighted_total: 77.4 },
      { label: 'Dec 2024', period: TimePeriod.MONTH, scores: { pixiv: 89, ao3: 76, google_trends: 66, booru: 82, twitter: 72 }, weighted_total: 78.3 },
      { label: '2023', period: TimePeriod.YEAR, scores: { pixiv: 85, ao3: 70, google_trends: 60, booru: 78, twitter: 68 }, weighted_total: 73.8 },
      { label: '2024', period: TimePeriod.YEAR, scores: { pixiv: 89, ao3: 76, google_trends: 66, booru: 82, twitter: 72 }, weighted_total: 78.3 }
    ]
  },
  {
    id: "levi-ackerman",
    rank: 6,
    name: "Levi Ackerman",
    name_jp: "リヴァイ",
    romaji: "Rivai Akkaman",
    aliases: ["Captain Levi", "Humanity's Strongest"],
    source: "Attack on Titan",
    franchise: "Attack on Titan",
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
    trend: Trend.FALLING,
    history: [
      { label: 'Week 47', period: TimePeriod.WEEK, scores: { pixiv: 92, ao3: 67, google_trends: 62, booru: 86, twitter: 62 }, weighted_total: 75.8 },
      { label: 'Week 48', period: TimePeriod.WEEK, scores: { pixiv: 91, ao3: 66, google_trends: 61, booru: 86, twitter: 61 }, weighted_total: 74.9 },
      { label: 'Week 49', period: TimePeriod.WEEK, scores: { pixiv: 90, ao3: 65, google_trends: 60, booru: 85, twitter: 60 }, weighted_total: 74.0 },
      { label: 'Week 50', period: TimePeriod.WEEK, scores: { pixiv: 89, ao3: 65, google_trends: 59, booru: 84, twitter: 60 }, weighted_total: 73.4 },
      { label: 'Nov 2024', period: TimePeriod.MONTH, scores: { pixiv: 91, ao3: 66, google_trends: 61, booru: 85, twitter: 61 }, weighted_total: 74.9 },
      { label: 'Dec 2024', period: TimePeriod.MONTH, scores: { pixiv: 89, ao3: 65, google_trends: 59, booru: 84, twitter: 60 }, weighted_total: 73.4 },
      { label: '2023', period: TimePeriod.YEAR, scores: { pixiv: 87, ao3: 60, google_trends: 58, booru: 82, twitter: 58 }, weighted_total: 69.5 },
      { label: '2024', period: TimePeriod.YEAR, scores: { pixiv: 89, ao3: 65, google_trends: 59, booru: 84, twitter: 60 }, weighted_total: 73.4 }
    ]
  },
  {
    id: "zhongli",
    rank: 7,
    name: "Zhongli",
    name_jp: "鍾離",
    romaji: "Shouri",
    aliases: ["Morax", "Rex Lapis"],
    source: "Genshin Impact",
    franchise: "Genshin Impact",
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
    trend: Trend.STABLE,
    history: [
      { label: 'Week 47', period: TimePeriod.WEEK, scores: { pixiv: 79, ao3: 69, google_trends: 54, booru: 74, twitter: 65 }, weighted_total: 69.2 },
      { label: 'Week 48', period: TimePeriod.WEEK, scores: { pixiv: 80, ao3: 70, google_trends: 55, booru: 75, twitter: 65 }, weighted_total: 70.3 },
      { label: 'Week 49', period: TimePeriod.WEEK, scores: { pixiv: 81, ao3: 70, google_trends: 56, booru: 76, twitter: 66 }, weighted_total: 71.0 },
      { label: 'Week 50', period: TimePeriod.WEEK, scores: { pixiv: 80, ao3: 71, google_trends: 55, booru: 77, twitter: 66 }, weighted_total: 70.8 },
      { label: 'Nov 2024', period: TimePeriod.MONTH, scores: { pixiv: 80, ao3: 70, google_trends: 55, booru: 76, twitter: 65 }, weighted_total: 70.4 },
      { label: 'Dec 2024', period: TimePeriod.MONTH, scores: { pixiv: 81, ao3: 71, google_trends: 56, booru: 77, twitter: 66 }, weighted_total: 71.2 },
      { label: '2023', period: TimePeriod.YEAR, scores: { pixiv: 78, ao3: 66, google_trends: 52, booru: 73, twitter: 63 }, weighted_total: 67.6 },
      { label: '2024', period: TimePeriod.YEAR, scores: { pixiv: 81, ao3: 71, google_trends: 56, booru: 77, twitter: 66 }, weighted_total: 71.2 }
    ]
  },
  {
    id: "guts",
    rank: 8,
    name: "Guts",
    name_jp: "ガッツ",
    romaji: "Gattsu",
    aliases: ["Black Swordsman"],
    source: "Berserk",
    franchise: "Berserk",
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
    trend: Trend.RISING,
    history: [
      { label: 'Week 47', period: TimePeriod.WEEK, scores: { pixiv: 58, ao3: 38, google_trends: 84, booru: 69, twitter: 78 }, weighted_total: 62.0 },
      { label: 'Week 48', period: TimePeriod.WEEK, scores: { pixiv: 59, ao3: 39, google_trends: 84, booru: 70, twitter: 79 }, weighted_total: 63.0 },
      { label: 'Week 49', period: TimePeriod.WEEK, scores: { pixiv: 60, ao3: 40, google_trends: 85, booru: 70, twitter: 80 }, weighted_total: 64.5 },
      { label: 'Week 50', period: TimePeriod.WEEK, scores: { pixiv: 62, ao3: 42, google_trends: 86, booru: 72, twitter: 82 }, weighted_total: 66.8 },
      { label: 'Nov 2024', period: TimePeriod.MONTH, scores: { pixiv: 60, ao3: 40, google_trends: 84, booru: 70, twitter: 80 }, weighted_total: 64.4 },
      { label: 'Dec 2024', period: TimePeriod.MONTH, scores: { pixiv: 62, ao3: 42, google_trends: 86, booru: 72, twitter: 82 }, weighted_total: 66.8 },
      { label: '2023', period: TimePeriod.YEAR, scores: { pixiv: 55, ao3: 35, google_trends: 78, booru: 68, twitter: 75 }, weighted_total: 58.2 },
      { label: '2024', period: TimePeriod.YEAR, scores: { pixiv: 62, ao3: 42, google_trends: 86, booru: 72, twitter: 82 }, weighted_total: 66.8 }
    ]
  },
  {
    id: "leon-kennedy",
    rank: 9,
    name: "Leon S. Kennedy",
    name_jp: "レオン・S・ケネディ",
    romaji: "Reon Esu Kenedi",
    aliases: ["Leon Kennedy", "Agent Kennedy"],
    source: "Resident Evil",
    franchise: "Resident Evil",
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
    trend: Trend.RISING,
    history: [
      { label: 'Week 47', period: TimePeriod.WEEK, scores: { pixiv: 53, ao3: 58, google_trends: 74, booru: 64, twitter: 69 }, weighted_total: 61.6 },
      { label: 'Week 48', period: TimePeriod.WEEK, scores: { pixiv: 54, ao3: 59, google_trends: 74, booru: 64, twitter: 69 }, weighted_total: 62.0 },
      { label: 'Week 49', period: TimePeriod.WEEK, scores: { pixiv: 55, ao3: 60, google_trends: 75, booru: 65, twitter: 70 }, weighted_total: 63.3 },
      { label: 'Week 50', period: TimePeriod.WEEK, scores: { pixiv: 56, ao3: 61, google_trends: 76, booru: 66, twitter: 71 }, weighted_total: 64.5 },
      { label: 'Nov 2024', period: TimePeriod.MONTH, scores: { pixiv: 54, ao3: 59, google_trends: 74, booru: 64, twitter: 69 }, weighted_total: 62.0 },
      { label: 'Dec 2024', period: TimePeriod.MONTH, scores: { pixiv: 56, ao3: 61, google_trends: 76, booru: 66, twitter: 71 }, weighted_total: 64.5 },
      { label: '2023', period: TimePeriod.YEAR, scores: { pixiv: 50, ao3: 55, google_trends: 72, booru: 60, twitter: 66 }, weighted_total: 59.2 },
      { label: '2024', period: TimePeriod.YEAR, scores: { pixiv: 56, ao3: 61, google_trends: 76, booru: 66, twitter: 71 }, weighted_total: 64.5 }
    ]
  },
  {
    id: "geto-suguru",
    rank: 10,
    name: "Geto Suguru",
    name_jp: "夏油傑",
    romaji: "Geto Suguru",
    aliases: ["Suguru Geto", "Pseudo-Geto"],
    source: "Jujutsu Kaisen",
    franchise: "Jujutsu Kaisen",
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
    trend: Trend.FALLING,
    history: [
      { label: 'Week 47', period: TimePeriod.WEEK, scores: { pixiv: 72, ao3: 82, google_trends: 52, booru: 62, twitter: 57 }, weighted_total: 67.3 },
      { label: 'Week 48', period: TimePeriod.WEEK, scores: { pixiv: 71, ao3: 81, google_trends: 51, booru: 61, twitter: 56 }, weighted_total: 66.4 },
      { label: 'Week 49', period: TimePeriod.WEEK, scores: { pixiv: 70, ao3: 80, google_trends: 50, booru: 60, twitter: 55 }, weighted_total: 65.5 },
      { label: 'Week 50', period: TimePeriod.WEEK, scores: { pixiv: 69, ao3: 79, google_trends: 49, booru: 59, twitter: 54 }, weighted_total: 64.2 },
      { label: 'Nov 2024', period: TimePeriod.MONTH, scores: { pixiv: 71, ao3: 81, google_trends: 51, booru: 61, twitter: 56 }, weighted_total: 66.4 },
      { label: 'Dec 2024', period: TimePeriod.MONTH, scores: { pixiv: 69, ao3: 79, google_trends: 49, booru: 59, twitter: 54 }, weighted_total: 64.2 },
      { label: '2023', period: TimePeriod.YEAR, scores: { pixiv: 68, ao3: 75, google_trends: 50, booru: 58, twitter: 52 }, weighted_total: 62.6 },
      { label: '2024', period: TimePeriod.YEAR, scores: { pixiv: 69, ao3: 79, google_trends: 49, booru: 59, twitter: 54 }, weighted_total: 64.2 }
    ]
  }
];
