import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateAccessGroupDto } from './create-access-group.dto';
import { IsArray, IsString, IsUUID } from 'class-validator';

export class UpdateAccessGroupDto extends PartialType(CreateAccessGroupDto) {
    // Se isso herda todas as propriedades de createaccessgroupdto, então o user id também pode ser passado?

    // UpdateAccessGroupDto herda de CreateAccessGroupDto por utilizar PartialType transforma todos os campos em opcionais.
    // Id é passado como parâmetro na rota para identificar o grupo de acesso a ser atualizado.
    @ApiProperty()
    @IsArray()
    @IsUUID("all", { each: true })
    permissionIds?: string[];
}
