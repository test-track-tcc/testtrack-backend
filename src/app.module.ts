import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TestCasesModule } from './test-case/test-case.module';
import { ProjectsModule } from './projects/projects.module';
import { OrganizationModule } from './organization/organization.module';
import { AuthModule } from './auth/auth.module';
import { PermissionModule } from './permission/permission.module';
import { AccessGroupModule } from './access-group/access-group.module';
import { CustomTestTypesModule } from './custom-test-types/custom-test-type.module';
import { ReportsModule } from './reports/reports.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PdfGeneratorModule } from './pdf-generator/pdf-generator.module';
import { TestScenarioModule } from './test-scenario/test-scenario.module';
import { CommentModule } from './comment/comment.module';
import { NotificationModule } from './notification/notification.module';
import { BugsModule } from './bugs/bugs.module';
import { ChartsModule } from './charts/charts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/api/uploads',
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
    UsersModule,
    TestCasesModule,
    ProjectsModule,
    OrganizationModule,
    AuthModule,
    PermissionModule,
    AccessGroupModule,
    CustomTestTypesModule,
    ReportsModule,
    ScheduleModule.forRoot(),
    PdfGeneratorModule,
    TestScenarioModule,
    CommentModule,
    BugsModule,
    NotificationModule,
    BugsModule,
    ChartsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}