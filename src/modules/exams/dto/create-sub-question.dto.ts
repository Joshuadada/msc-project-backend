import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class CreateSubQuestionDto {
    @ApiProperty({ example: 'a' })
    @IsString()
    label: string;

    @ApiProperty({
        example: '<p>What is software?</p>',
    })
    @IsString()
    questionText: string;

    @ApiProperty({ example: 12 })
    @IsNumber()
    @Min(0)
    marks: number;

    @ApiProperty({
        example: '<p>Definition, examples, explanation</p>',
    })
    @IsString()
    markingGuide: string;
}
