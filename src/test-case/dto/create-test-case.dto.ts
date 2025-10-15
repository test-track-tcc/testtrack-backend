import { IsString, IsEnum, IsUUID, IsOptional, IsArray, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { TestType, Priority, TestCaseStatus, FunctionalTestFramework } from '../../config/enums';
import { DeviceType } from 'src/enum/deviceType';

export class CreateTestCaseDto {
  @ApiProperty({ description: 'Title of the test case', example: 'Validate feature X' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Detailed description of the test case', example: 'Complete description of steps and context.' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Type of the test', enum: TestType, example: TestType.FUNCIONAL })
  @IsEnum(TestType)
  testType: TestType;

  @ApiPropertyOptional({ description: 'ID do tipo de teste personalizado' })
  @IsOptional()
  @IsUUID()
  customTestTypeId?: string;

  @ApiProperty({ description: 'Priority of the test case', enum: Priority, example: Priority.HIGH })
  @IsEnum(Priority)
  priority: Priority;

  @ApiProperty({ description: 'ID of the user creating the test case' })
  @IsUUID()
  @IsNotEmpty()
  createdById: string;

  @ApiProperty({ description: 'ID of the project the test case belongs to' })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ description: 'ID of the responsible user', required: false })
  @IsUUID()
  @IsOptional()
  responsibleId?: string;

  @ApiProperty({ description: 'Estimated time for execution (e.g., "1h30m")', required: false })
  @IsOptional()
  @IsString()
  estimatedTime?: string;

  @ApiProperty({ description: 'Detailed steps for test execution' })
  @IsString()
  steps: string;

  @ApiProperty({ description: 'Expected result of the test' })
  @IsString()
  expectedResult: string;

  @ApiProperty({ description: 'Linked requirement ID or description', required: false })
  @IsOptional()
  @IsString()
  taskLink?: string;

  @ApiProperty({ description: 'Initial status of the test case', enum: TestCaseStatus, default: TestCaseStatus.PENDING, required: false })
  @IsOptional()
  @IsEnum(TestCaseStatus)
  status?: TestCaseStatus;

  @ApiProperty({ description: 'Comments', type: Object, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  comments?: { idUser: string; comment: string; date: Date }[];

  @ApiProperty({ description: 'Attachments (URLs or file IDs)', type: String, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiProperty({ description: 'Test-related scripts', type: 'string', isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scripts?: string[];

  @IsUUID()
  @IsOptional()
  testScenarioId?: string;

  @ApiPropertyOptional({ description: 'Target device for the test', enum: DeviceType, example: DeviceType.DESKTOP })
  @IsOptional()
  @IsEnum(DeviceType)
  targetDevice?: DeviceType;

  @ApiPropertyOptional({ description: 'Custom target device if "Other" is selected', example: 'Smart TV' })
  @IsOptional()
  @IsString()
  customTargetDevice?: string;

  @ApiPropertyOptional({ description: 'Framework para teste funcional', enum: FunctionalTestFramework })
  @IsOptional()
  @IsEnum(FunctionalTestFramework)
  functionalFramework?: FunctionalTestFramework;
}