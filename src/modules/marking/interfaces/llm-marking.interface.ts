export interface LLMRawMarkingResponse {
    awarded_marks: number;
    confidence_score: number;

    content_accuracy_score?: number;
    completeness_score?: number;
    clarity_score?: number;
    technical_correctness_score?: number;

    feedback: string; // HTML
    strengths?: string[];
    weaknesses?: string[];

    key_points_identified?: any[];
    missing_points?: string[];

    requires_human_review?: boolean;
    review_reason?: string | null;
}
