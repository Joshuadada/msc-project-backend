import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class ExamsRepository {
    constructor(private readonly db: DatabaseService) { }

    /* =========================
       CREATE EXAM
    ========================== */

    async createExam(examData: any) {
        // Calculate total marks from sub-questions
        const totalMarks = examData.questions
            .flatMap((q: any) => q.subQuestions)
            .reduce((sum: any, sq: any) => sum + sq.marks, 0);

        const query = `
            INSERT INTO exams 
                (title, course_code, creator_id, examiner_name, instructions, duration, total_marks, exam_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, title, course_code, creator_id, examiner_name, instructions, duration, created_at, total_marks, exam_date
        `;

        const result = await this.db.query(query, [
            examData.title,
            examData.courseCode,
            examData.creatorId,
            examData.examinerName,
            examData.instructions,
            examData.duration,
            totalMarks,          // total_marks should be 7th
            examData.examDate,   // exam_date should be 8th
        ]);        

        return result.rows[0];
    }


    /* =========================
       CREATE QUESTION
    ========================== */
    async createQuestion(examId: string, number: number) {
        const query = `
      INSERT INTO exam_questions (exam_id, number)
      VALUES ($1, $2)
      RETURNING id, number
    `;

        const result = await this.db.query(query, [examId, number]);
        return result.rows[0];
    }

    /* =========================
       CREATE SUB QUESTION
    ========================== */
    async createSubQuestion(questionId: string, subQuestion: any) {
        const query = `
      INSERT INTO exam_sub_questions (
        question_id,
        label,
        question_text,
        marks,
        marking_guide
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, label, marks
    `;

        const result = await this.db.query(query, [
            questionId,
            subQuestion.label,
            subQuestion.questionText,
            subQuestion.marks,
            subQuestion.markingGuide,
        ]);

        return result.rows[0];
    }

    /* =========================
       FULL EXAM CREATION (TRANSACTION)
    ========================== */
    async createFullExam(payload: any) {
        await this.db.query('BEGIN');

        try {
            // 1. Create exam
            const exam = await this.createExam(payload);

            // 2. Create questions & sub-questions
            for (const question of payload.questions) {
                const createdQuestion = await this.createQuestion(
                    exam.id,
                    question.number,
                );

                for (const sub of question.subQuestions) {
                    await this.createSubQuestion(createdQuestion.id, sub);
                }
            }

            await this.db.query('COMMIT');
            return exam;
        } catch (error) {
            await this.db.query('ROLLBACK');
            throw error;
        }
    }

    // GET ALL EXAMS
    async getAllExams() {
        const query = `
          SELECT 
            id,
            title,
            course_code,
            creator_id,
            examiner_name,
            duration,
            exam_date,
            total_marks,
            created_at
          FROM exams
          ORDER BY created_at DESC
        `;

        const result = await this.db.query(query);
        return result.rows;
    }


    // GET RECENT EXAMS
    async getRecentExams() {
        const query = `
          SELECT 
            id,
            title,
            course_code,
            creator_id,
            examiner_name,
            duration,
            exam_date,
            total_marks,
            created_at
          FROM exams
          ORDER BY created_at DESC
          LIMIT 5
        `;

        const result = await this.db.query(query);
        return result.rows;
    }

    // GET EXAM BY ID
    async getExamById(examId: string) {
        const examResult = await this.db.query(
            `SELECT *
           FROM exams
           WHERE id = $1`,
            [examId],
        );

        if (!examResult.rows.length) return null;

        const questionsResult = await this.db.query(
            `SELECT id, number
           FROM exam_questions
           WHERE exam_id = $1
           ORDER BY number`,
            [examId],
        );

        for (const question of questionsResult.rows) {
            const subResult = await this.db.query(
                `SELECT 
               label,
               question_text,
               marks,
               marking_guide
             FROM exam_sub_questions
             WHERE question_id = $1
             ORDER BY label`,
                [question.id],
            );

            question.subQuestions = subResult.rows;
        }

        return {
            ...examResult.rows[0],
            questions: questionsResult.rows,
        };
    }

    // GET EXAMS BY CREATOR ID
    async getExamsByCreatorId(creatorId: string) {
        const result = await this.db.query(
            `
          SELECT 
            id,
            title,
            course_code,
            creator_id,
            examiner_name,
            duration,
            exam_date,
            total_marks,
            created_at
          FROM exams
          WHERE creator_id = $1
          ORDER BY created_at DESC
          `,
            [creatorId],
        );

        return result.rows;
    }

    // GET RECENT EXAMS BY CREATOR ID
    async getRecentExamsByCreatorId(creatorId: string) {
        const result = await this.db.query(
            `
          SELECT 
            id,
            title,
            course_code,
            creator_id,
            examiner_name,
            duration,
            exam_date,
            total_marks,
            created_at
          FROM exams
          WHERE creator_id = $1
          ORDER BY created_at DESC
          LIMIT 5
          `,
            [creatorId],
        );

        return result.rows;
    }

    // UPDATE EXAM
    async updateExam(examId: string, payload: UpdateExamDto) {
        const query = `
          UPDATE exams
          SET
            title = $1,
            course_code = $2,
            examiner_name = $3,
            instructions = $4,
            duration = $5,
            exam_date = $6,
            updated_at = NOW()
          WHERE id = $7
          RETURNING *
        `;

        const result = await this.db.query(query, [
            payload.title,
            payload.courseCode,
            payload.examinerName,
            payload.instructions,
            payload.duration,
            payload.examDate,
            examId,
        ]);

        return result.rows[0];
    }

    // DELETE EXAM
    async deleteExam(examId: string) {
        await this.db.query('BEGIN');
        try {
            await this.db.query(
                `DELETE FROM exam_sub_questions 
             WHERE question_id IN (
               SELECT id FROM exam_questions WHERE exam_id = $1
             )`,
                [examId],
            );

            await this.db.query(
                `DELETE FROM exam_questions WHERE exam_id = $1`,
                [examId],
            );

            await this.db.query(
                `DELETE FROM exams WHERE id = $1`,
                [examId],
            );

            await this.db.query('COMMIT');
            return true;
        } catch (err) {
            await this.db.query('ROLLBACK');
            throw err;
        }
    }

}
