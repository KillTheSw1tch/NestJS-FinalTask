import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RepositoryModule } from './repository/repository.module';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';


@Module({
  imports: [HttpModule ,RepositoryModule, MongooseModule.forRoot('mongodb+srv://zaharpetrenko:NoMourners2411@cluster0.ydhbvwa.mongodb.net/?retryWrites=true&w=majority')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
