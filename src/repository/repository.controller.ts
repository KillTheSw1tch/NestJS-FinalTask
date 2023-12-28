// repository.controller.ts

import { Controller, Post, Body, Get, Param, Put, Delete, HttpStatus, HttpException } from '@nestjs/common';
import { RepositoryService } from './repository.service';
import { CreateRepositoriesDto } from './dto/repository.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Repository Module')
@Controller('repositories')
export class RepositoryController {
  
  constructor(
    private readonly repositoryService: RepositoryService,
  ) {}

  private results = [];
  
  @Post()
  @ApiOperation({ summary: 'Process data from list of links' })
  @ApiResponse({
    status: 200,
    description: 'All repository links is ok',
  })
  @ApiResponse({
    status: 400,
    description: 'Empty list of links',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async ProcessRepositoriesDto(@Body() dto: CreateRepositoriesDto) {
    try {
      for (const link of dto.links) {
        const result = await this.repositoryService.processRepository(link);
        this.results.push(result);
      }
      return this.results;
    } catch (error) {
      throw new HttpException({ 
        message: error.message,
        error: 'Bad Request',
        statusCode: HttpStatus.BAD_REQUEST,
      }, HttpStatus.BAD_REQUEST);
    }
  }
  
  @Get()
  @ApiOperation({ summary: 'Get all repositories' })
  @ApiResponse({
    status: 200,
    description: 'Returns all repositories',
  })
  getAllRepositories() {
    return this.repositoryService.getRepositories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a repository by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns a single repository by ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Repository not found',
  })
  getRepositoryByID(@Param('id') id: string) {
    return this.repositoryService.getSingleRepository(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Put a comment on a repository' })
  @ApiResponse({
    status: 200,
    description: 'Comment added successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Repository not found',
  })
  putComment(@Param('id') id: string, @Body('comment') comment: string) {
    this.repositoryService.putComment(id, comment);
  }

  @Get('commits/:id')
  @ApiOperation({ summary: 'Get commits by repository ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns commits by repository ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Repository not found',
  })
  getCommitsByRepositoryId(@Param('id') id: string) {
    return this.repositoryService.getCommitsFromRepositoryById(id);
  }

  @Get('pullrequests/:id')
  @ApiOperation({ summary: 'Get pull requests by repository ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns pull requests by repository ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Repository not found',
  })
  getPullRequestsByRepositoryId(@Param('id') id: string) {
    return this.repositoryService.getPullRequestsFromRepositoryById(id);
  }
  
  @Delete(':id')
  @ApiOperation({ summary: 'Remove a repository by ID' })
  @ApiResponse({
    status: 200,
    description: 'Repository removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Repository not found',
  })
  removeRepo(@Param('id') id: string) {
    this.repositoryService.deleteRepo(id);
    return null;
  }

  @Post('reload-repo')
  @ApiOperation({ summary: 'Reload repositories' })
  @ApiResponse({
    status: 200,
    description: 'Repositories reloaded successfully',
  })
  updateRepo() {
    this.repositoryService.reloadRepo().then(() => console.log("Done reloading repositories"))
  }
}