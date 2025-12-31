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
  ) {}

  async markSubmission(submissionId: string) {
    // 1. Fetch all student answers for this submission
    const rows = await this.repo.getSubmissionAnswers(submissionId);

    const results: MarkingResult[] = [];

    for (const row of rows) {
      const studentAnswer: StudentAnswer = {
        id: row.id,
        question_id: row.question_id,
        sub_question_id: row.sub_question_id,
        question_html: row.question_html,             // HTML from exam_sub_questions.marking_guide
        student_answer_html: row.answer_text,         // HTML from exam_answers.answer_text
        max_marks: row.max_marks,
      };

      const guide: MarkingGuide = {
        id: row.id,
        question_id: row.question_id,
        sub_question_id: row.sub_question_id,
        marking_scheme_html: row.marking_guide
      };

      // 2. Send to LLM for marking
      const markingResult = await this.llmService.markSubQuestion(studentAnswer, guide);
      results.push(markingResult);

      // 3. Update score & feedback in DB
      await this.repo.updateAnswerScore(
        markingResult.student_answer_id,
        markingResult.awarded_marks,
        markingResult.feedback, // HTML
      );

      this.logger.log(
        `Marked answer ${studentAnswer.id}: ${markingResult.awarded_marks}/${studentAnswer.max_marks}`,
      );
    }

    return results;
  }
}
