import { IsNotEmpty, IsString, ValidateIf } from "class-validator";

export class CreateBoardDto {
  @ValidateIf((_o, v) => v !== undefined && v !== null)
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ValidateIf((_o, v) => v !== undefined && v !== null)
  @IsString()
  @IsNotEmpty()
  workspaceId!: string;
}
