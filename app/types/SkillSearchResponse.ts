import type { RelatedSkillRow } from "./RelatedSkillRow"
import type { SubCategoryRow } from "./SubCategoryRow"

export interface SkillSearchResponse {
  skill_name: string
  skill_type: string
  job_count: number
  top_subcategories: SubCategoryRow[]
  related_skills: RelatedSkillRow[]
}