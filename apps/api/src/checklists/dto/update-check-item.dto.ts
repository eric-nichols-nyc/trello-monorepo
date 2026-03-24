import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateCheckItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  pos?: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
