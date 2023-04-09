import { AppConfigurationModule } from './infrastructure/configuration/app-configuration.module';
import { AppConfigurationService } from './infrastructure/configuration/app-configuration.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { RouterModule, Routes } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';
import { UserRepository } from './user/user.repository';


@Module({
  imports: [
    AppConfigurationModule,
    MongooseModule.forRootAsync({
      imports: [AppConfigurationModule],
      inject: [AppConfigurationService],
      useFactory: (appConfigService: AppConfigurationService) => {
        const options: MongooseModuleOptions = {
          uri: appConfigService.connectionString,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
        return options;
      },
    }),
    RouterModule.register([
      {
        path: 'register',
        module: UserController,
      },
      {
        path: 'login',
        module: UserController,
      },
      {
        path: 'update',
        module: UserController,
      },
      {
        path: 'connect',
        module: UserController,
      },
    ]),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
