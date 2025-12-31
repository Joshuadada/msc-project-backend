import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNumber,
    Min,
    ValidateNested,
    ArrayMinSize,
    IsUUID,
    IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';

export class CreateExamDto {
    @ApiProperty({ example: 'Software Engineering' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'CSC 201' })
    @IsString()
    courseCode: string;

    @ApiProperty({ example: 'd290f1ee-6c54-4b01-90e6-d701748f0851', description: 'UUID of the creator' })
    @IsUUID()
    creatorId: string;

    @ApiProperty({ example: 'Dr. Igbalaye Samuel', description: 'Name of the lecturer creating the exam' })
    @IsString()
    examinerName: string;

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

    @ApiProperty({ type: [CreateQuestionDto] })
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    @ArrayMinSize(1)
    questions: CreateQuestionDto[];

    @ApiProperty({ example: '2026-01-15T10:00:00Z', description: 'Date and time when the exam will take place' })
    @IsDateString()
    examDate: string; // new field for the exam date
}
