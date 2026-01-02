// marking.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MarkingGuide } from './interfaces/marking-guild.interface';
import { MarkingResult } from './interfaces/marking-result.interface';
import { StudentAnswer } from './interfaces/student-answer.interface';
import { LLMMarkingService } from './llm/llm-marking.service';
import { MarkingRepository } from './marking.repository';

@Injectable()
export class MarkingService {
  private readonly logger = new Logger(MarkingService.name);

  constructor(
    private readonly repo: MarkingRepository,
    private readonly llmService: LLMMarkingService,
  ) { }

  async markSubmission(submissionId: string) {
    try {
      this.logger.log(`Starting to mark submission: ${submissionId}`);

      // 1. Fetch all student answers for this submission
      const rows = await this.repo.getSubmissionAnswers(submissionId);
      this.logger.log(`Found ${rows.length} answers to mark`);

      if (!rows || rows.length === 0) {
        this.logger.warn(`No answers found for submission ${submissionId}`);
        return [];
      }

      const results: MarkingResult[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        this.logger.log(`Processing answer ${i + 1}/${rows.length}: ${row.id}`);

        try {
          const studentAnswer: StudentAnswer = {
            id: row.id,
            question_id: row.question_id,
            sub_question_id: row.sub_question_id,
            question_html: row.question_html || '',
            student_answer_html: row.answer_text || '',
            max_marks: row.marks,
          };

          const guide: MarkingGuide = {
            id: row.sub_question_db_id,
            question_id: row.question_id,
            sub_question_id: row.sub_question_id,
            marking_scheme_html: row.marking_guide || '',
          };

          this.logger.debug(`Student answer: ${JSON.stringify(studentAnswer, null, 2)}`);
          this.logger.debug(`Marking guide: ${JSON.stringify(guide, null, 2)}`);

          // 2. Send to LLM for marking
          const markingResult = await this.llmService.markSubQuestion(studentAnswer, guide);
          await this.repo.saveMarkingResult(markingResult, submissionId);
          results.push(markingResult);

          this.logger.log(
            `✅ Marked answer ${studentAnswer.id}: ${markingResult.awarded_marks}/${studentAnswer.max_marks}`,
          );
        } catch (error) {
          this.logger.error(`❌ Error marking answer ${row.id}:`, error.message);
          this.logger.error(error.stack);
          // Continue with next answer
        }
      }

      this.logger.log(`Completed marking submission ${submissionId}. Marked ${results.length}/${rows.length} answers`);
      return results;
    } catch (error) {
      this.logger.error(`Fatal error marking submission ${submissionId}:`, error.message);
      this.logger.error(error.stack);
      throw error;
    }
  }
}