"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "@/frontend/utils/translations";

type TranslationKeys = keyof typeof translations["en"];

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Client-side initialization of language from localStorage
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("yabbok-lang") as Language;
      if (savedLang === "en" || savedLang === "am") {
        setLanguageState(savedLang);
      }
    }
    setIsMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("yabbok-lang", lang);
    }
  };

  const t = (key: TranslationKeys): string => {
    const dict = translations[language] || translations["en"];
    return (dict[key] as string) || (translations["en"][key] as string) || String(key);
  };

  // Avoid hydrations mismatch by checking mounting state
  if (!isMounted) {
    // Provide a simple shell during server-side render
    return (
      <LanguageContext.Provider value={{ language: "en", setLanguage: () => {}, t: (k) => translations["en"][k] as string }}>
        <div style={{ visibility: "hidden" }}>{children}</div>
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
