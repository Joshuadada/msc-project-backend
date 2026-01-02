import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MarkingService } from './marking.service';
import { MarkingRepository } from './marking.repository';
import { LLMMarkingService } from './llm/llm-marking.service';
import { PromptBuilderService } from './llm/prompt-builder.service';
import { LLMResponseParserService } from './llm/llm-response-parser.service';
import { MarkingReviewPolicyService } from './llm/marking-review-policy.service';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    MarkingService,
    MarkingRepository,
    LLMMarkingService,
    PromptBuilderService,
    LLMResponseParserService,
    MarkingReviewPolicyService,
  ],
  exports: [MarkingService, LLMMarkingService],
})
export class MarkingModule {}