import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { SubmitExamDto } from './dto/submit-exam-dto';

export type SubmissionStatus = 'PENDING' | 'MARKED' | 'FAILED';

@Injectable()
export class SubmitRepository {
    constructor(private readonly db: DatabaseService) { }

    /* ---------------------------------------------
     * FIND EXISTING SUBMISSION (DUPLICATE CHECK)
     * --------------------------------------------- */
    async findSubmission(examId: string, studentId: string) {
        const query = `
      SELECT 
        id,
        exam_id,
        student_id,
        submitted_at,
        status,
        marked_at,
        student_total_score,
        total_score,
        failure_reason
      FROM exam_submissions
      WHERE exam_id = $1 AND student_id = $2
    `;
        const result = await this.db.query(query, [examId, studentId]);
        return result.rows[0];
    }

    /* ---------------------------------------------
     * CREATE SUBMISSION (DEFAULT: PENDING)
     * --------------------------------------------- */
    async createSubmission(examId: string, studentId: string) {
        const query = `
      INSERT INTO exam_submissions (
        exam_id,
        student_id,
        status
      )
      VALUES ($1, $2, 'PENDING')
      RETURNING 
        id,
        exam_id,
        student_id,
        submitted_at,
        status
    `;
        const result = await this.db.query(query, [examId, studentId]);
        return result.rows[0];
    }

    /* ---------------------------------------------
     * CREATE STUDENT ANSWERS
     * --------------------------------------------- */
    async createAnswers(
        submissionId: string,
        answers: { subQuestionId: string; answerText: string }[],
    ) {
        const query = `
      INSERT INTO exam_answers (
        submission_id,
        sub_question_id,
        answer_text
      )
      VALUES ($1, $2, $3)
      RETURNING id, sub_question_id, answer_text
    `;

        const insertedAnswers: any[] = [];

        for (const ans of answers) {
            const result = await this.db.query(query, [
                submissionId,
                ans.subQuestionId,
                ans.answerText,
            ]);
            insertedAnswers.push(result.rows[0]);
        }

        return insertedAnswers;
    }

    /* ---------------------------------------------
     * MARK SUBMISSION AS SUCCESS
     * --------------------------------------------- */
    async markSubmissionSuccess(
        submissionId: string,
        studentTotalScore: number,
        totalScore: number,
    ) {
        const query = `
      UPDATE exam_submissions
      SET
        status = 'MARKED',
        student_total_score = $2,
        total_score = $3,
        marked_at = NOW(),
        failure_reason = NULL
      WHERE id = $1
    `;
        await this.db.query(query, [submissionId, studentTotalScore, totalScore]);
    }

    /* ---------------------------------------------
     * MARK SUBMISSION AS FAILED
     * --------------------------------------------- */
    async markSubmissionFailed(
        submissionId: string,
        reason: string,
    ) {
        const query = `
      UPDATE exam_submissions
      SET
        status = 'FAILED',
        failure_reason = $2,
        marked_at = NOW()
      WHERE id = $1
    `;
        await this.db.query(query, [submissionId, reason]);
    }

    /* ---------------------------------------------
     * SUBMIT EXAM (ATOMIC WRITE)
     * --------------------------------------------- */
    async submitExam(payload: SubmitExamDto) {
        // Duplicate submission guard
        const existing = await this.findSubmission(
            payload.examId,
            payload.studentId,
        );

        if (existing) {
            throw new BadRequestException({
                message: 'You have already submitted this exam',
                error: 'DuplicateSubmission',
            });
        }

        await this.db.query('BEGIN');

        try {
            const submission = await this.createSubmission(
                payload.examId,
                payload.studentId,
            );

            const answers = await this.createAnswers(
                submission.id,
                payload.answers,
            );

            await this.db.query('COMMIT');

            return { submission, answers };
        } catch (error) {
            await this.db.query('ROLLBACK');
            throw error;
        }
    }
}
