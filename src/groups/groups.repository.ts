import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { CoachRole } from '../generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GroupsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly groupRelations = {
    coaches: true,
    schedules: true,
    enrollments: true,
  };

  create(data: Prisma.GroupCreateInput) {
    return this.prisma.group.create({
      data,
      include: this.groupRelations,
    });
  }

  countAvailable(clubId?: string) {
    return this.prisma.group.count({
      where: {
        available: true,
        ...(clubId && { clubId }),
      },
    });
  }

  findAll(page: number, limit: number, clubId?: string) {
    return this.prisma.group.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        available: true,
        ...(clubId && { clubId }),
      },
      include: this.groupRelations,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.group.findFirst({
      where: {
        id,
        available: true,
      },
      include: this.groupRelations,
    });
  }

  update(id: string, data: Prisma.GroupUpdateInput) {
    return this.prisma.group.update({
      where: { id },
      data,
      include: this.groupRelations,
    });
  }

  softDelete(id: string) {
    return this.prisma.group.update({
      where: { id },
      data: { available: false },
    });
  }

  findOneWithCoaches(id: string) {
    return this.prisma.group.findFirst({
      where: {
        id,
        available: true,
      },
      select: {
        id: true,
        coaches: true,
      },
    });
  }

  validateGroup(id: string) {
    return this.prisma.group.findFirst({
      where: { id, available: true },
      select: { id: true },
    });
  }

  findGroupByClubAndName(clubId: string, name: string) {
    return this.prisma.group.findFirst({
      where: {
        clubId,
        name,
        available: true,
      },
    });
  }

  // Transactional operations for complex updates
  async updateWithRelations(
    id: string,
    groupData: Prisma.GroupUpdateInput,
    schedules?: any[],
    coaches?: Array<{ coachId: string; role: CoachRole }>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Update main group data
      await tx.group.update({
        where: { id },
        data: groupData,
      });

      // Replace schedules
      if (schedules) {
        await tx.groupSchedule.deleteMany({
          where: { groupId: id },
        });

        if (schedules.length > 0) {
          await tx.groupSchedule.createMany({
            data: schedules.map((schedule) => ({
              groupId: id,
              day: schedule.day,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              available: true,
            })),
          });
        }
      }

      // Replace coaches
      if (coaches) {
        await tx.groupCoach.deleteMany({
          where: { groupId: id },
        });

        if (coaches.length > 0) {
          await tx.groupCoach.createMany({
            data: coaches.map((coach) => ({
              groupId: id,
              coachId: coach.coachId,
              role: coach.role,
            })),
          });
        }
      }

      return tx.group.findUnique({
        where: { id },
        include: this.groupRelations,
      });
    });
  }
}
