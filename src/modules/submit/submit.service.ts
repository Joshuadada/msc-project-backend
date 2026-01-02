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

        // STEP 1: Save submission + answers (status = PENDING)
        const { submission } = await this.repository.submitExam(payload);

        this.logger.log(
            `Submission ${submission.id} saved (PENDING) for student ${submission.student_id}`,
        );

        try {
            // STEP 2: Run AI marking
            const markingResults: MarkingResult[] =
                await this.markingService.markSubmission(submission.id);

            // STEP 3: Compute total score
            const studentTotalScore = markingResults.reduce(
                (sum, r) => sum + (r.awarded_marks ?? 0),
                0,
            );

            const totalScore = markingResults.reduce(
                (sum, r) => sum + (r.max_marks ?? 0),
                0,
            );
            

            // STEP 4: Mark submission as SUCCESS
            await this.repository.markSubmissionSuccess(
                submission.id,
                studentTotalScore,
                totalScore,
            );

            this.logger.log(
                `Submission ${submission.id} marked successfully (score: ${totalScore})`,
            );

            return {
                id: submission.id,
                examId: submission.exam_id,
                studentId: submission.student_id,
                submittedAt: submission.submitted_at,
                status: 'MARKED',
                totalScore,
                answers: markingResults,
            };
        } catch (error: any) {
            // STEP 5: Mark submission as FAILED
            const reason =
                error?.message || 'AI marking failed unexpectedly';

            await this.repository.markSubmissionFailed(
                submission.id,
                reason,
            );

            this.logger.error(
                `Submission ${submission.id} marking failed`,
                error?.stack,
            );

            return {
                id: submission.id,
                examId: submission.exam_id,
                studentId: submission.student_id,
                submittedAt: submission.submitted_at,
                status: 'FAILED',
                error: 'MARKING_FAILED',
                message:
                    'Submission saved but marking failed. It will be retried or reviewed.',
            };
        }
    }
}
