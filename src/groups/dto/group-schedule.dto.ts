import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { WeekDay } from '../../common';

export class GroupScheduleDto {
  @IsString()
  @IsNotEmpty({ message: 'day should not be empty' })
  @IsEnum(WeekDay, {
    message: `day must be a valid enum value: ${Object.values(WeekDay).join(', ')}`,
  })
  day!: WeekDay;

  @IsString({ message: 'startTime must be a string' })
  @IsNotEmpty({ message: 'startTime should not be empty' })
  startTime!: string;

  @IsString({ message: 'endTime must be a string' })
  @IsNotEmpty({ message: 'endTime should not be empty' })
  endTime!: string;
}
