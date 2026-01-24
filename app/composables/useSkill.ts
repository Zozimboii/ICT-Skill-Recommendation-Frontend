import type { SkillSearchResponse } from '~/types/SkillSearchResponse'

const BASE_URL = '/api/v1/skills'

export function useSkill() {
  async function search(q: string): Promise<SkillSearchResponse | null> {
    const keyword = q.trim()
    if (!keyword) return null

    const { data, error } = await useApiFetch<SkillSearchResponse>(`${BASE_URL}/search`, {
      method: 'GET',
      query: { q: keyword },
    })

    if (error.value) throw error.value
    return data.value ?? null
  }

  return { search }
}
