export interface MarkingGuide {
    id: string;
    question_id: string;
    sub_question_id: string;

    marking_scheme_html: string; // FULL HTML rubric
    model_answer_html?: string;  // optional but useful
}