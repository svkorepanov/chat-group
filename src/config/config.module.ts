import { ConfigModule as ConfigM } from '@nestjs/config';
import { configValidationSchema } from './config.validation';

export const ConfigModule = ConfigM.forRoot({
  cache: true,
  validationSchema: configValidationSchema,
  envFilePath: process.env.NODE_ENV === 'test' ? 'test.env' : '.env',
});
