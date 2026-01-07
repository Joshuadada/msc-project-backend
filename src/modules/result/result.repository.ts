import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ResultRepository {
    constructor(private readonly db: DatabaseService) { }

    async getStudentResults(studentId: string) {
        const query = `
          SELECT
            es.id AS submission_id,
            es.submitted_at,
            es.total_score,
            es.student_total_score,
            ex.id AS exam_id,
            ex.title AS exam_title,
            ex.course_code
          FROM exam_submissions es
          JOIN exams ex ON es.exam_id = ex.id
          WHERE es.student_id = $1
          ORDER BY es.submitted_at DESC
        `;
        const result = await this.db.query(query, [studentId]);
        return result.rows;
    }

    async getRecentStudentResults(studentId: string) {
        const query = `
          SELECT
            es.id AS submission_id,
            es.submitted_at,
            es.total_score,
            es.student_total_score,
            ex.id AS exam_id,
            ex.title AS exam_title,
            ex.course_code
          FROM exam_submissions es
          JOIN exams ex ON es.exam_id = ex.id
          WHERE es.student_id = $1
          ORDER BY es.submitted_at DESC
          LIMIT 5

        `;
        const result = await this.db.query(query, [studentId]);
        return result.rows;
    }

    async getStudentResultBySubmissionId(submissionId: string) {
        const query = `
            SELECT exam_sub_questions.question_text, exam_sub_questions.question_id, exam_sub_questions.marking_guide, exam_sub_questions.label,
            answer_markings.feedback, answer_markings.max_marks, answer_markings.awarded_marks, answer_markings.strengths, answer_markings.weaknesses, answer_markings.submission_id,
            exam_answers.submission_id, exam_answers.sub_question_id, exam_answers.answer_text,
            exam_submissions.student_id,
            exam_questions.number,
            exams.course_code, exams.title
            FROM exam_questions
            INNER JOIN exam_sub_questions
            ON exam_questions.id = exam_sub_questions.question_id
            INNER JOIN answer_markings
            ON answer_markings.sub_question_id = exam_sub_questions.id
            INNER JOIN exam_answers 
            ON exam_answers.sub_question_id = answer_markings.sub_question_id
            INNER JOIN exam_submissions
            On exam_submissions.id = exam_answers.submission_id
            INNER JOIN exams
            ON exam_submissions.exam_id = exams.id
            WHERE exam_submissions.id = $1
        `;
        const result = await this.db.query(query, [submissionId]);
        return result.rows;
    }

    async getLeturerStudentResults(lecturerId: string) {
        const query = `
            SELECT exams.id AS "examId", exams.title, exams.exam_date, exams.creator_id, exams.course_code,
            exam_submissions.student_id, exam_submissions.total_score, exam_submissions.student_total_score, exam_submissions.id as "submissionId",
            users.full_name, users.identity
            FROM exams
            INNER JOIN exam_submissions
            ON exams.id = exam_submissions.exam_id
            INNER JOIN users
            ON exam_submissions.student_id = users.id
            WHERE exams.creator_id = $1
        `;
        const result = await this.db.query(query, [lecturerId]);
        return result.rows;
    }

    async getLecturerStudentResultBySubmissionId(submissionId: string) {
        const query = `
            SELECT exam_sub_questions.question_text, exam_sub_questions.question_id, exam_sub_questions.marking_guide, exam_sub_questions.label,
            answer_markings.feedback, answer_markings.max_marks, answer_markings.awarded_marks, answer_markings.strengths, answer_markings.weaknesses, answer_markings.submission_id,
            exam_answers.submission_id, exam_answers.sub_question_id, exam_answers.answer_text,
            exam_submissions.student_id,
            exam_questions.number,
            exams.course_code, exams.title, exams.duration, exams.exam_date,
            users.full_name, users.department, users.identity
            FROM exam_questions
            INNER JOIN exam_sub_questions
            ON exam_questions.id = exam_sub_questions.question_id
            INNER JOIN answer_markings
            ON answer_markings.sub_question_id = exam_sub_questions.id
            INNER JOIN exam_answers 
            ON exam_answers.submission_id = answer_markings.sub_question_id
            INNER JOIN exam_submissions
            On exam_submissions.id = exam_answers.submission_id
            INNER JOIN exams
            ON exam_submissions.exam_id = exams.id
            INNER JOIN users
            ON exam_submissions.student_id = users.id
            WHERE exam_submissions.id = $1
        `;
        const result = await this.db.query(query, [submissionId]);
        return result.rows;
    }
}