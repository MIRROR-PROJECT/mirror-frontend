/**
 * 전화번호 자동 하이픈 추가 유틸리티
 * 
 * 사용법:
 * const [phone, setPhone] = useState('');
 * 
 * <input
 *   value={phone}
 *   onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
 *   placeholder="010-1234-5678"
 *   maxLength={13}
 * />
 */

/**
 * 전화번호에 자동으로 하이픈을 추가합니다
 * @param value - 입력된 전화번호 문자열
 * @returns 하이픈이 추가된 전화번호 (예: 010-1234-5678)
 */
export function formatPhoneNumber(value: string): string {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');

    // 길이에 따라 포맷팅
    if (numbers.length <= 3) {
        return numbers;
    } else if (numbers.length <= 7) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 11) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    }

    // 11자리 초과 시 11자리까지만 사용
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
}

/**
 * 전화번호에서 하이픈을 제거합니다
 * @param value - 하이픈이 포함된 전화번호
 * @returns 숫자만 있는 전화번호 (예: 01012345678)
 */
export function removePhoneHyphens(value: string): string {
    return value.replace(/[^\d]/g, '');
}

/**
 * 전화번호 유효성 검사
 * @param value - 검사할 전화번호
 * @returns 유효한 전화번호인지 여부
 */
export function isValidPhoneNumber(value: string): boolean {
    const numbers = removePhoneHyphens(value);

    // 010, 011, 016, 017, 018, 019로 시작하는 11자리 숫자
    const phoneRegex = /^01[0-9]\d{8}$/;
    return phoneRegex.test(numbers);
}
