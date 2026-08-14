import React from 'react';
import { useTranslation } from '../lib/i18n';

interface FooterProps {
  onOpenMethodology: () => void;
  updatedAt?: string;
}

const Footer: React.FC<FooterProps> = ({ onOpenMethodology, updatedAt }) => {
  const { t } = useTranslation();

  return (
    <footer className="mt-16 border-t border-line-light dark:border-line-dark">
      <div className="mx-auto max-w-[1400px] px-4 py-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-light dark:text-muted-dark">
        <p>{t('measuredFrom')}</p>
        <button
          type="button"
          onClick={onOpenMethodology}
          className="font-bold text-ink-light dark:text-ink-dark hover:underline"
        >
          {t('methodology')}
        </button>
        {updatedAt && (
          <p className="ml-auto tabular">
            {t('updated')}{' '}
            <time dateTime={updatedAt}>{new Date(updatedAt).toLocaleString()}</time>
          </p>
        )}
      </div>
    </footer>
  );
};

export default Footer;
