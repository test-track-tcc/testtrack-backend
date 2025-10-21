import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateAccessGroupDto } from './create-access-group.dto';
import { IsArray, IsString, IsUUID } from 'class-validator';

export class UpdateAccessGroupDto extends PartialType(CreateAccessGroupDto) {
    @ApiProperty()
    @IsArray()
    @IsUUID("all", { each: true })
    permissionIds?: string[];
}
