import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { MarkingResult } from './interfaces/marking-result.interface';

@Injectable()
export class MarkingRepository {
  constructor(private readonly db: DatabaseService) { }

  // marking.repository.ts
  async getSubmissionAnswers(submissionId: string) {
    const query = `
    SELECT
      ea.id,
      ea.submission_id,
      ea.sub_question_id,
      ea.answer_text,
      esq.id AS sub_question_db_id,
      esq.question_id,
      esq.question_text AS question_html,
      esq.marking_guide,
      esq.marks
    FROM exam_answers ea
    JOIN exam_sub_questions esq ON ea.sub_question_id = esq.id
    WHERE ea.submission_id = $1
  `;
    const result = await this.db.query(query, [submissionId]);
    return result.rows;
  }

  async saveMarkingResult(result: MarkingResult, submissionId: string) {
    const query = `
    INSERT INTO answer_markings (
      submission_id,
      student_answer_id,
      question_id,
      sub_question_id,
      marking_guide_id,
      llm_provider,
      llm_model,
      awarded_marks,
      max_marks,
      confidence_score,
      feedback,
      strengths,
      weaknesses,
      requires_human_review,
      review_reason,
      request_payload,
      response_payload,
      processing_time_ms
    )
    VALUES (
      $1,$2,$3,$4,$5,
      $6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,
      $16,$17,$18
    )
  `;

    await this.db.query(query, [
      submissionId,
      result.student_answer_id,
      result.question_id,
      result.sub_question_id,
      result.marking_guide_id,
      result.llm_provider,
      result.llm_model,
      result.awarded_marks,
      result.max_marks,
      result.confidence_score,
      result.feedback,
      result.strengths,
      result.weaknesses,
      result.requires_human_review,
      result.review_reason,
      JSON.stringify(result.request_payload),
      JSON.stringify(result.response_payload),
      result.processing_time_ms,
    ]);
  }
}
