import { Module } from '@nestjs/common';
import { SubmitService } from './submit.service';
import { SubmitController } from './submit.controller';
import { SubmitRepository } from './submit.repository';
import { MarkingModule } from '../marking/marking.module';

@Module({
  controllers: [SubmitController],
  providers: [SubmitService, SubmitRepository ],
  imports: [MarkingModule]
})
export class SubmitModule {}
