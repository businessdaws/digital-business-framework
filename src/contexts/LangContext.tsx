import { createContext, useContext, useState, ReactNode } from 'react'

export type Lang = 'id' | 'en'

interface LangContextType {
  lang: Lang
  toggleLang: () => void
}

const LangContext = createContext<LangContextType>({
  lang: 'id',
  toggleLang: () => {}
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('dbf_lang') as Lang) || 'id'
  })

  const toggleLang = () => {
    const next: Lang = lang === 'id' ? 'en' : 'id'
    setLang(next)
    localStorage.setItem('dbf_lang', next)
  }

  return (
    <LangContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
