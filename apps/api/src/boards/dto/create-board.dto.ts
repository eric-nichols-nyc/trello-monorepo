import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import { BoardBackgroundBrightness } from "../../../generated/prisma/client";

export class CreateBoardDto {
  @ValidateIf((_o, v) => v !== undefined && v !== null)
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ValidateIf((_o, v) => v !== undefined && v !== null)
  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  shortLink?: string;

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
}
