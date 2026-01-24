// composables/useChat.ts
export type ChatRequest = {
  question: string
  include_context?: boolean
}

export type ChatResponse = {
  answer: string
  question: string
  has_ai: boolean
}
const BASE_URL = '/api/v1/chat/chat'
export function useChat() {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('token', { sameSite: 'lax' })

  const send = async (question: string, includeContext = true): Promise<ChatResponse> => {
    const payload: ChatRequest = {
      question: question.trim(),
      include_context: includeContext,
    }

    if (!payload.question) {
      throw new Error('Question is empty')
    }

    return await $fetch<ChatResponse>(`${BASE_URL}`, {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: payload,
      headers: {
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      },
    })
  }

  return { send }
}
