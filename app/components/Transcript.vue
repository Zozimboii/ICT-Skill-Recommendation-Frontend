<template>
  <div class="w-full max-w-6xl mx-auto">
    <!-- Upload Section -->
    <div class="bg-white rounded-lg shadow-md p-8 mb-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">อัพโหลด Transcript</h2>

      <div class="flex items-center justify-center">
        <label
          class="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <div class="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              class="w-12 h-12 text-blue-500 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <p class="mb-2 text-sm text-gray-600">
              <span class="font-semibold">คลิกเพื่ออัพโหลด</span> หรือ ลากแล้วปล่อยไฟล์
            </p>
            <p class="text-xs text-gray-500">PDF (.pdf)</p>
          </div>
          <input
            type="file"
            class="hidden"
            accept=".pdf"
            @change="handleFileUpload"
            :disabled="isLoading"
          />
        </label>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="mt-4 flex items-center justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
        <span class="text-gray-600">กำลังประมวลผลไฟล์...</span>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ error }}
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
        {{ successMessage }}
      </div>
    </div>

    <!-- Skills Display Section -->
    <div v-if="transcript" class="space-y-8">
      <!-- Hard Skills Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center mb-6">
          <svg class="w-6 h-6 text-orange-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
            ></path>
          </svg>
          <h3 class="text-xl font-bold text-gray-800">Hard Skills</h3>
          <span class="ml-auto bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
            {{ transcript.hard_skills.length }} skills
          </span>
        </div>

        <div v-if="transcript.hard_skills.length > 0" class="space-y-3">
          <div
            v-for="skill in transcript.hard_skills"
            :key="skill"
            class="flex items-center p-4 bg-orange-50 rounded-lg border border-orange-200"
        >
        <p class="font-semibold text-gray-800">
          {{ skill }}
        </p>
            <div class="flex-1">
              <p class="font-semibold text-gray-800">{{ skill.name }}</p>
              <p v-if="skill.proficiency" class="text-sm text-gray-600">ระดับ: {{ skill.proficiency }}</p>
            </div>
            <div v-if="skill.score" class="ml-4">
              <div class="flex items-center">
                <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-orange-500 transition-all duration-300"
                    :style="{ width: `${(skill.score / 100) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          ไม่พบ Hard Skills
        </div>
      </div>

      <!-- Soft Skills Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center mb-6">
          <svg class="w-6 h-6 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"
            ></path>
          </svg>
          <h3 class="text-xl font-bold text-gray-800">Soft Skills</h3>
          <span class="ml-auto bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            {{ transcript.soft_skills.length }} skills
          </span>
        </div>

        <div v-if="transcript.soft_skills.length > 0" class="space-y-3">
          <div
            v-for="skill in transcript.soft_skills"
            :key="skill"
            class="flex items-center p-4 bg-orange-50 rounded-lg border border-orange-200"
          >
          <p class="font-semibold text-gray-800">
            {{ skill }}
          </p>
            <div class="flex-1">
              <p class="font-semibold text-gray-800">{{ skill.name }}</p>
              <p v-if="skill.proficiency" class="text-sm text-gray-600">ระดับ: {{ skill.proficiency }}</p>
            </div>
            <div v-if="skill.score" class="ml-4">
              <div class="flex items-center">
                <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-blue-500 transition-all duration-300"
                    :style="{ width: `${(skill.score / 100) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          ไม่พบ Soft Skills
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        
        <!-- Recommendation Job for you -->
<div v-if="transcript.recommend_job?.length" class="space-y-4">

  <h3 class="text-lg font-bold text-orange-600">
    Recommended Jobs For You
  </h3>

  <div
    v-for="job in transcript.recommend_job"
    :key="job"
    class="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition"
  >
    <span class="font-medium text-gray-800">
      {{ job }}
    </span>

    <span class="text-xs bg-orange-500 text-white px-3 py-1 rounded-full">
      Suggested
    </span>
  </div>

</div>
        <div v-else class="text-center py-8 text-gray-500">
          ไม่พบ Job ที่ตรงกับ Skill ของคุณ
        </div>
      </div>
      <!-- Recommendation Job for you -->
<div v-if="transcript.recommend_job?.length" class="space-y-4">
</div>
      <!-- Action Button -->
      <div class="flex justify-center mb-8">
        <button
          @click="resetUpload"
          class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
        >
          อัพโหลดไฟล์ใหม่
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Transcript } from '~/types/Transcript'

const { uploadTranscript } = useTranscript()

const isLoading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const transcript = ref<Transcript | null>(null)

interface FileEvent extends Event {
  target: HTMLInputElement
}

const handleFileUpload = async (event: FileEvent) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validate file type
  if (file.type !== 'application/pdf') {
    error.value = 'กรุณาเลือกไฟล์ PDF เท่านั้น'
    return
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    error.value = 'ขนาดไฟล์ต้องไม่เกิน 10MB'
    return
  }

  isLoading.value = true
  error.value = null
  successMessage.value = null

  try {
    const result = await uploadTranscript(file)
    if (result) {
      transcript.value = result
      successMessage.value = 'อัพโหลดไฟล์สำเร็จ!'
    } else {
      error.value = 'ไม่สามารถประมวลผลไฟล์ได้'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
  } finally {
    isLoading.value = false
    // Reset file input
    event.target.value = ''
  }
}

const resetUpload = () => {
  transcript.value = null
  error.value = null
  successMessage.value = null
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

// Fetch latest transcript on mount
onMounted(async () => {
  try {
    const { getLatestTranscript } = useTranscript()
    transcript.value = await getLatestTranscript()
  } catch {
    // Silently fail on mount
  }
})
</script>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
