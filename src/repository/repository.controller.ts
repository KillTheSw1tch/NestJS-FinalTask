// Modules and decorators
import { Controller, Post, Body, Get, Param, Put, Delete, HttpStatus, HttpException, BadRequestException } from "@nestjs/common";
import { RepositoryService } from "./repository.service";
import { CreateRepositoriesDto } from "./dto/repository.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

// Swagger tags for the entire controller
@ApiTags("Repository Module")
@Controller("repositories")
export class RepositoryController {
  constructor(private readonly repositoryService: RepositoryService) {}

  // Handling the request to process a list of repository links
  @Post()
  @ApiOperation({ summary: "Process data from list of links" })
  @ApiResponse({
    status: 200,
    description: "All repository links are processed successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request. Invalid input data",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error. An error occurred while processing the request",
  })
  async ProcessRepositoriesDto(@Body() dto: CreateRepositoriesDto) {
    try {
      const result = await this.repositoryService.processRepository(dto.links);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException( // Handling DTO validation errors
          {
            error: "Bad Request",
            details: error.getResponse(), // Adding error details
            statusCode: HttpStatus.BAD_REQUEST,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  // Handling the request to get all repositories
  @Get()
  @ApiOperation({ summary: "Get all repositories" })
  @ApiResponse({
    status: 200,
    description: "Returns all repositories",
  })
  async getAllRepositories() {
    const returnedRepo = await this.repositoryService.getRepositories();
    return returnedRepo.map(repo => ({
      id: repo._id,
      repo_id: repo.id,
      link: repo.link,
      api_url: repo.api_url,
      commits_url: repo.commits_url,
      commits_Count: repo.commitsCount,
      pullRequests_url: repo.pullRequests_url,
      pullRequests_Count: repo.pullRequestsCount,
      comment: repo.comment,
    }));
  }

  // Handling the request to get a repository by ID
  @Get(":id")
  @ApiOperation({ summary: "Get a repository by ID" })
  @ApiResponse({
    status: 200,
    description: "Returns a single repository by ID",
  })
  @ApiResponse({
    status: 404,
    description: "Repository not found",
  })
  async getRepositoryByID(@Param("id") id: string) {
    return this.repositoryService.getSingleRepository(id);
  }

  // Handling the request to put a comment on a repository
  @Put(":id")
  @ApiOperation({ summary: "Put a comment on a repository" })
  @ApiResponse({
    status: 200,
    description: "Comment added successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Repository not found",
  })
  putComment(@Param("id") id: string, @Body("comment") comment: string) {
    return this.repositoryService.putComment(id, comment);
  }

  // Handling the request to get commits by repository ID
  @Get("commits/:id")
  @ApiOperation({ summary: "Get commits by repository ID" })
  @ApiResponse({
    status: 200,
    description: "Returns commits by repository ID",
  })
  @ApiResponse({
    status: 404,
    description: "Repository not found",
  })
  getCommitsByRepositoryId(@Param("id") id: string) {
    return this.repositoryService.getCommitsFromRepositoryById(id);
  }

  // Handling the request to get pull requests by repository ID
  @Get("pullrequests/:id")
  @ApiOperation({ summary: "Get pull requests by repository ID" })
  @ApiResponse({
    status: 200,
    description: "Returns pull requests by repository ID",
  })
  @ApiResponse({
    status: 404,
    description: "Repository not found",
  })
  getPullRequestsByRepositoryId(@Param("id") id: string) {
    return this.repositoryService.getPullRequestsFromRepositoryById(id);
  }

  // Handling the request to remove a repository by ID
  @Delete(":id")
  @ApiOperation({ summary: "Remove a repository by ID" })
  @ApiResponse({
    status: 200,
    description: "Repository removed successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Repository not found",
  })
  removeRepo(@Param("id") id: string) {
    return this.repositoryService.deleteRepo(id);
  }

  // Handling the request to reload repositories
  @Post("reload-repo")
  @ApiOperation({ summary: "Reload repositories" })
  @ApiResponse({
    status: 200,
    description: "Repositories reloaded successfully",
  })
  updateRepo() {
    this.repositoryService.reloadRepo().then(() => console.log("Done reloading repositories"));
  }
}
