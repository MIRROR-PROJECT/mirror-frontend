/**
 * API 응답 텍스트 번역 매핑
 * 백엔드에서 한국어로 오는 고정 텍스트를 영어로 매핑
 */

// 과목명 매핑
export const SUBJECT_TRANSLATIONS: Record<string, Record<string, string>> = {
    ko: {
        "수학": "수학",
        "영어": "영어",
        "과학": "과학",
        "국어": "국어",
        "사회": "사회",
        "역사": "역사",
        "물리": "물리",
        "화학": "화학",
        "생물": "생물",
        "지구과학": "지구과학",
        "한국사": "한국사",
        "세계사": "세계사",
        "지리": "지리",
        "윤리": "윤리",
        "기술": "기술",
        "가정": "가정"
    },
    en: {
        "수학": "Math",
        "영어": "English",
        "과학": "Science",
        "국어": "Korean",
        "사회": "Social Studies",
        "역사": "History",
        "물리": "Physics",
        "화학": "Chemistry",
        "생물": "Biology",
        "지구과학": "Earth Science",
        "한국사": "Korean History",
        "세계사": "World History",
        "지리": "Geography",
        "윤리": "Ethics",
        "기술": "Technology",
        "가정": "Home Economics"
    }
};

// 에러 메시지 매핑
export const ERROR_TRANSLATIONS: Record<string, Record<string, string>> = {
    ko: {
        "로그인이 필요합니다": "로그인이 필요합니다",
        "로그인이 필요합니다.": "로그인이 필요합니다.",
        "잘못된 요청입니다": "잘못된 요청입니다",
        "권한이 없습니다": "권한이 없습니다",
        "사용자를 찾을 수 없습니다": "사용자를 찾을 수 없습니다",
        "데이터를 찾을 수 없습니다": "데이터를 찾을 수 없습니다",
        "네트워크 오류가 발생했습니다": "네트워크 오류가 발생했습니다",
        "서버 오류가 발생했습니다": "서버 오류가 발생했습니다",
        "요청 처리 중 오류가 발생했습니다": "요청 처리 중 오류가 발생했습니다"
    },
    en: {
        "로그인이 필요합니다": "Login required",
        "로그인이 필요합니다.": "Login required.",
        "잘못된 요청입니다": "Invalid request",
        "권한이 없습니다": "Access denied",
        "사용자를 찾을 수 없습니다": "User not found",
        "데이터를 찾을 수 없습니다": "Data not found",
        "네트워크 오류가 발생했습니다": "Network error occurred",
        "서버 오류가 발생했습니다": "Server error occurred",
        "요청 처리 중 오류가 발생했습니다": "Error processing request"
    }
};

// 일반 텍스트 매핑 (기타)
export const GENERAL_TRANSLATIONS: Record<string, Record<string, string>> = {
    ko: {
        "완료": "완료",
        "진행중": "진행중",
        "대기": "대기",
        "실패": "실패"
    },
    en: {
        "완료": "Completed",
        "진행중": "In Progress",
        "대기": "Pending",
        "실패": "Failed"
    }
};

/**
 * API 응답 텍스트를 현재 언어로 번역
 * @param text 원본 텍스트 (한국어)
 * @param language 목표 언어 ('ko' | 'en')
 * @returns 번역된 텍스트
 */
export function translateApiText(text: string, language: string): string {
    if (!text || language === 'ko') return text;

    // 과목명 확인
    if (SUBJECT_TRANSLATIONS[language]?.[text]) {
        return SUBJECT_TRANSLATIONS[language][text];
    }

    // 에러 메시지 확인
    if (ERROR_TRANSLATIONS[language]?.[text]) {
        return ERROR_TRANSLATIONS[language][text];
    }

    // 일반 텍스트 확인
    if (GENERAL_TRANSLATIONS[language]?.[text]) {
        return GENERAL_TRANSLATIONS[language][text];
    }

    // 매핑이 없으면 원본 반환
    return text;
}

/**
 * 과목 이름 배열 번역
 */
export function translateSubjects(subjects: string[], language: string): string[] {
    return subjects.map(subject => translateApiText(subject, language));
}

/**
 * 객체의 특정 필드 번역
 */
export function translateObjectField<T extends Record<string, any>>(
    obj: T,
    field: keyof T,
    language: string
): T {
    return {
        ...obj,
        [field]: translateApiText(obj[field] as string, language)
    };
}
