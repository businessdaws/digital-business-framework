import { useLang } from '../contexts/LangContext';

export default function LangToggle() {
  const { lang, toggleLang } = useLang();

  return (
    <button
      onClick={toggleLang}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800 transition-all duration-200 group"
      title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
    >
      <span className="text-base leading-none">
        {lang === 'id' ? '🇮🇩' : '🇬🇧'}
      </span>
      <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white transition-colors uppercase tracking-widest">
        {lang === 'id' ? 'ID' : 'EN'}
      </span>
      <span className="text-[10px] text-zinc-600 group-hover:text-zinc-400 transition-colors">
        {lang === 'id' ? '→ EN' : '→ ID'}
      </span>
    </button>
  );
}
