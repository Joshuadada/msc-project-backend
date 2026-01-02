import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MarkingModule } from './modules/marking/marking.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ExamsModule } from './modules/exams/exams.module';
import { SubmitModule } from './modules/submit/submit.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    MarkingModule,
    ExamsModule,
    SubmitModule,
    DashboardModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
