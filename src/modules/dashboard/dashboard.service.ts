import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private dashboardRepository: DashboardRepository) {}

  async getExaminerExamCount(creatorId: string) {
    const examCount = await this.dashboardRepository.getExaminerExamCount(creatorId);
    return examCount;
  }

  async getEnrolledStudentCount(creatorId: string) {
    const studentCount = await this.dashboardRepository.getEnrolledStudentCount(creatorId);
    return studentCount;
  }

  async getAvailableExamCount() {
    const examCount = await this.dashboardRepository.getAvailableExamCount();
    return examCount;
  }
}
