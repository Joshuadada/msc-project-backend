// llm-response-parser.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { LLMRawMarkingResponse } from '../interfaces/llm-marking.interface';

@Injectable()
export class LLMResponseParserService {
    private readonly logger = new Logger(LLMResponseParserService.name);

    parse(responseText: string) {
        // Remove code fences if present
        let cleaned = responseText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();

        // Remove newlines that can break JSON
        cleaned = cleaned.replace(/\r?\n/g, ' ');

        // Attempt to parse
        try {
            return JSON.parse(cleaned);
        } catch (err) {
            this.logger.error('Failed parsing LLM response JSON', err);
            this.logger.error('Response text (first 500 chars):', cleaned.slice(0, 500));
            throw new Error('No JSON object found in LLM response');
        }
    }
}