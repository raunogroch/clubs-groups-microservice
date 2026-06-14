import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { NATS_SERVICE } from '../config';
import { PaginationDto } from '../common';
import { CreateGroupDto, UpdateGroupDto } from './dto';
import { GroupsRepository } from './groups.repository';

@Injectable()
export class GroupsService {
  constructor(
    private readonly groupsRepository: GroupsRepository,
    @Inject(NATS_SERVICE)
    private readonly client: ClientProxy,
  ) {}

  // =========================================================
  // CREATE
  // =========================================================

  async create(createGroupDto: CreateGroupDto) {
    try {
      const existingGroup =
        await this.groupsRepository.findGroupByNameAndAssignment(
          createGroupDto.name,
          createGroupDto.assignmentId,
        );

      if (existingGroup) {
        throw new RpcException('Group already exists');
      }

      await this.validateAssignment(createGroupDto.assignmentId);

      const { schedules = [], coaches = [], ...groupData } = createGroupDto;

      const validatedCoaches = await this.validateUserRole(coaches, 'COACH');

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
        coaches: validatedCoaches.length
          ? {
              createMany: {
                data: validatedCoaches.map((coachId) => ({
                  coachId,
                })),
              },
            }
          : undefined,
      });
    } catch (error: any) {
      throw new RpcException(error);
    }
  }

  // =========================================================
  // FIND ALL
  // =========================================================

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

  // =========================================================
  // FIND ONE
  // =========================================================

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

  // =========================================================
  // UPDATE
  // =========================================================

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
        ...groupData
      } = updateGroupDto;

      const validatedCoaches = coaches
        ? await this.validateUserRole(coaches, 'COACH')
        : [];

      return this.groupsRepository.updateWithRelations(
        id,
        groupData,
        schedules,
        validatedCoaches,
      );
    } catch (error: any) {
      throw new RpcException(error);
    }
  }

  // =========================================================
  // REMOVE (SOFT DELETE)
  // =========================================================

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

  // =========================================================
  // PRIVATE METHODS
  // =========================================================

  private async validateAssignment(assignmentId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.client.send('assignment.validate', assignmentId),
      );
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

      return await firstValueFrom<string[]>(
        this.client.send('users.admin.validate', {
          ids: users,
          role,
        }),
      );
    } catch (error: any) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message || 'Invalid users',
      });
    }
  }
}
