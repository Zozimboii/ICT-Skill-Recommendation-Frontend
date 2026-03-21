// stores/useDashboardStore.ts
import { defineStore } from 'pinia';
import type { DashboardSummary, SkillGapResponse, RecommendationItem } from '~/types/Dashboard';

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        summary: null as DashboardSummary | null,
        skillGap: [] as SkillGapResponse[],
        recommendations: [] as RecommendationItem[],
        loading: false,
    }),

    actions: {
        async load() {
            if (this.loading) return; // ป้องกัน concurrent calls
            this.loading = true;

            // useDashboard ใช้ $fetch แล้ว — เรียกได้จาก store โดยตรง
            const { getSummary, getSkillGap, getRecommendations } = useDashboard();

            try {
                const s = await getSummary();
                this.summary = s;

                if (s?.has_transcript) {
                    const [g, r] = await Promise.all([getSkillGap(), getRecommendations()]);
                    this.skillGap = g;
                    this.recommendations = r;
                } else {
                    this.skillGap = [];
                    this.recommendations = [];
                }
            } finally {
                this.loading = false;
            }
        },

        async reload() {
            this.clearData();
            await this.load();
        },

        clearData() {
            this.summary = null;
            this.skillGap = [];
            this.recommendations = [];
        },
    },
});
