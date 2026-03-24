import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateListDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  pos?: number;

  @IsOptional()
  @IsBoolean()
  closed?: boolean;
}
