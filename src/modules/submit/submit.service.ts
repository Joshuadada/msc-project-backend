import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SubmitExamDto } from './dto/submit-exam-dto';
import { SubmitRepository } from './submit.repository';
import { MarkingService } from '../marking/marking.service';
import { MarkingResult } from '../marking/interfaces/marking-result.interface';

@Injectable()
export class SubmitService {
    private readonly logger = new Logger(SubmitService.name);

    constructor(
        private readonly repository: SubmitRepository,
        private readonly markingService: MarkingService,
    ) { }

    async createSubmission(payload: SubmitExamDto) {
        if (!payload.answers || payload.answers.length === 0) {
            throw new BadRequestException({
                message: 'Submission must contain at least one answer',
                error: 'InvalidSubmissionPayload',
            });
        }

        try {
            // 1. Save submission in the database
            const { submission, answers } = await this.repository.submitExam(payload);

            this.logger.log(`Submission ${submission.id} saved for student ${submission.student_id}`);

            // 2. Immediately mark the submission
            const markingResults: MarkingResult[] = await this.markingService.markSubmission(submission.id);

            this.logger.log(
                `Submission ${submission.id} marked successfully for student ${submission.student_id}`,
            );

            return {
                id: submission.id,
                examId: submission.exam_id,
                studentId: submission.student_id,
                submittedAt: submission.submitted_at,
                answers: markingResults, // now contains awarded marks, feedback, etc.
            };
        } catch (error: any) {
            // Handle duplicate submission error
            if (error?.response?.error === 'DuplicateSubmission') {
                throw new BadRequestException({
                    message: 'You have already submitted this exam',
                    error: 'DuplicateSubmission',
                });
            }
            throw error; // rethrow other errors
        }
    }
}
