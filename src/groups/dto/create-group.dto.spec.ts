import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateGroupDto } from './create-group.dto';

describe('CreateGroupDto', () => {
  it('accepts nested enrollments payload', async () => {
    const dto = plainToInstance(CreateGroupDto, {
      name: 'Group 1',
      assignmentId: 'assignment-1',
      clubId: 'club-1',
      enrollments: [
        {
          assignmentId: 'assignment-1',
          clubId: 'club-1',
          groupId: 'group-1',
          athleteId: 'athlete-1',
          status: 'PENDING',
          notes: 'Test enrollment',
          enrollmentDate: '2026-06-24T10:00:00.000Z',
          available: true,
        },
      ],
    });

    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors).toHaveLength(0);
  });
});
