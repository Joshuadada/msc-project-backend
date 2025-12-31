import { Injectable, BadRequestException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { SubmitExamDto } from "./dto/submit-exam-dto";

@Injectable()
export class SubmitRepository {
    constructor(private readonly db: DatabaseService) { }

    // Check if a submission already exists
    async findSubmission(examId: string, studentId: string) {
        const query = `
            SELECT id, exam_id, student_id, submitted_at
            FROM exam_submissions
            WHERE exam_id = $1 AND student_id = $2
        `;
        const result = await this.db.query(query, [examId, studentId]);
        return result.rows[0]; // undefined if no submission exists
    }

    async createSubmission(examId: string, studentId: string) {
        const query = `
            INSERT INTO exam_submissions (exam_id, student_id)
            VALUES ($1, $2)
            RETURNING id, exam_id, student_id, submitted_at
        `;
        const result = await this.db.query(query, [examId, studentId]);
        return result.rows[0];
    }

    async createAnswers(submissionId: string, answers: { subQuestionId: string; answerText: string }[]) {
        const query = `
            INSERT INTO exam_answers (submission_id, sub_question_id, answer_text)
            VALUES ($1, $2, $3)
            RETURNING id, sub_question_id, answer_text
        `;

        const insertedAnswers: any[] = [];
        for (const ans of answers) {
            const result = await this.db.query(query, [submissionId, ans.subQuestionId, ans.answerText]);
            insertedAnswers.push(result.rows[0]);
        }
        return insertedAnswers;
    }

    async submitExam(payload: SubmitExamDto) {
        // Check for duplicate submission first
        const existing = await this.findSubmission(payload.examId, payload.studentId);
        if (existing) {
            throw new BadRequestException({
                message: 'You have already submitted this exam',
                error: 'DuplicateSubmission',
            });
        }

        await this.db.query('BEGIN');
        try {
            const submission = await this.createSubmission(payload.examId, payload.studentId);
            const answers = await this.createAnswers(submission.id, payload.answers);
            await this.db.query('COMMIT');
            return { submission, answers };
        } catch (error) {
            await this.db.query('ROLLBACK');
            throw error;
        }
    }
}
