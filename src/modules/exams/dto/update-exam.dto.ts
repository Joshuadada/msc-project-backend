import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNumber,
    Min,
    IsDateString,
} from 'class-validator';

export class UpdateExamDto {
    @ApiProperty({ example: 'Software Engineering' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'CSC 201' })
    @IsString()
    courseCode: string;

    @ApiProperty({ example: 'Dr. Igbalaye Samuel', description: 'Name of the lecturer creating the exam' })
    @IsString()
    examinerName: string;  // new field

    @ApiProperty({
        example: '<p><strong>Instructions</strong></p>',
        description: 'HTML instructions',
    })
    @IsString()
    instructions: string;

    @ApiProperty({ example: 60 })
    @IsNumber()
    @Min(1)
    duration: number;

    @ApiProperty({ example: '2026-01-15T10:00:00Z', description: 'Date and time when the exam will take place' })
    @IsDateString()
    examDate: string;
}
