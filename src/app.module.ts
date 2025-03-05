import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListModule } from './list/list.module';
import { CardModule } from './card/card.module';
import { GatewayGateway } from './gateway/gateway.gateway';
import { BoardModule } from './board/board.module';
import { CommentModule } from './comment/comment.module';
import { ChecklistItemModule } from './checklist-item/checklist-item.module';
import { SupabaseService } from './supabase/supabase.service';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

import * as process from 'node:process';
import * as dotenv from 'dotenv';
import { AuthMiddleware } from './auth/auth.middleware';
import { BoardLabelModule } from './board_label/board_label.module';
import { CardAttachmentModule } from './card_attachment/card_attachment.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BackgroundModule } from './background/background.module';
import { NotiGateway } from './gateway/noti/noti.gateway';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    }),
    ListModule,
    CardModule,
    BoardModule,
    CommentModule,
    ChecklistItemModule,
    SupabaseModule,
    AuthModule,
    UserModule,
    BoardLabelModule,
    CardAttachmentModule,
    NotificationsModule,
    BackgroundModule,
  ],
  controllers: [AppController],
  providers: [AppService, GatewayGateway, NotiGateway],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}

console.log(
  process.env.DB_HOST,
  process.env.DB_PORT,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  process.env.DB_DATABASE,
);
