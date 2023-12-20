//repository.service.ts

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { Repository } from './repository.model';

@Injectable()
export class RepositoryService {
 constructor(private httpService: HttpService) {}

 repositories: Repository[] = [];

 async processRepository(link: string): Promise<Repository> {
  const api_url = link.replace('github.com', 'api.github.com/repos');
  const response = await firstValueFrom(
     this.httpService.get<any>(api_url, {
       params: {
         // Обирайте тільки необхідні поля даних
         'fields': 'id,commits_count,pull_requests_count'
       }
     }).pipe(
       map(response => {
         const repository: Repository = {
           id: response.data.id,
           link,
           commits_url: response.data.commits_url.replace(/{\/sha}/g, ''),
           commitsCount: response.data.commits_count,
           pullRequestsCount: response.data.pull_requests_count,
           api_url
         };
 
         return repository;
       }),
       catchError((error: AxiosError) => {
         throw 'An Error';
       })
     )
  );
 
  return response;
 }

  getRepositories(): Repository[] {
    return this.repositories;
 }

 getSingleRepository(id: string): Repository {
    return this.repositories.find(repository => repository.id === id);
 }
}

