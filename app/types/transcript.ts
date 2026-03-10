// types/transcript.ts
// export interface Course {
//     course_code: string;
//     course_name: string;
//     grade: string;
//     credit: number;
// }

// export interface TranscriptRequest {
//     user_id: number;
//     parsed_text: string;
//     gpa: number;
//     university: string;
//     major: string;
//     file_path: string;
//     courses: Course[];
// }

// export interface TranscriptResponse {
//     message: string;
//     id: number;
// }
export interface Course {
    course_code: string;
    course_name: string;
    grade: string;
    credit: number;
}
// types/transcript.ts — ลบ created_at ออก
export interface TranscriptDetail {
    id: number;
    university: string | null;
    major: string | null;
    gpa: number | null;
    courses: Course[];
}
export interface ExtractedSkill {
    skill_id: number;
    skill_name: string;
    skill_type: 'hard_skill' | 'soft_skill';
    confidence_score: number;
}

export interface TranscriptResponse {
    message: string;
    id: number;
}

export interface JobRecommendation {
    id: number;
    job_id: number;
    title: string;
    company_name: string;
    location: string | null;
    sub_category: string | null;
    match_score: number;
    skill_match_percent: number;
}
