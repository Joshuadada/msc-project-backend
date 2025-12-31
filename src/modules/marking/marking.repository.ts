import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class MarkingRepository {
  constructor(private readonly db: DatabaseService) {}

  async getSubmissionAnswers(submissionId: string) {
    const query = `
      SELECT
        ea.id,
        ea.submission_id,
        ea.sub_question_id,
        ea.answer_text,
        ea.score,
        esq.question_id,
        esq.question_text AS question_html,
        esq.marking_guide
      FROM exam_answers ea
      JOIN exam_sub_questions esq ON ea.sub_question_id = esq.id
      WHERE ea.submission_id = $1
    `;
    const result = await this.db.query(query, [submissionId]);
    return result.rows;
  }
  

  async updateAnswerScore(
    studentAnswerId: string,
    score: number,
    feedback: string,
  ) {
    const query = `
      UPDATE exam_answers
      SET score = $1,
          feedback = $2
      WHERE id = $3
      RETURNING id, score, feedback
    `;
    const result = await this.db.query(query, [score, feedback, studentAnswerId]);
    return result.rows[0];
  }
}
