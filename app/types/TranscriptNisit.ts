export interface Transcript {
  id: string
  upload_date: string
  file_name: string
  hard_skills: SkillItem[]
  soft_skills: SkillItem[]
  recommend_job: string[]
}

export interface SkillItem {
  id: string
  name: string
}

export interface TranscriptResponse {
  success: boolean
  message: string
  data: Transcript
}

export interface UploadResponse {
  success: boolean
  message: string
  data: Transcript
}