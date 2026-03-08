import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class CreateBoardDto {
  @ValidateIf((_o, v) => v != null)
  @IsString()
  @IsNotEmpty()
  title!: string;
}
