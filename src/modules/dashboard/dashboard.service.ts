import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private dashboardRepository: DashboardRepository) { }

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

  async getAttemptedExamCount(studentId: string) {
    const examCount = await this.dashboardRepository.getAttemptedExamCount(studentId);
    return examCount;
  }

  async getAverageStudentScore(studentId: string) {
    const result = await this.dashboardRepository.getAverageStudentScore(studentId);
    const averagePercentage =
      result.length > 0
        ? result.reduce(
          (sum, item) =>
            sum + (item.student_total_score / item.total_score) * 100,
          0
        ) / result.length
        : 0;

    return `${Math.round(averagePercentage) || 0}%`;
  }
}
