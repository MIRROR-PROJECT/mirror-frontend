// app/lib/api/teacher.ts
import { supabase } from "../supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mirror-backend-5j11.onrender.com/api';

export interface AddStudentRequest {
    student_name: string;
    phone_number: string; // 010-XXXX-XXXX
    class_name: string;
    email?: string;
    school_grade?: number; // 1-12
}

export interface AddStudentResponse {
    success: boolean;
    code: number;
    message: string;
    data: {
        student_id: string;
        user_id: string;
        student_name: string;
        phone_number: string;
        email: string;
        class_name: string;
        academy_name: string;
        created_at: string;
    } | null;
}

/**
 * 선생님이 반에 학생 추가
 * - 신규 학생이면 생성 후 반에 추가
 * - 기존 학생이면 반에만 추가
 */
export async function addStudentToClass(
    request: AddStudentRequest
): Promise<AddStudentResponse> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
        throw new Error('로그인이 필요합니다');
    }

    const response = await fetch(`${API_BASE_URL}/teacher/students`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(request)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '학생 추가 실패');
    }

    return await response.json();
}

/**
 * 선생님의 학생 목록 조회
 */
export async function getTeacherStudents(className?: string): Promise<any> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
        throw new Error('로그인이 필요합니다');
    }

    const url = className
        ? `${API_BASE_URL}/teacher/students?class_name=${encodeURIComponent(className)}`
        : `${API_BASE_URL}/teacher/students`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${session.access_token}`
        }
    });

    if (!response.ok) {
        throw new Error('학생 목록 조회 실패');
    }

    return await response.json();
}

export interface ClassInfo {
    class_id: string;
    class_name: string;
    academy_name: string;
    student_count: number;
}

export interface MyClassesResponse {
    success: boolean;
    code: number;
    message: string;
    data: {
        total_classes: number;
        classes: ClassInfo[];
    } | null;
}

/**
 * 선생님의 반 목록 조회
 */
export async function getMyClasses(): Promise<MyClassesResponse> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
        throw new Error('로그인이 필요합니다');
    }

    const response = await fetch(`${API_BASE_URL}/teacher/my-classes`, {
        headers: {
            'Authorization': `Bearer ${session.access_token}`
        }
    });

    if (!response.ok) {
        throw new Error('반 목록 조회 실패');
    }

    return await response.json();
}
