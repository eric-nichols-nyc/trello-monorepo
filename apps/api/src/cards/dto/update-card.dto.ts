import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  pos?: number;

  @IsOptional()
  @IsBoolean()
  closed?: boolean;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date | null;

  /** Move card to another list (same board). */
  @IsOptional()
  @IsUUID()
  listId?: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string | null;

  @IsOptional()
  @IsString()
  coverColor?: string | null;

  @IsOptional()
  @IsString()
  coverImage?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  shortLink?: string;
}
