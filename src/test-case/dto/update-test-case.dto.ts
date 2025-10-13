import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TestCaseStatus } from '../../config/enums';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTestCaseDto } from './create-test-case.dto';
import { ValidateIf,IsUUID } from 'class-validator';

export class UpdateTestCaseStatusDto {
  @ApiProperty({ description: 'Novo status do caso de teste', enum: TestCaseStatus, example: TestCaseStatus.APPROVED })
  @IsEnum(TestCaseStatus)
  newStatus: TestCaseStatus;

  @ApiProperty({ description: 'Comentário opcional sobre a mudança de status', example: 'Teste aprovado após correção do bug.', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @ValidateIf((object, value) => value !== null)
  @IsUUID()
  testScenarioId?: string | null;
}
export class UpdateTestCaseDto extends PartialType(CreateTestCaseDto) {}