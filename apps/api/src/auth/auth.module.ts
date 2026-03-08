import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ClerkAuthGuard } from "./clerk-auth.guard";
import { ClerkAuthService } from "./clerk-auth.service";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [ClerkAuthService, ClerkAuthGuard],
  exports: [ClerkAuthService, ClerkAuthGuard],
})
export class AuthModule {}
