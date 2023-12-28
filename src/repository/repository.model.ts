// repository.model.ts
import * as mongoose from 'mongoose'

export const RepositorySchema = new mongoose.Schema({
  link: {type: String, required: true},
  api_url: {type: String, required: true},
  commits_url: {type: String},
  commitsCount: {type: Number},
  pullRequests_url: {type: String},
  pullRequestsCount: {type: String},
  comment: {type: String},
})

export interface Repository {
  id: string;
  link: string;
  commits_url: string;
  commitsCount: number;
  pullRequests_url: string;
  pullRequestsCount: number;
  api_url: string;
  comment: string;
}