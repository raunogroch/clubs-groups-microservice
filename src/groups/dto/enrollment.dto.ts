import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class EnrollmentDto {
  @IsString({ message: 'assignmentId must be a string' })
  @IsNotEmpty({ message: 'assignmentId should not be empty' })
  assignmentId!: string;

  @IsString({ message: 'clubId must be a string' })
  @IsNotEmpty({ message: 'clubId should not be empty' })
  clubId!: string;

  @IsString({ message: 'groupId must be a string' })
  @IsNotEmpty({ message: 'groupId should not be empty' })
  groupId!: string;

  @IsString({ message: 'athleteId must be a string' })
  @IsNotEmpty({ message: 'athleteId should not be empty' })
  athleteId!: string;

  @IsOptional()
  @IsString({ message: 'status must be a string' })
  status?: string;

  @IsOptional()
  @IsDateString({}, { message: 'enrollmentDate must be a valid date string' })
  enrollmentDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'joinedAt must be a valid date string' })
  joinedAt?: string;

  @IsOptional()
  @IsDateString({}, { message: 'leftAt must be a valid date string' })
  leftAt?: string;

  @IsOptional()
  @IsString({ message: 'notes must be a string' })
  notes?: string;

  @IsOptional()
  @IsBoolean({ message: 'available must be a boolean' })
  available?: boolean;
}
