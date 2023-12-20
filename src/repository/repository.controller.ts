// repository.controller.ts

import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RepositoryService } from './repository.service';


@Controller('repositories')
export class RepositoryController {
    constructor(private readonly repositoryService: RepositoryService) {}
    private results = [];

    @Post()
 async createRepositories(@Body() links: { links: string[] }) {
    for (const link of links.links) {
        const result = await this.repositoryService.processRepository(link);
        this.results.push(result);
      }
      return JSON.stringify(this.results, null, 2);
    }

    @Get()
    getAllRepositories() {
        return this.repositoryService.getRepositories();
    }

    @Get(':id')
    getRepositoryByID(@Param('id') id: string) {
        return this.repositoryService.getSingleRepository(id)
    }

}


