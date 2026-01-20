import type { RelatedSubCategory } from "./RelatedSubCategory"
import type { TopCategory } from "./TopCategory"

export interface SearchJobsResult {
  sub_category_id: number | string
  sub_category_name: string
  job_count: number
  top_categories: TopCategory[]
  related_sub_categories: RelatedSubCategory[]
}