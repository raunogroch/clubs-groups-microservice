import { Controller } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto } from './dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaginationDto } from '../common';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @MessagePattern('group.create')
  create(@Payload() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @MessagePattern('group.findAll')
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.groupsService.findAll(paginationDto);
  }

  @MessagePattern('group.findOne')
  findOne(@Payload() id: string) {
    return this.groupsService.findOne(id);
  }

  @MessagePattern('group.update')
  update(@Payload() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(updateGroupDto.id, updateGroupDto);
  }

  @MessagePattern('group.remove')
  remove(@Payload() id: string) {
    return this.groupsService.remove(id);
  }
}
