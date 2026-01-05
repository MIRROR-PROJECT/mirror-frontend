"use client";

import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'ko' ? 'en' : 'ko');
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
            title={language === 'ko' ? '영어로 전환' : 'Switch to Korean'}
        >
            <Globe className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600">
                {language === 'ko' ? '🇰🇷 한국어' : '🇺🇸 English'}
            </span>
        </button>
    );
}
