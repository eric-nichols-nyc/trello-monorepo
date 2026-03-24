import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateChecklistDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  pos?: number;
}
