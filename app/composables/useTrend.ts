export type TrendJobsdbItem = {
  snapshot_date: string
  job_count: number
}

export type TrendJobsdbResponse = {
  series: TrendJobsdbItem[]
  // จะเพิ่ม field อื่นในอนาคตได้
}

const BASE_URL = '/api/v1/trends'

export function useTrend() {
  async function jobsdb(days = 30): Promise<TrendJobsdbResponse | null> {
    const { data, error } = await useApiFetch<TrendJobsdbResponse>(`${BASE_URL}/jobsdb`, {
      method: 'GET',
      query: { days },
    })

    if (error.value) throw error.value
    return data.value ?? null
  }

  return { jobsdb }
}
