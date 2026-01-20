export interface AdvisorResponse {
  intent: string
  suggested_skills: string[]
  detected_keywords: string[]
  trend_preview?: {
    skill_name: string
    skill_type: string
    job_count: number
  }
}