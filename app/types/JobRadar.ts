export interface RadarDataset {
    labels: string[];
    youData: number[];
    jobData: number[];
}

export interface RadarDebugInfo {
    recTitle: string;
    gapFound: boolean;
    gapTitle: string | null;
    matchedCount: number;
    missingCount: number;
    allGapTitles: string[];
}
