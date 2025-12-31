import { ApiProperty } from '@nestjs/swagger';
import {
    IsNumber,
    ValidateNested,
    ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSubQuestionDto } from './create-sub-question.dto';

export class CreateQuestionDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    number: number;

    @ApiProperty({ type: [CreateSubQuestionDto] })
    @ValidateNested({ each: true })
    @Type(() => CreateSubQuestionDto)
    @ArrayMinSize(1)
    subQuestions: CreateSubQuestionDto[];
}
