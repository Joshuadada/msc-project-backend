import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('examiner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get examiner dashboard data' })
  @ApiResponse({ status: 200, description: 'Examiner dashboard data' })
  async getExaminerDashboard(@Req() req: any) {
    const examCount = await this.dashboardService.getExaminerExamCount(req.user.id);
    const studentCount = await this.dashboardService.getEnrolledStudentCount(req.user.id);

    return { examCount, studentCount }
  }

  @Get('student')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student dashboard data' })
  @ApiResponse({ status: 200, description: 'Student dashboard data' })
  async getStudentDashboard(@Req() req: any) {
    const availableExamCount = await this.dashboardService.getAvailableExamCount();
    // const studentCount = await this.dashboardService.getEnrolledStudentCount(req.user.id);

    return { availableExamCount, attemptedExamCount: 2, averageScore: "50%" }
  }
}
