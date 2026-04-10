import {
  AuthGuard,
  Session,
  UserSession,
} from '@mguay/nestjs-better-auth';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateWorkspaceRequest } from './dto/create-workspace.request';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
@UseGuards(AuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  async create(
    @Session() session: UserSession,
    @Body() body: CreateWorkspaceRequest,
  ) {
    return this.workspacesService.create(
      session.user.id,
      body.name,
      body.description,
      body.shortLink,
    );
  }

  @Get()
  async list(@Session() session: UserSession) {
    return this.workspacesService.findAllForUser(session.user.id);
  }
}
