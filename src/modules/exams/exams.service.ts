import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ExamsRepository } from './exams.repository';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CreateExamDto } from './dto/create-exam.dto';

@Injectable()
export class ExamsService {
  constructor(
    private readonly examRepository: ExamsRepository,
  ) { }

  /* ============================
     CREATE EXAM (WITH QUESTIONS)
  ============================ */
  async createExam(payload: CreateExamDto) {
    if (!payload.questions || payload.questions.length === 0) {
      throw new BadRequestException({
        message: 'Exam must contain at least one question',
        error: 'InvalidExamPayload',
      });
    }

    const exam = await this.examRepository.createFullExam(payload);

    return {
      id: exam.id,
      title: exam.title,
      createdBy: exam.creator_id,
      examinerName: exam.examiner_name,
      courseCode: exam.course_code,
      duration: exam.duration,
      examDate: exam.exam_date,
      instructions: exam.instructions,
      createdAt: exam.created_at,
    };
  }

  async getAllExams() {
    const exams = await this.examRepository.getAllExams();

    return exams.map(exam => ({
      id: exam.id,
      title: exam.title,
      courseCode: exam.course_code,
      createdBy: exam.creator_id,
      examinerName: exam.examiner_name,
      duration: exam.duration,
      examDate: exam.exam_date,
      totalMarks: exam.total_marks,
      createdAt: exam.created_at,
    }));
  }

  async getExamById(id: string) {
    const exam = await this.examRepository.getExamById(id);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return {
      id: exam.id,
      title: exam.title,
      courseCode: exam.course_code,
      createdBy: exam.creator_id,
      examinerName: exam.examiner_name,
      duration: exam.duration,
      examDate: exam.exam_date,
      instructions: exam.instructions,
      totalMarks: exam.total_marks,
      createdAt: exam.created_at,
      updatedAt: exam.updated_at,

      questions: exam.questions.map(q => ({
        number: q.number,
        subQuestions: q.subQuestions.map(sq => ({
          label: sq.label,
          questionText: sq.question_text,
          marks: sq.marks,
          markingGuide: sq.marking_guide,
        })),
      })),
    };
  }

  async getExamsByCreatorId(creatorId: string) {
    const exams = await this.examRepository.getExamsByCreatorId(creatorId);
  
    if (!exams || exams.length === 0) {
      throw new NotFoundException({
        message: 'Exam not found',
        error: 'Not Found',
      });
    }
  
    return exams.map(exam => ({
      id: exam.id,
      title: exam.title,
      courseCode: exam.course_code,
      creatorId: exam.creator_id,
      examinerName: exam.examiner_name,
      duration: exam.duration,
      examDate: exam.exam_date,
      totalMarks: exam.total_marks,
      createdAt: exam.created_at,
    }));
  }

  async getExamMeta(id: string) {
    const exam = await this.examRepository.getExamById(id);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return {
      id: exam.id,
      title: exam.title,
      courseCode: exam.course_code,
      createdBy: exam.creator_id,
      examinerName: exam.examiner_name,
      duration: exam.duration,
      examDate: exam.exam_date,
      instructions: exam.instructions,
      totalMarks: exam.total_marks,
      createdAt: exam.created_at,
      updatedAt: exam.updated_at,
      totalQuestions: exam.questions.length
    };
  }

  async updateExam(id: string, payload: UpdateExamDto) {
    const updated = await this.examRepository.updateExam(id, payload);

    if (!updated) {
      throw new NotFoundException('Exam not found');
    }

    return {
      id: updated.id,
      title: updated.title,
      courseCode: updated.course_code,
      createdBy: updated.creator_id,
      examinerName: updated.examiner_name,
      duration: updated.duration,
      instructions: updated.instructions,
      examDate: updated.exam_date,
      updatedAt: updated.updated_at,
    };
  }

  async deleteExam(id: string) {
    const deleted = await this.examRepository.deleteExam(id);

    if (!deleted) {
      throw new NotFoundException('Exam not found');
    }

    return {
      message: 'Exam deleted successfully',
      examId: id,
    };
  }
}
