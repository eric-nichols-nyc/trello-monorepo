import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateAttachmentLinkDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  url!: string;

  /** Optional display name; server defaults to URL hostname when omitted. */
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;
}
