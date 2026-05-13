import { useLang } from '../contexts/LangContext'

export default function LangToggle() {
  const { lang, toggleLang } = useLang()

  return (
    <button
      onClick={toggleLang}
      className="flex items-center gap-1.5 px-3 py-1.5 
        rounded-lg border border-zinc-800 bg-zinc-900 
        hover:border-zinc-700 transition-all"
    >
      <span className="text-base">
        {lang === 'id' ? '🇮🇩' : '🇬🇧'}
      </span>
      <span className="text-[11px] font-bold 
        text-zinc-400 uppercase tracking-widest">
        {lang === 'id' ? 'ID' : 'EN'}
      </span>
    </button>
  )
}
