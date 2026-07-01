import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { PaginationDto } from '../common';
import { CreateGroupDto, UpdateGroupDto } from './dto';
import { GroupsRepository } from './groups.repository';
import { EnrollmentStatus } from '../generated/prisma/client';
import { NatsClientService } from '../transports/nats-client.service';

@Injectable()
export class GroupsService {
  constructor(
    private readonly groupsRepository: GroupsRepository,
    private readonly natsClientService: NatsClientService,
  ) {}

  async create(createGroupDto: CreateGroupDto) {
    try {
      const existingGroup = await this.groupsRepository.findGroupByClubAndName(
        createGroupDto.clubId,
        createGroupDto.name,
      );

      if (existingGroup) {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: 'Group already exists in this club',
        });
      }

      await this.validateAssignment(createGroupDto.assignmentId);

      const {
        schedules = [],
        coaches = [],
        enrollments = [],
        ...groupData
      } = createGroupDto;

      const coachIds = coaches.map((coach) => coach.coachId);
      const validatedCoaches = coachIds.length
        ? await this.validateUserRole(coachIds, 'COACH')
        : [];

      const coachesWithRoles = coaches
        .filter((coach) => validatedCoaches.includes(coach.coachId))
        .map((coach) => ({
          coachId: coach.coachId,
          role: coach.role,
        }));

      return this.groupsRepository.create({
        ...groupData,
        schedules: schedules.length
          ? {
              createMany: {
                data: schedules.map((schedule) => ({
                  day: schedule.day,
                  startTime: schedule.startTime,
                  endTime: schedule.endTime,
                  available: true,
                })),
              },
            }
          : undefined,
        coaches: coachesWithRoles.length
          ? {
              createMany: {
                data: coachesWithRoles,
              },
            }
          : undefined,
        enrollments: enrollments.length
          ? {
              create: enrollments.map((enrollment) => ({
                assignmentId: enrollment.assignmentId,
                clubId: enrollment.clubId,
                athleteId: enrollment.athleteId,
                status:
                  (enrollment.status as EnrollmentStatus | undefined) ??
                  EnrollmentStatus.PENDING,
                enrollmentDate: enrollment.enrollmentDate
                  ? new Date(enrollment.enrollmentDate)
                  : undefined,
                joinedAt: enrollment.joinedAt
                  ? new Date(enrollment.joinedAt)
                  : undefined,
                leftAt: enrollment.leftAt
                  ? new Date(enrollment.leftAt)
                  : undefined,
                notes: enrollment.notes,
                available: enrollment.available ?? true,
              })),
            }
          : undefined,
      });
    } catch (error: any) {
      throw new RpcException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { page = 1, limit = 10, clubId } = paginationDto;

      const total = await this.groupsRepository.countAvailable(clubId);
      const lastPage = Math.ceil(total / limit);

      return {
        data: await this.groupsRepository.findAll(page, limit, clubId),
        meta: {
          total,
          page,
          lastPage,
        },
      };
    } catch (error: any) {
      throw new RpcException(error);
    }
  }

  async findOne(id: string) {
    try {
      const group = await this.groupsRepository.findOne(id);

      if (!group) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Group not found',
        });
      }

      return group;
    } catch (error: any) {
      throw new RpcException(error);
    }
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    try {
      const existingGroup = await this.groupsRepository.findOne(id);

      if (!existingGroup) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Group not found',
        });
      }

      const {
        id: _dtoId,
        schedules,
        coaches,
        assignmentId,
        enrollments,
        ...groupData
      } = updateGroupDto;

      const coachIds = coaches ? coaches.map((coach) => coach.coachId) : [];
      const validatedCoaches = coachIds.length
        ? await this.validateUserRole(coachIds, 'COACH')
        : [];

      const coachesWithRoles =
        coaches === undefined
          ? undefined
          : coaches
              .filter((coach) => validatedCoaches.includes(coach.coachId))
              .map((coach) => ({
                coachId: coach.coachId,
                role: coach.role,
              }));

      const updatedGroup = await this.groupsRepository.updateWithRelations(
        id,
        groupData,
        schedules,
        coachesWithRoles,
      );

      if (enrollments?.length) {
        await this.groupsRepository.createEnrollments(
          id,
          enrollments.map((enrollment) => ({
            assignmentId: enrollment.assignmentId,
            clubId: enrollment.clubId,
            athleteId: enrollment.athleteId,
            status:
              (enrollment.status as EnrollmentStatus | undefined) ??
              EnrollmentStatus.PENDING,
            enrollmentDate: enrollment.enrollmentDate
              ? new Date(enrollment.enrollmentDate)
              : undefined,
            joinedAt: enrollment.joinedAt
              ? new Date(enrollment.joinedAt)
              : undefined,
            leftAt: enrollment.leftAt ? new Date(enrollment.leftAt) : undefined,
            notes: enrollment.notes,
            available: enrollment.available ?? true,
          })),
        );
      }

      return updatedGroup;
    } catch (error: any) {
      throw new RpcException(error);
    }
  }

  async remove(id: string) {
    try {
      const existingGroup = await this.groupsRepository.findOne(id);

      if (!existingGroup) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Group not found',
        });
      }

      await this.groupsRepository.softDelete(id);

      return {
        message: 'Group was removed successfully',
      };
    } catch (error: any) {
      throw new RpcException(error);
    }
  }

  private async validateAssignment(assignmentId: string): Promise<void> {
    try {
      await this.natsClientService.send('assignment.validate', assignmentId);
    } catch (error: any) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message || 'Assignment is not valid',
      });
    }
  }

  private async validateUserRole(
    users: string[],
    role: string,
  ): Promise<string[]> {
    try {
      if (!users?.length) {
        return [];
      }

      return await this.natsClientService.send<string[]>(
        'users.admin.validate',
        {
          ids: users,
          role,
        },
      );
    } catch (error: any) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message || 'Invalid users',
      });
    }
  }
}
