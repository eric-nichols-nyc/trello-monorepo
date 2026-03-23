import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  background?: string;

  @IsOptional()
  @IsBoolean()
  closed?: boolean;
}
