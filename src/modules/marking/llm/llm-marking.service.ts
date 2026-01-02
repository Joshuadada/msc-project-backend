// llm-marking.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

import { StudentAnswer } from '../interfaces/student-answer.interface';
import { MarkingGuide } from '../interfaces/marking-guild.interface';
import { MarkingResult } from '../interfaces/marking-result.interface';

import { PromptBuilderService } from './prompt-builder.service';
import { LLMResponseParserService } from './llm-response-parser.service';
import { MarkingReviewPolicyService } from './marking-review-policy.service';

@Injectable()
export class LLMMarkingService {
  private readonly logger = new Logger(LLMMarkingService.name);
  private readonly client: GoogleGenAI;

  constructor(
    private readonly promptBuilder: PromptBuilderService,
    private readonly parser: LLMResponseParserService,
    private readonly reviewPolicy: MarkingReviewPolicyService,
  ) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    this.client = new GoogleGenAI({})
  }

  async markSubQuestion(
    answer: StudentAnswer,
    guide: MarkingGuide,
  ): Promise<MarkingResult> {
    try {
      this.logger.log(
        `Marking sub-question ${answer.sub_question_id} (answer ${answer.id})`,
      );

      const prompt = this.promptBuilder.buildMarkingPrompt(answer, guide);
      this.logger.debug(`Prompt built, length: ${prompt.length} chars`);

      this.logger.debug('Calling Gemini API...');
      const startTime = Date.now();

      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        config: {
          temperature: 0,
          maxOutputTokens: 10000,
          responseMimeType: 'application/json',
        },
      });

      const processingTime = Date.now() - startTime;
      this.logger.debug(`Gemini API responded in ${processingTime}ms`);

      const textResponse = response.text;

      if (!textResponse) {
        throw new Error('Empty response from Gemini API');
      }

      this.logger.debug(
        `Response text: ${textResponse.substring(0, 200)}...`,
      );

      // Parse structured JSON from LLM
      this.logger.debug('Parsing response...');
      const parsed = this.parser.parse(textResponse);

      const awardedMarks = Math.min(
        Math.max(0, parsed.awarded_marks),
        answer.max_marks,
      );

      const requiresReview = this.reviewPolicy.shouldRequireReview(
        parsed,
        awardedMarks,
        answer.max_marks,
      );

      const markingResult: MarkingResult = {
        student_answer_id: answer.id,
        question_id: answer.question_id,
        sub_question_id: answer.sub_question_id,
        marking_guide_id: guide.id,

        llm_provider: 'google',
        llm_model: 'gemini-1.5-flash',

        awarded_marks: awardedMarks,
        max_marks: answer.max_marks,

        confidence_score: parsed.confidence_score,

        question: answer.question_html,
        studentAnswer: answer.student_answer_html,

        feedback: parsed.feedback,
        strengths: parsed.strengths ?? [],
        weaknesses: parsed.weaknesses ?? [],

        requires_human_review: requiresReview,
        review_reason: requiresReview
          ? this.reviewPolicy.getReviewReason(
            parsed,
            awardedMarks,
            answer.max_marks,
          )
          : null,

        request_payload: {
          prompt,
        },

        response_payload: {
          text: textResponse,
          usageMetadata: response.usageMetadata,
          modelVersion: response.modelVersion,
        },

        processing_time_ms: processingTime,
      };

      this.logger.log(
        `✅ Successfully marked answer ${answer.id}: ${awardedMarks}/${answer.max_marks}`,
      );

      return markingResult;
    } catch (error: any) {
      this.logger.error(
        `Error marking sub-question ${answer.sub_question_id}`,
        error,
      );

      if (error?.message?.toLowerCase().includes('quota')) {
        this.logger.error(
          'Gemini quota exceeded. Check usage at https://aistudio.google.com/app/apikey',
        );
      }

      throw error;
    }
  }
}
