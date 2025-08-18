import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateOrganizationDto } from './create-organization.dto';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
    // UpdateOrganizationDto herda de CreateOrganizationDto por utilizar PartialType transforma todos os campos em opcionais.
    @ApiProperty({ description: 'ID da organização a ser atualizada' })
    id: string; // Adiciona o campo id para identificar a organização a ser atualizada.
    // O id é necessário para que o serviço possa localizar a organização correta no banco de dados
}
