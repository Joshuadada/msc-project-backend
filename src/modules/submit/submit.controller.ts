import { Body, Controller, Post, Req } from '@nestjs/common';
import { SubmitService } from './submit.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SubmitExamDto } from './dto/submit-exam-dto';

@ApiTags('submit')
@ApiBearerAuth()
@Controller('submit')
export class SubmitController {
  constructor(private readonly submitService: SubmitService) { }

  @Post()
  @ApiOperation({ summary: 'Submit exam' })
  @ApiResponse({ status: 201, description: 'Exam submitted successfully' })
  async createExam(
    @Body() payload: SubmitExamDto,
    @Req() req: any
  ) {
    return this.submitService.createSubmission(payload);
  }
}
