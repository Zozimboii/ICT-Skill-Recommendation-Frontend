import type { AdvisorResponse } from '~/types/AdvisorResponse'
import { useApiFetch } from './useApiFetch'

const BASE_URL = '/api/v1/advisor'

export function useAdvisor() {
  async function ask(question: string): Promise<AdvisorResponse | null> {
    const text = question.trim()
    if (!text) return null

    const { data, error } = await useApiFetch<AdvisorResponse>(BASE_URL, {
      method: 'POST',
      body: { question: text },
    })

    if (error.value) throw error.value
    return data.value ?? null
  }

  return { ask }
}
