import { IsString, IsNotEmpty, MaxLength, IsNumber } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  text: string;

  @IsNumber()
  @IsNotEmpty()
  channelId: number;
}
