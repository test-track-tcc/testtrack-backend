import { Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Busca as notificações do usuário logado' })
  async getMyNotifications(@Req() req) {
    const userId = req.user.id;
    return this.notificationService.getUserNotifications(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marca uma notificação como lida' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }
}