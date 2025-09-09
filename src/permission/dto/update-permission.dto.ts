import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-permission.dto';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) { 
    // Se isso herda todas as propriedades de createpermissiondto, então o user id também pode ser passado?
    
    // UpdatePermissionDto herda de CreatePermissionDto por utilizar PartialType transforma todos os campos em opcionais.
    // Id é passado como parâmetro na rota para identificar a permissão a ser atualizada. 
}
