import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "../users/users.module";
import { ClerkAuthGuard } from "./clerk-auth.guard";
import { ClerkAuthService } from "./clerk-auth.service";

@Global()
@Module({
  imports: [ConfigModule, UsersModule],
  providers: [ClerkAuthService, ClerkAuthGuard],
  exports: [ClerkAuthService, ClerkAuthGuard],
})
export class AuthModule {}
