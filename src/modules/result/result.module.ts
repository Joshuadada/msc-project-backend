import { Module } from '@nestjs/common';
import { ResultService } from './result.service';
import { ResultController } from './result.controller';
import { ResultRepository } from './result.repository';

@Module({
  controllers: [ResultController],
  providers: [ResultService, ResultRepository],
})
export class ResultModule {}
