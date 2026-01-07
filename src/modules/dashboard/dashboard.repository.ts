import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class DashboardRepository {
    constructor(private readonly db: DatabaseService) { }

    // GET EXAMINER EXAM COUNT
    async getExaminerExamCount(creatorId: string) {
        const result = await this.db.query(
            `
        SELECT COUNT(*) AS count
        FROM exams
        WHERE creator_id = $1
        `,
            [creatorId],
        );

        return Number(result.rows[0].count);
    }

    // GET ENROLLED STUDENT COUNT
    async getEnrolledStudentCount(creatorId: string) {
        const query = `
            SELECT COUNT(DISTINCT es.student_id) AS student_count
            FROM exam_submissions es
            INNER JOIN exams e ON e.id = es.exam_id
            WHERE e.creator_id = $1
        `;

        const result = await this.db.query(query, [creatorId]);
        return Number(result.rows[0].student_count);
    }

    // GET AVAILABLE EXAM COUNT
    async getAvailableExamCount() {
        const result = await this.db.query(
            `
        SELECT COUNT(*) AS count
        FROM exams
        `
        );

        return Number(result.rows[0].count);
    }

    async getAttemptedExamCount(studentId: string) {
        const result = await this.db.query(
            `
        SELECT COUNT(*) AS count
        FROM exam_submissions
        WHERE student_id = $1
        `, [studentId]
        );

        return Number(result.rows[0].count);
    }

    async getAverageStudentScore(studentId: string) {
        const result = await this.db.query(
            `
        SELECT total_score, student_total_score
        FROM exam_submissions
        WHERE student_id = $1
        `,
            [studentId]
        );

        return result.rows;
    }
}