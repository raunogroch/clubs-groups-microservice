import { ArrayUnique, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CoachesGroupDto {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  coaches!: string[];
}
