// repository.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { Repository } from './repository.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class RepositoryService {
  constructor(
    private httpService: HttpService,
    @InjectModel('Repository') private readonly repositoryModel: Model<Repository>
    ) {}

  private repositories: Repository[] = [];
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

      const api_url = currentLink.replace('github.com', 'api.github.com/repos');
      
      try {
        const response = await firstValueFrom(
          this.httpService.get<any>(api_url, {})
        );

        const repository: Repository = {
          id: response.data.id.toString(),
          link: currentLink,
          api_url,
          commits_url: response.data.commits_url.replace(/{\/sha}/g, ''),
          commitsCount: 0,
          pullRequests_url: response.data.pulls_url.replace(/{\/number}/g, ''),
          pullRequestsCount: 0,
          comment: '',
        };

        // Отримання комітів
        const commits = await this.countCommitsFromRepository(repository.commits_url);  
        // Збереження результатів аналізу
        repository.commitsCount = commits.length;

        const pullRequests = await this.countCommitsFromRepository(repository.pullRequests_url)
        repository.pullRequestsCount = pullRequests.length;

        // Збереження репозиторію
        this.repositoriesSet.add(currentLink); // Додаємо посилання до Set
        this.repositories.push(repository);
        newRepositories.push(repository);
      } catch (error) {
        // Обробка помилок
        if (error.response && error.response.status === 404) {
          throw 'Invalid repository link';
        } else {
          console.error('Error processing repository:', error.response?.data || error.message);
          throw 'An error occurred while processing repository';
        }
      }
    }

    return newRepositories.length === 1 ? newRepositories[0] : newRepositories;
  }



  async countCommitsFromRepository(commits_url: string): Promise<any[]> {
    const returnedCommits = await firstValueFrom(
      this.httpService.get<any[]>(commits_url)
    ).catch((error: AxiosError) => {
      throw 'An Error';
    });
  
    return returnedCommits.data;
  }

  getRepositories(): Repository[] {
    return this.repositories;
  }

  getSingleRepository(id: string) {
    const oneRepos = this.repositories.find((repository) => repository.id === id);
    if (!oneRepos) {
      throw new NotFoundException('Could not find the repository');
    }
    return { ...oneRepos };
  }

  putComment(id: string, comment: string): void {
    const repository = this.repositories.find((repository) => repository.id === id);

    if (!repository) {
      throw new NotFoundException('Repository not found');
    }

    repository.comment = comment;
  }

  async getCommitsFromRepositoryById(id: string): Promise<any> {
    const repository = this.repositories.find((repo) => repo.id === id);

    if (!repository) {
        throw new NotFoundException('Repository not found');
    }

    try {
        const response = await firstValueFrom(this.httpService.get<any>(repository.commits_url));
        return response.data;
    } catch (error) {
        console.error('Error fetching commits:', error.response?.data || error.message);
        throw 'An error occurred while fetching commits';
    }
}

async getPullRequestsFromRepositoryById(id: string): Promise<any> {
  const repository = this.repositories.find((repo) => repo.id === id);

  if (!repository) {
      throw new NotFoundException('Repository not found');
  }

  try {
      const response = await firstValueFrom(this.httpService.get<any>(repository.pullRequests_url));
      return response.data;
  } catch (error) {
      console.error('Error fetching pull requests:', error.response?.data || error.message);
      throw 'An error occurred while fetching pull requests';
  }
}

deleteRepo(id: string) {
  const index = this.repositories.findIndex((repo) => repo.id === id);

  if (index === -1) {
      throw new NotFoundException('Repository not found');
  }

  this.repositories.splice(index, 1);
}

async reloadRepo() {
  // Очистити поточні результати аналізу
  this.repositories = [];

  // Викликати аналіз для всіх репозиторіїв
  const repositories = this.getRepositories();
  for (const repository of repositories) {
    try {
      // Перевірити, чи репозиторій вже був аналізований
      const existingRepository = this.repositories.find(repo => repo.id === repository.id);
      if (!existingRepository) {
        await this.processRepository(repository.link);
      }
    } catch (error) {
      console.error(`Error analyzing repository ${repository.id}:`, error);
      // Можливо, додайте обробку помилок або інші дії за потреби
    }
  }

  // Повернути нові результати аналізу
  return this.repositories;
}

}
