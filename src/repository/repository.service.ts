// Modules and decorators
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { Repository } from "./repository.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateRepositoriesDto } from "./dto/repository.dto";
import { validate } from "class-validator";

@Injectable()
export class RepositoryService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel("Repository") private readonly repositoryModel: Model<Repository>,
    @InjectModel("CommitSchema") private readonly commitModel: Model<any>, // Add a model for commits
    @InjectModel("PullRequestSchema") private readonly pullRequestModel: Model<any>,
  ) {}

  private repositoriesSet: Set<string> = new Set(); // Set to store unique repository links

  //Processes a list of repository links, retrieves data from GitHub API,
  //and saves the repositories, commits, and pull requests in the database.
  async processRepository(links: string[]): Promise<Repository[]> {
    // Create DTO object
    const createRepositoriesDto = new CreateRepositoriesDto();
    createRepositoriesDto.links = links;

    // Validate DTO
    const validationErrors = await validate(createRepositoriesDto);

    if (validationErrors.length > 0) {
      throw new BadRequestException({
        message: validationErrors.map(error => Object.values(error.constraints)),
      });
    }

    const newRepositories: Repository[] = [];

    for (const currentLink of links) {
      // If the link already exists, skip it and move to the next one
      if (this.repositoriesSet.has(currentLink)) {
        continue;
      }

      const api_url = currentLink.replace("github.com", "api.github.com/repos"); //Get API link from original link

      try {
        const response = await firstValueFrom(this.httpService.get<any>(api_url, {}));

        const repositoryData = new this.repositoryModel({
          repo_id: response.data.id.toString(),
          link: currentLink,
          api_url,
          commits_url: response.data.commits_url.replace(/{\/sha}/g, ""),
          commitsCount: 0,
          pullRequests_url: response.data.pulls_url.replace(/{\/number}/g, ""),
          pullRequestsCount: 0,
          comment: "",
        });

        // Get commits
        const commits = await this.countCommitsFromRepository(repositoryData.commits_url, repositoryData._id);
        repositoryData.commitsCount = commits.length;

        //Get Pull-request
        const pullRequests = await this.countPullRequestsFromRepository(repositoryData.pullRequests_url, repositoryData._id);
        repositoryData.pullRequestsCount = pullRequests.length;

        // Create and save the repository in the database
        const repository = await this.repositoryModel.create(repositoryData);

        await repositoryData.save();

        this.repositoriesSet.add(currentLink); // Add the link to the Set
        newRepositories.push(repository);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          throw new NotFoundException("Invalid repository link");
        } else {
          console.error("Error processing repository:", error.response?.data || error.message);
          throw new BadRequestException("An error occurred while processing repository");
        }
      }
    }

    return newRepositories;
  }

  //Retrieves and saves commits from a given repository URL.
  async countCommitsFromRepository(commits_url: string, repositoryId: string): Promise<any[]> {
    const returnedCommits = await firstValueFrom(this.httpService.get<any[]>(commits_url));

    const commitsDataToSave = returnedCommits.data.map(commit => ({
      id: commit.id,
      //message: commit.commit.message
    }));

    // Save commits in the corresponding collection
    await this.commitModel.create({
      repository: repositoryId,
      commits: commitsDataToSave,
    });

    return commitsDataToSave;
  }

  //Retrieves and saves pull requests from a given repository URL.
  async countPullRequestsFromRepository(pullRequests_url: string, repositoryId: string): Promise<any[]> {
    const returnedPullRequests = await firstValueFrom(this.httpService.get<any[]>(pullRequests_url));

    const pullRequestsDataToSave = returnedPullRequests.data.map(pullRequest => ({
      id: pullRequest.id,
      //title: pullRequest.title
    }));

    // Save pull requests in the corresponding collection
    await this.pullRequestModel.create({
      repository: repositoryId,
      pullRequests: pullRequestsDataToSave,
    });

    return pullRequestsDataToSave;
  }

  //Retrieves all repositories from the database.
  async getRepositories() {
    const returnedRepo = await this.repositoryModel.find().exec();
    return returnedRepo;
  }

  //Retrieves a single repository by ID from the database.
  async getSingleRepository(id: string) {
    try {
      const repository = await this.repositoryModel.findById(id).exec();

      if (!repository) {
        throw new NotFoundException("Repository not found");
      }
      return repository;
    } catch (error) {
      console.error("Error fetching repository", error);
      throw new HttpException("An error occurred while fetching the repository", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //Add a comment to a repository and save it in the database.
  async putComment(id: string, comment: string): Promise<void> {
    try {
      const repository = await this.repositoryModel.findById(id).exec();

      if (!repository) {
        throw new NotFoundException("Repository not found");
      }

      // Add the comment to the repository
      repository.comment = comment;
      await repository.save();
    } catch (error) {
      console.error("Error putting comment on repository", error);
      throw new HttpException("An error occurred while putting comment on repository", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Retrieves commits from a repository by ID using the GitHub API.
  async getCommitsFromRepositoryById(id: string): Promise<any> {
    try {
      const repository = await this.repositoryModel.findById(id).exec();

      if (!repository) {
        throw new NotFoundException("Repository not found");
      }

      const response = await firstValueFrom(this.httpService.get<any>(repository.commits_url));
      return response.data;
    } catch (error) {
      console.error("Error fetching commits:", error.response?.data || error.message);

      // If the error is related to repository not found, rethrow as NotFoundException.
      if (error.response && error.response.status === 404) {
        throw new NotFoundException("Repository not found");
      }

      // For other errors, throw a generic HttpException.
      throw new HttpException("An error occurred while fetching commits", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Retrieves pull requests from a repository by ID using the GitHub API.
  async getPullRequestsFromRepositoryById(id: string): Promise<any> {
    try {
      const repository = await this.repositoryModel.findById(id).exec();

      if (!repository) {
        throw new NotFoundException("Repository not found");
      }

      const response = await firstValueFrom(this.httpService.get<any>(repository.pullRequests_url));
      return response.data;
    } catch (error) {
      console.error("Error fetching pull requests:", error.response?.data || error.message);

      // If the error is related to repository not found, rethrow as NotFoundException.
      if (error.response && error.response.status === 404) {
        throw new NotFoundException("Repository not found");
      }

      // For other errors, throw a generic HttpException.
      throw new HttpException("An error occurred while fetching pull requests", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //Deletes a repository from the database by ID.
  async deleteRepo(id: string) {
    try {
      const result = await this.repositoryModel.deleteOne({ _id: id }).exec();

      if (result.deletedCount === 0) {
        return "Repository not found";
      } else if (result.deletedCount > 0) {
        return "Repository successfully deleted";
      } else {
        return "Error deleting repository";
      }
    } catch (error) {
      console.error("An error occurred while deleting repository:", error);
      throw new HttpException("An error occurred while deleting repository", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //Deletes all repositories from the database and reprocesses them.
  async reloadRepo(): Promise<Repository[]> {
    // Clear current analysis results
    await this.repositoryModel.deleteMany({}).exec();

    // Call analysis for all repositories
    const repositories = await this.repositoryModel.find().exec();

    for (const repository of repositories) {
      try {
        // Check if the repository has already been analyzed
        const existingRepository = await this.repositoryModel.findById(repository.id).exec();
        if (!existingRepository) {
          await this.processRepository([repository.link]); // Change the argument to an array
        }
      } catch (error) {
        console.error(`Error analyzing repository ${repository.id}:`, error);
      }
    }

    // Return new analysis results
    return this.repositoryModel.find().exec();
  }
}
