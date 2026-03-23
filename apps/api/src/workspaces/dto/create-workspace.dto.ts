import { IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator";

export class CreateWorkspaceDto {
  @ValidateIf((_o, v) => v !== undefined && v !== null)
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
