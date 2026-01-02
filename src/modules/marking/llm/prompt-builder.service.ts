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

## QUESTION (ID: ${answer.question_id}, Sub-question ID: ${answer.sub_question_id})
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
- Identify key points present and any missing points

## RESPONSE FORMAT (JSON ONLY)
{
  "awarded_marks": 0, 
  "confidence_score": 0.0,
  "feedback": "<html>Feedback here</html>",
  "strengths": ["list strengths here"],
  "weaknesses": ["list weaknesses here"],
  "key_points_identified": ["list key points present"],
  "missing_points": ["list missing points"],
  "requires_human_review": false,
  "review_reason": null
}
`;
  }
}
