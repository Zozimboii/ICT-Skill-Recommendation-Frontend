export interface ChatRequest {
    question: string;
    include_context?: boolean;
}

export interface ChatResponse {
    answer: string;
    question: string;
    has_ai: boolean;
    tags?: string[];
}
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    tags?: string[];
}
