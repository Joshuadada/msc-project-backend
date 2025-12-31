import { Injectable, Logger } from "@nestjs/common";
import { AnthropicClientService } from "./anthropic-client.service";
import { PromptBuilderService } from "./prompt-builder.service";
import { LLMResponseParserService } from "./llm-response-parser.service";
import { MarkingReviewPolicyService } from "./marking-review-policy.service";
import { MarkingResult } from "../interfaces/marking-result.interface";
import { StudentAnswer } from "../interfaces/student-answer.interface";
import { MarkingGuide } from "../interfaces/marking-guild.interface";

@Injectable()
export class LLMMarkingService {
  private readonly logger = new Logger(LLMMarkingService.name);

  constructor(
    private readonly anthropicClient: AnthropicClientService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly parser: LLMResponseParserService,
    private readonly reviewPolicy: MarkingReviewPolicyService,
  ) { }

  async markSubQuestion(
    answer: StudentAnswer,
    guide: MarkingGuide,
  ): Promise<MarkingResult> {

    this.logger.log(
      `Marking sub-question ${answer.sub_question_id} (answer ${answer.id})`,
    );

    const prompt = this.promptBuilder.buildMarkingPrompt(answer, guide);

    const response = await this.anthropicClient.complete(prompt);

    const parsed = this.parser.parse(response.text);

    const awardedMarks = Math.min(
      Math.max(0, parsed.awarded_marks),
      answer.max_marks,
    );

    const requiresReview = this.reviewPolicy.shouldRequireReview(
      parsed,
      awardedMarks,
      answer.max_marks,
    );

    return {
      student_answer_id: answer.id,
      question_id: answer.question_id,
      sub_question_id: answer.sub_question_id,

      marking_guide_id: guide.id,

      llm_model: response.model,
      llm_provider: 'anthropic',

      awarded_marks: awardedMarks,
      max_marks: answer.max_marks,

      confidence_score: parsed.confidence_score,

      feedback: parsed.feedback, // HTML
      strengths: parsed.strengths ?? [],
      weaknesses: parsed.weaknesses ?? [],

      requires_human_review: requiresReview,
      review_reason: requiresReview
        ? this.reviewPolicy.getReviewReason(parsed, awardedMarks, answer.max_marks)
        : null,

      request_payload: { prompt },
      response_payload: response.rawResponse,
      processing_time_ms: response.processingTime,
    };
  }
}
