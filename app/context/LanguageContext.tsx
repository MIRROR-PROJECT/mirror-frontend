"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import koTranslations from '../lib/translations/ko.json';
import enTranslations from '../lib/translations/en.json';

type Language = 'ko' | 'en';
type Translations = typeof koTranslations;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Translations> = {
    ko: koTranslations,
    en: enTranslations
};

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('ko');
    const [isLoaded, setIsLoaded] = useState(false);

    // LocalStorage에서 언어 설정 불러오기
    useEffect(() => {
        const savedLanguage = localStorage.getItem('mirror_language') as Language;
        if (savedLanguage && (savedLanguage === 'ko' || savedLanguage === 'en')) {
            setLanguageState(savedLanguage);
        }
        setIsLoaded(true);
    }, []);

    // 언어 변경 시 LocalStorage에 저장
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('mirror_language', lang);
    };

    // 번역 함수
    const t = (key: string, params?: Record<string, string | number>): string => {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }

        if (typeof value !== 'string') {
            console.warn(`Translation value is not a string: ${key}`);
            return key;
        }

        // {{변수}} 형식의 파라미터 치환
        if (params) {
            return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
                return params[paramKey]?.toString() || match;
            });
        }

        return value;
    };

    // 로딩 중일 때 빈 화면 방지
    if (!isLoaded) {
        return <div className="min-h-screen bg-gray-50" />;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}
