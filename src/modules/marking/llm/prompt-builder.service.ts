import { Injectable } from "@nestjs/common";
import { StudentAnswer } from "../interfaces/student-answer.interface";
import { MarkingGuide } from "../interfaces/marking-guild.interface";

@Injectable()
export class PromptBuilderService {
  buildMarkingPrompt(
    answer: StudentAnswer,
    guide: MarkingGuide,
  ): string {
    return `
  You are an expert academic marker.
  
  ## QUESTION
  ${answer.question_html}
  
  ## MARKING SCHEME
  ${guide.marking_scheme_html}
  
  ## STUDENT ANSWER
  ${answer.student_answer_html}
  
  ## MAX MARKS
  ${answer.max_marks}
  
  ## INSTRUCTIONS
  - Use the marking scheme strictly
  - Feedback MUST be valid HTML
  - Award marks between 0 and ${answer.max_marks}
  - Be fair and consistent
  
  ## RESPONSE FORMAT (JSON ONLY)
  {
    "awarded_marks": number,
    "confidence_score": number,
    "feedback": "<html>...</html>",
    "strengths": string[],
    "weaknesses": string[],
    "requires_human_review": boolean,
    "review_reason": string | null
  }
  `;
  }

}
