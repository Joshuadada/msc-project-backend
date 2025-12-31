import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { ExamsRepository } from './exams.repository';

@Module({
  controllers: [ExamsController],
  providers: [ExamsService, ExamsRepository],
})
export class ExamsModule {}
