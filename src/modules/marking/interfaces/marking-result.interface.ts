export interface MarkingResult {
    student_answer_id: string;

    question_id: string;
    sub_question_id: string; // ✅ ADD THIS

    marking_guide_id: string;

    llm_model: string;
    llm_provider: string;

    awarded_marks: number;
    max_marks: number;

    confidence_score: number;

    feedback: string; // HTML
    strengths: string[];
    weaknesses: string[];

    requires_human_review: boolean;
    review_reason: string | null;

    request_payload: any;
    response_payload: any;
    processing_time_ms: number;
}
