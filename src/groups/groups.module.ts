import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { GroupsRepository } from './groups.repository';
import { NatsModule } from '../transports/nats.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [NatsModule],
  controllers: [GroupsController],
  providers: [GroupsService, GroupsRepository, PrismaService],
  exports: [GroupsService],
})
export class GroupsModule {}
