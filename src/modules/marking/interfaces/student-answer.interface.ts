export interface StudentAnswer {
    id: string;
    question_id: string;
    sub_question_id: string;

    question_html: string;          // REQUIRED by prompt
    student_answer_html: string;    // HTML
    max_marks: number;
}