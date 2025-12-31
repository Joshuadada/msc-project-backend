import { Injectable, Logger } from '@nestjs/common';
import { LLMRawMarkingResponse } from '../interfaces/llm-marking.interface';

@Injectable()
export class LLMResponseParserService {
    private readonly logger = new Logger(LLMResponseParserService.name);

    parse(responseText: string): LLMRawMarkingResponse {
        try {
            let clean = responseText
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            const match = clean.match(/\{[\s\S]*\}/);
            if (!match) {
                throw new Error('No JSON object found');
            }

            const parsed = JSON.parse(match[0]);

            this.validate(parsed);
            return parsed;
        } catch (err) {
            this.logger.error('LLM response parsing failed');
            this.logger.debug(responseText);
            throw err;
        }
    }

    private validate(data: any) {
        if (typeof data.awarded_marks !== 'number') {
            throw new Error('awarded_marks must be a number');
        }

        if (typeof data.confidence_score !== 'number') {
            throw new Error('confidence_score must be a number');
        }

        if (typeof data.feedback !== 'string') {
            throw new Error('feedback must be HTML string');
        }
    }
}
