import React, { createContext, useContext, useMemo } from 'react';

export type SupportedLanguage = 'en' | 'jp' | 'kr' | 'cn';

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  jp: '日本語',
  kr: '한국어',
  cn: '中文',
};

const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    currentCharts: 'Current Charts',
    globalAggregation: 'Global aggregation from Pixiv, AO3 & Socials',
    searchPlaceholder: 'Search ID or franchise...',
    resetSystem: 'Reset System',
    noMatches: 'No Matches Found',
    filter: 'Filter',
    hot: 'Hot',
    score: 'Score',
    totalScore: 'Total Score',
    currentTrend: 'Current Trend',
    radarAnalysis: 'Radar Analysis',
    aiObservations: 'AI Observations',
    writing: 'Writing...',
    update: 'Update',
    exportTitle: 'Exports',
    exportCsv: 'CSV',
    exportJson: 'JSON',
    developerApi: 'Developer API',
    apiDocs: 'Docs',
    requestTitle: 'Character Requests',
    requestHelper: 'Submit names you want tracked next.',
    requestPlaceholder: 'Character & franchise (e.g., Jingliu — Honkai SR)',
    addRequest: 'Add Request',
    integrations: 'MAL/AniList Integrations',
    integrationSync: 'Sync Now',
    lightMode: 'Light',
    darkMode: 'Dark',
    language: 'Language',
  },
  jp: {
    currentCharts: '最新ランキング',
    globalAggregation: 'Pixiv・AO3・SNSの集計データ',
    searchPlaceholder: 'ID または作品名を検索...',
    resetSystem: 'リセット',
    noMatches: '該当なし',
    filter: 'フィルター',
    hot: '急上昇',
    score: 'スコア',
    totalScore: '総合スコア',
    currentTrend: 'トレンド',
    radarAnalysis: 'レーダー分析',
    aiObservations: 'AI所見',
    writing: '作成中...',
    update: '更新',
    exportTitle: 'エクスポート',
    exportCsv: 'CSV',
    exportJson: 'JSON',
    developerApi: '開発者API',
    apiDocs: 'ドキュメント',
    requestTitle: 'キャラ追加リクエスト',
    requestHelper: '次に追跡してほしいキャラを投稿してください。',
    requestPlaceholder: 'キャラ名・作品名 (例: 景リュウ — スタレ)',
    addRequest: '追加',
    integrations: 'MAL/AniList 連携',
    integrationSync: '同期',
    lightMode: 'ライト',
    darkMode: 'ダーク',
    language: '言語',
  },
  kr: {
    currentCharts: '현재 차트',
    globalAggregation: 'Pixiv / AO3 / SNS 데이터 집계',
    searchPlaceholder: 'ID 또는 작품 검색...',
    resetSystem: '초기화',
    noMatches: '결과 없음',
    filter: '필터',
    hot: '인기',
    score: '점수',
    totalScore: '총점',
    currentTrend: '트렌드',
    radarAnalysis: '레이더 분석',
    aiObservations: 'AI 분석',
    writing: '작성 중...',
    update: '업데이트',
    exportTitle: '내보내기',
    exportCsv: 'CSV',
    exportJson: 'JSON',
    developerApi: '개발자 API',
    apiDocs: '문서',
    requestTitle: '캐릭터 요청',
    requestHelper: '다음에 추적할 캐릭터를 알려주세요.',
    requestPlaceholder: '캐릭터 / 작품 (예: 정려 — 스타레)',
    addRequest: '추가',
    integrations: 'MAL/AniList 연동',
    integrationSync: '동기화',
    lightMode: '라이트',
    darkMode: '다크',
    language: '언어',
  },
  cn: {
    currentCharts: '当前榜单',
    globalAggregation: '汇总自 Pixiv、AO3 和社交平台的数据',
    searchPlaceholder: '搜索ID或作品...',
    resetSystem: '重置',
    noMatches: '没有匹配结果',
    filter: '筛选',
    hot: '热度',
    score: '分数',
    totalScore: '总分',
    currentTrend: '趋势',
    radarAnalysis: '雷达分析',
    aiObservations: 'AI 观察',
    writing: '生成中...',
    update: '更新',
    exportTitle: '导出',
    exportCsv: 'CSV',
    exportJson: 'JSON',
    developerApi: '开发者 API',
    apiDocs: '文档',
    requestTitle: '角色请求',
    requestHelper: '提交你想追踪的下一位角色。',
    requestPlaceholder: '角色与作品（如 景琉 — 星铁）',
    addRequest: '添加',
    integrations: 'MAL/AniList 集成',
    integrationSync: '同步',
    lightMode: '亮色',
    darkMode: '暗色',
    language: '语言',
  },
};

interface TranslationContextValue {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => translations.en[key] ?? key,
});

interface TranslationProviderProps {
  language: SupportedLanguage;
  onChangeLanguage: (language: SupportedLanguage) => void;
  children: React.ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({
  language,
  onChangeLanguage,
  children,
}) => {
  const value = useMemo<TranslationContextValue>(() => ({
    language,
    setLanguage: onChangeLanguage,
    t: (key: string) => translations[language]?.[key] ?? translations.en[key] ?? key,
  }), [language, onChangeLanguage]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);
