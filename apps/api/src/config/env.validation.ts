import { plainToClass } from 'class-transformer';
import { IsString, IsOptional, IsIn, IsNumberString, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsOptional()
  @IsString()
  DATABASE_URL?: string;

  @IsOptional()
  @IsString() // Changed from @IsUrl() to @IsString() for flexibility
  REDIS_URL?: string;

  @IsOptional()
  @IsNumberString()
  PORT?: string;

  @IsOptional()
  @IsIn(['development', 'production', 'test'])
  NODE_ENV?: string;

  @IsOptional()
  @IsString() // Changed from @IsUrl() to @IsString() for localhost compatibility
  FRONTEND_URL?: string;

  @IsOptional()
  @IsIn(['error', 'warn', 'info', 'debug'])
  LOG_LEVEL?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
