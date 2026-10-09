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
    updated: 'Updated',
    methodology: 'Methodology',
    close: 'Close',

    score: 'Score',
    scoreRange: 'Score',
    period: 'Period',
    clearFilters: 'Clear filters',
    exportCsv: 'Export CSV',

    emptyTitle: 'Nothing matches those filters',
    measuring: 'Reading live sources',
    measuringHint: 'The first read queries four sources for every character.',
    apiDownTitle: 'Rankings unavailable',
    apiDownBody: 'The measurement API could not be reached. Nothing is shown rather than sample data.',
    retry: 'Retry',
    retrying: 'Retrying',

    breakdown: 'Score breakdown',
    rawFigure: 'Raw figure',
    totalScore: 'Total score',
    notMeasured: 'Not measured',
    measuredBy: 'Measured by',
    noHistoryTitle: 'No history yet',
    noHistoryHint: 'Snapshots appear here after the first scheduled refresh.',

    language: 'Language',
  },

  jp: {
    updated: '更新',
    methodology: '算出方法',
    close: '閉じる',

    score: 'スコア',
    scoreRange: 'スコア',
    period: '期間',
    clearFilters: '条件をクリア',
    exportCsv: 'CSV 出力',

    emptyTitle: '条件に一致するキャラクターがいません',
    measuring: 'ライブデータを取得中',
    measuringHint: '初回は各キャラクターについて4つの情報源に問い合わせます。',
    apiDownTitle: 'ランキングを取得できません',
    apiDownBody: '計測APIに接続できませんでした。サンプルデータの代わりに何も表示しません。',
    retry: '再試行',
    retrying: '再試行中',

    breakdown: 'スコア内訳',
    rawFigure: '実数',
    totalScore: '総合スコア',
    notMeasured: '計測なし',
    measuredBy: '計測元',
    noHistoryTitle: '履歴はまだありません',
    noHistoryHint: '初回の定期更新後にスナップショットが表示されます。',

    language: '言語',
  },

  kr: {
    updated: '갱신',
    methodology: '산출 방식',
    close: '닫기',

    score: '점수',
    scoreRange: '점수',
    period: '기간',
    clearFilters: '필터 해제',
    exportCsv: 'CSV 내보내기',

    emptyTitle: '조건에 맞는 캐릭터가 없습니다',
    measuring: '실시간 출처를 읽는 중',
    measuringHint: '첫 조회는 캐릭터마다 네 곳의 출처에 요청합니다.',
    apiDownTitle: '순위를 불러올 수 없음',
    apiDownBody: '측정 API에 연결하지 못했습니다. 샘플 데이터 대신 아무것도 표시하지 않습니다.',
    retry: '다시 시도',
    retrying: '재시도 중',

    breakdown: '점수 구성',
    rawFigure: '실측값',
    totalScore: '총점',
    notMeasured: '측정 없음',
    measuredBy: '측정 출처',
    noHistoryTitle: '기록 없음',
    noHistoryHint: '첫 정기 갱신 이후 스냅샷이 표시됩니다.',

    language: '언어',
  },

  cn: {
    updated: '更新',
    methodology: '计算方式',
    close: '关闭',

    score: '分数',
    scoreRange: '分数',
    period: '时间范围',
    clearFilters: '清除筛选',
    exportCsv: '导出 CSV',

    emptyTitle: '没有符合条件的角色',
    measuring: '正在读取实时数据源',
    measuringHint: '首次读取会为每个角色查询四个数据源。',
    apiDownTitle: '暂时无法获取排行',
    apiDownBody: '无法连接测量 API。此处不显示任何内容，而不是改用示例数据。',
    retry: '重试',
    retrying: '重试中',

    breakdown: '分数构成',
    rawFigure: '实测值',
    totalScore: '总分',
    notMeasured: '未测量',
    measuredBy: '测量来源',
    noHistoryTitle: '暂无历史记录',
    noHistoryHint: '首次定时刷新后将显示快照。',

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
  const value = useMemo<TranslationContextValue>(
    () => ({
      language,
      setLanguage: onChangeLanguage,
      t: (key: string) => translations[language]?.[key] ?? translations.en[key] ?? key,
    }),
    [language, onChangeLanguage],
  );

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};

export const useTranslation = () => useContext(TranslationContext);
