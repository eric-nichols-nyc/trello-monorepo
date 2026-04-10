import {
  AuthGuard,
  Session,
  UserSession,
} from '@mguay/nestjs-better-auth';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateWorkspaceRequest } from './dto/create-workspace.request';
import { PatchWorkspaceRequest } from './dto/patch-workspace.request';
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

  @Patch(':id')
  async patch(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() body: PatchWorkspaceRequest,
  ) {
    const row = await this.workspacesService.updateForOwner(
      session.user.id,
      id,
      {
        name: body.name,
        description: body.description,
      },
    );
    if (!row) {
      throw new NotFoundException('Workspace not found');
    }
    return row;
  }
}
