import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString()
  name?: string;

  /** Omit to leave unchanged; send `null` or `""` to clear. */
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  shortLink?: string;
}
