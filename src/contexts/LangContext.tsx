import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lang } from '../lib/i18n';

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextType>({
  lang: 'id',
  toggleLang: () => {}
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('dbf_lang') as Lang) || 'id';
    }
    return 'id';
  });

  const toggleLang = () => {
    const next: Lang = lang === 'id' ? 'en' : 'id';
    setLang(next);
    localStorage.setItem('dbf_lang', next);
  };

  return (
    <LangContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
