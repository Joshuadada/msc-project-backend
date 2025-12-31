import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class SubQuestionAnswerDto {
    @ApiProperty({ example: 'd290f1ee-6c54-4b01-90e6-d701748f0851' })
    @IsUUID()
    subQuestionId: string;

    @ApiProperty({ example: 'My answer here' })
    @IsString()
    answerText: string;
}

export class SubmitExamDto {
    @ApiProperty({ example: 'd290f1ee-6c54-4b01-90e6-d701748f0851' })
    @IsUUID()
    examId: string;

    @ApiProperty({ example: 'd290f1ee-6c54-4b01-90e6-d701748f0851' })
    @IsUUID()
    studentId: string;

    @ApiProperty({ type: [SubQuestionAnswerDto] })
    @ValidateNested({ each: true })
    @Type(() => SubQuestionAnswerDto)
    @ArrayMinSize(1)
    answers: SubQuestionAnswerDto[];
}
