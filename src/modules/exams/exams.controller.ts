import {
  Controller,
  Post,
  Body,
  Delete,
  Get,
  Param,
  Put,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@ApiTags('exams')
@ApiBearerAuth()
@Controller('exams')
export class ExamsController {
  constructor(
    private readonly examsService: ExamsService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new exam' })
  @ApiResponse({ status: 201, description: 'Exam created successfully' })
  async createExam(
    @Body() payload: CreateExamDto,
  ) {
    return this.examsService.createExam(payload);
  }

  /* =========================
     GET ALL EXAMS
  ========================== */
  @Get()
  @ApiOperation({ summary: 'Get all exams' })
  @ApiResponse({ status: 200, description: 'List of exams' })
  async getAllExams() {
    return this.examsService.getAllExams();
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent exams' })
  @ApiResponse({ status: 200, description: 'List of exams' })
  async getRecentExams() {
    return this.examsService.getRecentExams();
  }

  @Get('logged-in-lecturer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get exams created by the logged-in lecturer' })
  @ApiResponse({ status: 200, description: 'List of exams' })
  async getMyExams(@Req() req: any) {
    return this.examsService.getExamsByCreatorId(req.user.id);
  }

  @Get('logged-in-lecturer/recent')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent exams created by the logged-in lecturer' })
  @ApiResponse({ status: 200, description: 'List of exams' })
  async getMyRecentExams(@Req() req: any) {
    return this.examsService.getRecentExamsByCreatorId(req.user.id);
  }

  /* =========================
     GET EXAM BY ID (FULL)
  ========================== */
  @Get(':id')
  @ApiOperation({ summary: 'Get exam by ID (with questions)' })
  @ApiResponse({ status: 200, description: 'Exam details' })
  async getExamById(@Param('id') id: string) {
    return this.examsService.getExamById(id);
  }

  @Get('meta/:id')
  @ApiOperation({ summary: 'Get exam by ID (without questions)' })
  @ApiResponse({ status: 200, description: 'Exam details' })
  async getExamMeta(@Param('id') id: string) {
    return this.examsService.getExamMeta(id);
  }

  /* =========================
     UPDATE EXAM
  ========================== */
  @Put(':id')
  @ApiOperation({ summary: 'Update exam metadata' })
  @ApiResponse({ status: 200, description: 'Exam updated successfully' })
  async updateExam(
    @Param('id') id: string,
    @Body() payload: UpdateExamDto,
  ) {
    return this.examsService.updateExam(id, payload);
  }

  /* =========================
     DELETE EXAM
  ========================== */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an exam' })
  @ApiResponse({ status: 200, description: 'Exam deleted successfully' })
  async deleteExam(@Param('id') id: string) {
    return this.examsService.deleteExam(id);
  }
}
