import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GroupStatus } from '../../common';
import { GroupScheduleDto } from './group-schedule.dto';
import { CoachRoles } from '../../common/enum/coach-roles.enum';

export class CreateGroupDto {
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name should not be empty' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'description must be a string' })
  description?: string;

  @IsString({ message: 'assignmentId must be a string' })
  @IsNotEmpty({ message: 'assignmentId should not be empty' })
  assignmentId!: string;

  @IsString({ message: 'clubId must be a string' })
  @IsNotEmpty({ message: 'clubId should not be empty' })
  clubId!: string;

  @IsOptional()
  @IsString({ message: 'address must be a string' })
  address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'maxAthletes must be a number' })
  @Min(1, { message: 'maxAthletes must be at least 1' })
  maxAthletes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'minAge must be a number' })
  @Min(0, { message: 'minAge must be at least 0' })
  minAge?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'maxAge must be a number' })
  @Min(0, { message: 'maxAge must be at least 0' })
  maxAge?: number;

  @IsOptional()
  @IsEnum(GroupStatus, {
    message: `status must be a valid enum value: ${Object.values(GroupStatus).join(', ')}`,
  })
  status?: GroupStatus;

  @IsOptional()
  @IsBoolean({ message: 'available must be a boolean' })
  available?: boolean;

  @IsOptional()
  @IsArray({ message: 'coaches must be an array' })
  @IsString({ each: true, message: 'each coach id must be a string' })
  @IsUUID('4', { each: true, message: 'each coach id must be a valid ID' })
  coaches?: CoachRoles[];

  @IsOptional()
  @IsArray({ message: 'schedules must be an array' })
  @ValidateNested({ each: true })
  @Type(() => GroupScheduleDto)
  schedules?: GroupScheduleDto[];
}
