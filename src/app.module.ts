import { AppConfigurationModule } from './infrastructure/configuration/app-configuration.module';
import { AppConfigurationService } from './infrastructure/configuration/app-configuration.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { RouterModule } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';

@Module({
  imports: [
    AppConfigurationModule,
    MongooseModule.forRootAsync({
      imports: [AppConfigurationModule],
      inject: [AppConfigurationService],
      useFactory: (appConfigService: AppConfigurationService) => {
        const options: MongooseModuleOptions = {
          uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Membrana',
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
        path: 'logout',
        module: UserController,
      },
      {
        path: 'userName',
        module: UserController,
      },
      {
        path: 'resetData',
        module: UserController,
      },
      {
        path: 'updateUsername',
        module: UserController,
      },
      {
        path: 'connect',
        module: UserController,
      },
      {
        path: 'updateSessionStatus',
        module: UserController,
      },
      {
        path: 'sendData',
        module: UserController,
      },
    ]),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
