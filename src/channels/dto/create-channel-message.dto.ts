import { IsString, IsNotEmpty, MaxLength, IsNumber } from 'class-validator';

export class CreateChannelMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  text: string;

  @IsNumber()
  @IsNotEmpty()
  channelId: number;
}
