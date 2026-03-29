import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { BoardBackgroundBrightness } from "../../../generated/prisma/client";

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  shortLink?: string;

  @IsOptional()
  @IsString()
  background?: string;

  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @IsOptional()
  @IsEnum(BoardBackgroundBrightness)
  backgroundBrightness?: BoardBackgroundBrightness;

  @IsOptional()
  @IsString()
  backgroundBottomColor?: string;

  @IsOptional()
  @IsString()
  backgroundTopColor?: string;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsBoolean()
  starred?: boolean;

  @IsOptional()
  @IsBoolean()
  closed?: boolean;
}
