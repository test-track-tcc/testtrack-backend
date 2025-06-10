import { Injectable } from '@nestjs/common';
import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseStatusDto } from './dto/update-test-case.dto';

@Injectable()
export class TestCasesService {
  create(createTestCaseDto: CreateTestCaseDto) {
    return 'This action adds a new testCase';
  }

  findAll() {
    return `This action returns all testCase`;
  }

  findOne(id: number) {
    return `This action returns a #${id} testCase`;
  }

  update(id: number, updateTestCaseDto: UpdateTestCaseStatusDto) {
    return `This action updates a #${id} testCase`;
  }

  remove(id: number) {
    return `This action removes a #${id} testCase`;
  }
}
