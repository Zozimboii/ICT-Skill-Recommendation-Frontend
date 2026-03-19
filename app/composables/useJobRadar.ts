// composables/useJobRadar.ts

import type { SkillGapResponse, RecommendationItem } from '~/types/Dashboard';

export interface RadarDataset {
    labels: string[];
    youData: number[];
    jobData: number[];
}

/** แยก hard/soft เพื่อแสดงสีต่างกันใน dashboard */
export interface RadarDatasetSplit {
    hardLabels: string[];
    hardYou: number[];
    hardJob: number[];
    softLabels: string[];
    softYou: number[];
    softJob: number[];
}

export interface RadarDebugInfo {
    recTitle: string;
    gapFound: boolean;
    gapTitle: string | null;
    matchedCount: number;
    missingCount: number;
    allGapTitles: string[];
}

const normalize = (s: string) => s.trim().toLowerCase();

export function isValidSkillName(name: string): boolean {
    const n = name.trim();
    if (n.length <= 1) return false;
    if (/^[A-Z]$/.test(n)) return false;
    if (/^[A-Z]{2}$/.test(n)) return false;
    return true;
}

function findGap(rec: RecommendationItem, skillGap: SkillGapResponse[]) {
    return (
        skillGap.find((g) => normalize(g.job_title) === normalize(rec.title) || normalize(g.job_title).includes(normalize(rec.title)) || normalize(rec.title).includes(normalize(g.job_title))) ?? null
    );
}

// ── สร้าง skills list จาก gap (hard first) ─────────────────────────
function buildSkillList(gap: SkillGapResponse, maxSkills: number) {
    const matchedHard = gap.matched_skills.filter((s) => s.skill_type === 'hard_skill' && isValidSkillName(s.skill_name)).slice(0, Math.ceil(maxSkills * 0.55));

    const matchedSoft = gap.matched_skills.filter((s) => s.skill_type === 'soft_skill' && isValidSkillName(s.skill_name)).slice(0, Math.ceil(maxSkills * 0.25));

    const missingRequired = gap.missing_skills
        .filter((s) => (s.importance === 'required' || s.importance === 'recommended') && isValidSkillName(s.skill_name))
        .slice(0, maxSkills - matchedHard.length - matchedSoft.length);

    return {
        hard: [
            ...matchedHard.map((s) => ({
                name: s.skill_name,
                have: true,
                score: s.frequency_score != null ? Math.round(s.frequency_score * 100) : 80,
            })),
            ...missingRequired.filter((s) => s.skill_type === 'hard_skill').map((s) => ({ name: s.skill_name, have: false, score: 0 })),
        ],
        soft: [
            ...matchedSoft.map((s) => ({
                name: s.skill_name,
                have: true,
                score: s.frequency_score != null ? Math.round(s.frequency_score * 100) : 75,
            })),
            ...missingRequired.filter((s) => s.skill_type === 'soft_skill').map((s) => ({ name: s.skill_name, have: false, score: 0 })),
        ],
    };
}

/**
 * buildRadarData — รวม hard+soft ไว้ใน dataset เดียว (สำหรับ assessment)
 */
export function buildRadarData(rec: RecommendationItem, skillGap: SkillGapResponse[], maxSkills = 12): RadarDataset | null {
    const gap = findGap(rec, skillGap);

    if (gap) {
        const { hard, soft } = buildSkillList(gap, maxSkills);
        const all = [...hard, ...soft].slice(0, maxSkills);
        if (all.length < 3) return null;
        return {
            labels: all.map((s) => s.name),
            youData: all.map((s) => s.score),
            jobData: all.map(() => 100),
        };
    }

    if (rec.total_skill_count < 3) return null;
    const total = Math.min(rec.total_skill_count, maxSkills);
    const matched = Math.min(rec.matched_count, total);
    return {
        labels: Array.from({ length: total }, (_, i) => `Skill ${i + 1}`),
        youData: Array.from({ length: total }, (_, i) => (i < matched ? 80 : 0)),
        jobData: Array.from({ length: total }, () => 100),
    };
}

/**
 * buildRadarDataSplit — แยก hard/soft สำหรับ dashboard radar (2 charts)
 */
export function buildRadarDataSplit(rec: RecommendationItem, skillGap: SkillGapResponse[], maxPerType = 8): RadarDatasetSplit | null {
    const gap = findGap(rec, skillGap);
    if (!gap) return null;

    const { hard, soft } = buildSkillList(gap, maxPerType * 2);

    const h = hard.slice(0, maxPerType);
    const s = soft.slice(0, maxPerType);

    if (h.length < 3 && s.length < 3) return null;

    return {
        hardLabels: h.map((x) => x.name),
        hardYou: h.map((x) => x.score),
        hardJob: h.map(() => 100),
        softLabels: s.map((x) => x.name),
        softYou: s.map((x) => x.score),
        softJob: s.map(() => 100),
    };
}

/** Debug info */
export function getRadarDebugInfo(rec: RecommendationItem, skillGap: SkillGapResponse[]): RadarDebugInfo {
    const gap = findGap(rec, skillGap);
    return {
        recTitle: rec.title,
        gapFound: !!gap,
        gapTitle: gap?.job_title ?? null,
        matchedCount: gap?.matched_skills.length ?? rec.matched_count,
        missingCount: gap?.missing_skills.length ?? rec.total_skill_count - rec.matched_count,
        allGapTitles: skillGap.map((g) => g.job_title),
    };
}
