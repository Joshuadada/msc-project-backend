import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ResultService } from './result.service';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('result')
@ApiBearerAuth()
@Controller('result')
export class ResultController {
  constructor(private readonly resultService: ResultService) { }

  @Get('student-results')
  @ApiOperation({ summary: 'student results' })
  @ApiResponse({ status: 200, description: 'List of student results' })
  async getStudentResults(@Req() req: any) {
    return this.resultService.getStudentResults(req.user.id);
  }

  @Get('student-results/recent')
  @ApiOperation({ summary: 'recentstudent results' })
  @ApiResponse({ status: 200, description: 'List of recent student results' })
  async getRecentStudentResults(@Req() req: any) {
    return this.resultService.getRecentStudentResults(req.user.id);
  }

  @Get('student-results/:submissionId')
  @ApiOperation({ summary: 'student result by submission id' })
  @ApiResponse({ status: 200, description: 'student result by submission id' })
  async getStudentResultBySubmissionId(@Param('submissionId') id: string) {
    return this.resultService.getStudentResultBySubmissionId(id);
  }

  @Get('lecturer-student-results')
  @ApiOperation({ summary: 'lecturer student results' })
  @ApiResponse({ status: 200, description: 'List of lecturer student results' })
  async getLeturerStudentResults(@Req() req: any) {
    return this.resultService.getLeturerStudentResults(req.user.id);
  }

  @Get('lecturer-student-results/:submissionId')
  @ApiOperation({ summary: 'lecturer student result by submission id' })
  @ApiResponse({ status: 200, description: 'lecturer student result by submission id' })
  async getLecturerStudentResultBySubmissionId(@Param('submissionId') id: string) {
    return this.resultService.getLecturerStudentResultBySubmissionId(id);
  }
}
