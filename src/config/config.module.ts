import { ConfigModule as ConfigM } from '@nestjs/config';
import { configValidationSchema } from './config.validation';

export const ConfigModule = ConfigM.forRoot({
  cache: true,
  validationSchema: configValidationSchema,
});
