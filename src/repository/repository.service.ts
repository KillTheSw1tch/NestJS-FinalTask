import { Injectable, NotFoundException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { Repository } from "./repository.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class RepositoryService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel("Repository") private readonly repositoryModel: Model<Repository>,
    @InjectModel("CommitSchema") private readonly commitModel: Model<any>, // Додайте модель для комітів
    @InjectModel("PullRequestSchema") private readonly pullRequestModel: Model<any>,
  ) {}

  private repositoriesSet: Set<string> = new Set(); // Set для збереження унікальних значень посилань

  async processRepository(link: string | string[]): Promise<Repository | Repository[]> {
    let linksArray: string[];

    // Перевіряємо, чи передано одне посилання чи масив
    if (Array.isArray(link)) {
      linksArray = link;
    } else {
      linksArray = [link];
    }

    const newRepositories: Repository[] = [];

    for (const currentLink of linksArray) {
      if (this.repositoriesSet.has(currentLink)) {
        // Якщо посилання вже існує, пропускаємо його та переходимо до наступного
        continue;
      }

      const api_url = currentLink.replace("github.com", "api.github.com/repos");

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

        // Отримання комітів
        const commits = await this.countCommitsFromRepository(repositoryData.commits_url, repositoryData._id);
        repositoryData.commitsCount = commits.length;

        const pullRequests = await this.countPullRequestsFromRepository(repositoryData.pullRequests_url, repositoryData._id);
        repositoryData.pullRequestsCount = pullRequests.length;

        // Збереження репозиторію в базі даних
        const repository = await this.repositoryModel.create(repositoryData);

        await repositoryData.save();

        this.repositoriesSet.add(currentLink); // Додаємо посилання до Set
        newRepositories.push(repository);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          throw "Invalid repository link";
        } else {
          console.error("Error processing repository:", error.response?.data || error.message);
          throw "An error occurred while processing repository";
        }
      }
    }

    return newRepositories.length === 1 ? newRepositories[0] : newRepositories;
  }

  async countCommitsFromRepository(commits_url: string, repositoryId: string): Promise<any[]> {
    const returnedCommits = await firstValueFrom(this.httpService.get<any[]>(commits_url));

    const commitsDataToSave = returnedCommits.data.map(commit => ({
      id: commit.id,
      //message: commit.commit.message,
      // інші поля, які вам потрібні
    }));

    // Збереження комітів у відповідній колекції
    await this.commitModel.create({
      repository: repositoryId,
      commits: commitsDataToSave,
    });

    return commitsDataToSave;
  }

  async countPullRequestsFromRepository(pullRequests_url: string, repositoryId: string): Promise<any[]> {
    const returnedPullRequests = await firstValueFrom(this.httpService.get<any[]>(pullRequests_url));

    const pullRequestsDataToSave = returnedPullRequests.data.map(pullRequest => ({
      id: pullRequest.id,
      //title: pullRequest.title,
      // інші поля, які вам потрібні
    }));

    // Збереження пул-реквестів у відповідній колекції
    await this.pullRequestModel.create({
      repository: repositoryId,
      pullRequests: pullRequestsDataToSave,
    });

    return pullRequestsDataToSave;
  }

  async getRepositories() {
    const returnedRepo = await this.repositoryModel.find().exec();
    return returnedRepo;
  }

  async getSingleRepository(id: string): Promise<Repository> {
    try {
      const repository = await this.repositoryModel.findById(id).exec();

      if (!repository) {
        throw new NotFoundException("Could not find the repository");
      }

      return repository;
    } catch (error) {
      console.error("Error fetching repository:", error);
      throw "An error occurred while fetching the repository";
    }
  }

  async findRepository(): Promise<Repository> {
    const repository = await this.repositoryModel.findOne().exec();

    return repository;
  }

  async putComment(id: string, comment: string): Promise<void> {
    const repository = await this.repositoryModel.findById(id).exec();

    if (!repository) {
      throw new NotFoundException("Repository not found");
    }

    repository.comment = comment;
    await repository.save();
  }

  async getCommitsFromRepositoryById(id: string): Promise<any> {
    const repository = await this.repositoryModel.findById(id).exec();

    if (!repository) {
      throw new NotFoundException("Repository not found");
    }

    try {
      const response = await firstValueFrom(this.httpService.get<any>(repository.commits_url));
      return response.data;
    } catch (error) {
      console.error("Error fetching commits:", error.response?.data || error.message);
      throw "An error occurred while fetching commits";
    }
  }

  async getPullRequestsFromRepositoryById(id: string): Promise<any> {
    const repository = await this.repositoryModel.findById(id).exec();

    if (!repository) {
      throw new NotFoundException("Repository not found");
    }

    try {
      const response = await firstValueFrom(this.httpService.get<any>(repository.pullRequests_url));
      return response.data;
    } catch (error) {
      console.error("Error fetching pull requests:", error.response?.data || error.message);
      throw "An error occurred while fetching pull requests";
    }
  }

  async deleteRepo(id: string): Promise<void> {
    const result = await this.repositoryModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException("Repository not found");
    }
  }

  async reloadRepo(): Promise<Repository[]> {
    // Очистити поточні результати аналізу
    await this.repositoryModel.deleteMany({}).exec();

    // Викликати аналіз для всіх репозиторіїв
    const repositories = await this.repositoryModel.find().exec();

    for (const repository of repositories) {
      try {
        // Перевірити, чи репозиторій вже був аналізований
        const existingRepository = await this.repositoryModel.findById(repository.id).exec();
        if (!existingRepository) {
          await this.processRepository(repository.link);
        }
      } catch (error) {
        console.error(`Error analyzing repository ${repository.id}:`, error);
        // Можливо, додайте обробку помилок або інші дії за потреби
      }
    }

    // Повернути нові результати аналізу
    return this.repositoryModel.find().exec();
  }
}
