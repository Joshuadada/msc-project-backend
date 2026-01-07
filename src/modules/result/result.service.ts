import { Injectable, NotFoundException } from '@nestjs/common';
import { ResultRepository } from './result.repository';
import { identity } from 'rxjs';

@Injectable()
export class ResultService {
  constructor(private resultRepository: ResultRepository) { }

  async getStudentResults(studentId: string) {
    const results = await this.resultRepository.getStudentResults(studentId);

    return results.map(result => {
      const percentage =
        result.total_score > 0
          ? Math.round((result.student_total_score / result.total_score) * 100)
          : 0;

      const { grade, status } = this.calculateGrade(percentage);

      return {
        submissionId: result.submission_id,
        submissionDate: result.submitted_at,
        totalScore: result.total_score,
        studentScore: result.student_total_score,
        examId: result.exam_id,
        examTitle: result.exam_title,
        courseCode: result.course_code,
        percentage,
        grade,
        status,
      };
    });
  }

  async getRecentStudentResults(studentId: string) {
    const results = await this.resultRepository.getRecentStudentResults(studentId);

    return results.map(result => {
      const percentage =
        result.total_score > 0
          ? Math.round((result.student_total_score / result.total_score) * 100)
          : 0;

      const { grade, status } = this.calculateGrade(percentage);

      return {
        submissionId: result.submission_id,
        submissionDate: result.submitted_at,
        totalScore: result.total_score,
        studentScore: result.student_total_score,
        examId: result.exam_id,
        examTitle: result.exam_title,
        courseCode: result.course_code,
        percentage,
        grade,
        status,
      };
    });
  }

  async getStudentResultBySubmissionId(submissionId: string) {
    const results =
      await this.resultRepository.getStudentResultBySubmissionId(submissionId);

    if (!results || results.length === 0) {
      throw new NotFoundException('Student result not found');
    }

    const first = results[0];

    const studentTotalScore = results.reduce(
      (acc, result) => acc + Number(result.awarded_marks),
      0,
    );

    const totalMaxScore = results.reduce(
      (acc, result) => acc + Number(result.max_marks),
      0,
    );

    const percentage =
      totalMaxScore > 0
        ? Math.round((studentTotalScore / totalMaxScore) * 100)
        : 0;

    const { grade, status } = this.calculateGrade(percentage);

    const questions = results.reduce<
      {
        questionId: string;
        number: number;
        subQuestions: {
          subQuestionId: string;
          questionText: string;
          answerText: string;
          label: string;
          markingGuide: string;
          feedback: string;
          awardedMark: number;
          maxMark: number;
          strength: string | null;
          weaknesses: string | null;
        }[];
      }[]
    >((acc, result) => {
      let question = acc.find(
        q => q.questionId === result.question_id,
      );

      if (!question) {
        question = {
          questionId: result.question_id,
          number: result.number,
          subQuestions: [],
        };
        acc.push(question);
      }

      question.subQuestions.push({
        subQuestionId: result.sub_question_id,
        questionText: result.question_text,
        answerText: result.answer_text,
        label: result.label,
        markingGuide: result.marking_guide,
        feedback: result.feedback,
        awardedMark: Number(result.awarded_marks),
        maxMark: Number(result.max_marks),
        strength: result.strengths,
        weaknesses: result.weaknesses,
      });

      return acc;
    }, []);

    return {
      studentId: first.student_id,
      submissionId: first.submission_id,
      courseCode: first.course_code,
      examTitle: first.title,
      studentTotalScore,
      totalMaxScore,
      percentage,
      grade,
      status: status === 'PASS' ? 'Passed' : 'Failed',
      questions,
    };
  }

  async getLeturerStudentResults(lecturerId: string) {
    const results = await this.resultRepository.getLeturerStudentResults(lecturerId);

    return results.map(result => {
      const percentage =
        result.total_score > 0
          ? Math.round((result.student_total_score / result.total_score) * 100)
          : 0;

      const { grade, status } = this.calculateGrade(percentage);

      return {
        examId: result.examId,
        submissionId: result.submissionId,
        studentId: result.student_id,
        creatorId: result.creator_id,
        examTitle: result.title,
        examDate: result.exam_date,
        totalScore: result.total_score,
        studentScore: result.student_total_score,
        courseCode: result.course_code,
        fullName: result.full_name,
        identity: result.identity,
        percentage,
        grade,
        status: status === 'PASS' ? 'Passed' : 'Failed',
      };
    });
  }

  async getLecturerStudentResultBySubmissionId(submissionId: string) {
    const results =
      await this.resultRepository.getLecturerStudentResultBySubmissionId(submissionId);

    if (!results || results.length === 0) {
      throw new NotFoundException('Student result not found');
    }

    const first = results[0];

    const studentTotalScore = results.reduce(
      (acc, result) => acc + Number(result.awarded_marks),
      0,
    );

    const totalMaxScore = results.reduce(
      (acc, result) => acc + Number(result.max_marks),
      0,
    );

    const percentage =
      totalMaxScore > 0
        ? Math.round((studentTotalScore / totalMaxScore) * 100)
        : 0;

    const { grade, status } = this.calculateGrade(percentage);

    const questions = results.reduce<
      {
        questionId: string;
        number: number;
        subQuestions: {
          subQuestionId: string;
          questionText: string;
          answerText: string;
          label: string;
          markingGuide: string;
          feedback: string;
          awardedMark: number;
          maxMark: number;
          strength: string | null;
          weaknesses: string | null;
        }[];
      }[]
    >((acc, result) => {
      let question = acc.find(
        q => q.questionId === result.question_id,
      );

      if (!question) {
        question = {
          questionId: result.question_id,
          number: result.number,
          subQuestions: [],
        };
        acc.push(question);
      }

      question.subQuestions.push({
        subQuestionId: result.sub_question_id,
        questionText: result.question_text,
        answerText: result.answer_text,
        label: result.label,
        markingGuide: result.marking_guide,
        feedback: result.feedback,
        awardedMark: Number(result.awarded_marks),
        maxMark: Number(result.max_marks),
        strength: result.strengths,
        weaknesses: result.weaknesses,
      });

      return acc;
    }, []);

    return {
      studentId: first.student_id,
      submissionId: first.submission_id,
      courseCode: first.course_code,
      examTitle: first.title,
      examDate: first.exam_date,
      examDuration: first.duration,
      studentName: first.full_name,
      identity: first.identity,
      studentDepartment: first.department,
      studentTotalScore,
      totalMaxScore,
      percentage,
      grade,
      status: status === 'PASS' ? 'Passed' : 'Failed',
      questions,
    };
  }

  calculateGrade(percentage: number): { grade: string; status: 'PASS' | 'FAIL' } {
    let grade: string;

    if (percentage >= 70) grade = 'A';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 45) grade = 'D';
    else if (percentage >= 40) grade = 'E';
    else grade = 'F';

    return {
      grade,
      status: grade === 'F' ? 'FAIL' : 'PASS',
    };
  }
}
