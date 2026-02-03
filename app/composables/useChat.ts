// // composables/useChat.ts

import type { ChatRequest, ChatResponse } from '~/types/Chat';

// const BASE_URL = '/api/v1/chat/chat';
// export function useChat() {
//     const config = useRuntimeConfig();
//     const token = useCookie<string | null>('token', { sameSite: 'lax' });

//     const send = async (question: string, includeContext = true): Promise<ChatResponse> => {
//         const payload: ChatRequest = {
//             question: question.trim(),
//             include_context: includeContext,
//         };

//         if (!payload.question) {
//             throw new Error('Question is empty');
//         }

//         return await $fetch<ChatResponse>(`${BASE_URL}`, {
//             baseURL: config.public.apiBase,
//             method: 'POST',
//             body: payload,
//             headers: {
//                 ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
//             },
//         });
//     };

//     return { send };
// }

const BASE_URL = '/api/v1/chat/chat';

export function useChat() {
    const config = useRuntimeConfig();
    const token = useCookie<string | null>('token', { sameSite: 'lax' });

    const send = async (question: string, includeContext = true): Promise<ChatResponse> => {
        const payload: ChatRequest = {
            question: question.trim(),
            include_context: includeContext,
        };

        if (!payload.question) {
            throw new Error('Question is empty');
        }

        // ✅ Call API
        const res = await $fetch<ChatResponse>(BASE_URL, {
            baseURL: config.public.apiBase,
            method: 'POST',
            body: payload,
            headers: {
                ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
            },
        });

        // ✅ ตรวจ quota error แม้ status = 200
        const text = res.answer || '';

        if (text.includes('Quota exceeded') || text.includes('exceeded your current quota') || text.includes('429')) {
            // Extract retry delay เช่น "retry in 34s"
            // let waitTime = 30;
            // const match = text.match(/retry in ([0-9.]+)s/);

            // if (match) {
            //     waitTime = Math.ceil(Number(match[1]));
            // }

            throw new Error(`ตอนนี้ AI ถูกใช้งานเกินโควต้า (Limit) `);
        }

        return res;
    };

    return { send };
}
