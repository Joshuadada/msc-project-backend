import { Injectable } from '@nestjs/common';
import { LLMRawMarkingResponse } from '../interfaces/llm-marking.interface';

@Injectable()
export class MarkingReviewPolicyService {
    shouldRequireReview(
        parsed: LLMRawMarkingResponse,
        awarded: number,
        max: number,
    ): boolean {
        if (parsed.requires_human_review) return true;
        if (parsed.confidence_score < 0.7) return true;

        const percentage = (awarded / max) * 100;

        if (percentage <= 20 || percentage >= 95) return true;

        for (const t of [50, 60, 70, 80, 90]) {
            if (Math.abs(percentage - t) <= 5) return true;
        }

        return false;
    }

    getReviewReason(
        parsed: LLMRawMarkingResponse,
        awarded: number,
        max: number,
    ): string {
        const reasons: string[] = [];

        if (parsed.review_reason) {
            reasons.push(parsed.review_reason);
        }

        if (parsed.confidence_score < 0.7) {
            reasons.push('Low confidence score');
        }

        const percentage = (awarded / max) * 100;

        if (percentage <= 20) reasons.push('Very low score');
        if (percentage >= 95) reasons.push('Very high score');

        return reasons.join('; ') || 'Flagged for academic review';
    }
}
