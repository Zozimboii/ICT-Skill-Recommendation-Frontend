import type { Transcript, TranscriptResponse, UploadResponse } from '~/types/TranscriptNisit'

const BASE_URL = '/api/v1/transcripts'

export function useTranscript() {
  /**
   * Upload a PDF file and extract transcript data
   */
  async function uploadTranscript(file: File): Promise<Transcript | null> {
    const formData = new FormData()
    formData.append('file', file)

    const { data, error } = await useApiFetch<UploadResponse>(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    })

    if (error.value) {
      throw error.value
    }

    return data.value?.data ?? null
  }

  /**
   * Fetch transcript data by ID
   */
  async function getTranscript(transcriptId: string): Promise<Transcript | null> {
    const { data, error } = await useApiFetch<TranscriptResponse>(`${BASE_URL}/${transcriptId}`, {
      method: 'GET',
    })

    if (error.value) {
      throw error.value
    }

    return data.value?.data ?? null
  }

  /**
   * Get user's latest transcript
   */
  async function getLatestTranscript(): Promise<Transcript | null> {
    const { data, error } = await useApiFetch<TranscriptResponse>(`${BASE_URL}/latest`, {
      method: 'GET',
    })

    if (error.value) {
      throw error.value
    }

    return data.value?.data ?? null
  }

  /**
   * List all user's transcripts
   */
  async function listTranscripts(): Promise<Transcript[] | null> {
    const { data, error } = await useApiFetch<{ success: boolean; data: Transcript[] }>(`${BASE_URL}`, {
      method: 'GET',
    })

    if (error.value) {
      throw error.value
    }

    return data.value?.data ?? null
  }

  return { uploadTranscript, getTranscript, getLatestTranscript, listTranscripts }
}
