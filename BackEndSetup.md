# SurveyForge Backend Setup Guide

## Overview
This guide provides a comprehensive setup for the SurveyForge backend application using NestJS, MSSQL, TypeORM, class-validators, and Swagger. The backend handles survey CRUD operations, response management, and provides a robust API for the React.js frontend application.

## Current Integration Status
✅ **Fully Integrated** - The frontend application is successfully connected to the NestJS backend with the following features:
- Survey CRUD operations via REST API
- Real-time data transformation between frontend and backend formats
- JWT-based authentication system
- Comprehensive error handling and validation
- Auto-save functionality with local storage fallback
- JSON import/export capabilities

## Table of Contents
1. [Project Structure](#project-structure)
2. [Prerequisites](#prerequisites)
3. [Installation & Setup](#installation--setup)
4. [Database Design](#database-design)
5. [Core Modules](#core-modules)
6. [API Endpoints](#api-endpoints)
7. [Validation & DTOs](#validation--dtos)
8. [Error Handling](#error-handling)
9.  [Testing Strategy](#testing-strategy)
10. [Deployment](#deployment)
11. [Best Practices](#best-practices)

## Project Structure

```
surveyforge-backend/
├── src/
│   ├── main.ts                          # Application entry point
│   ├── app.module.ts                    # Root module
│   ├── config/                          # Configuration files
│   │   ├── database.config.ts
│   │   ├── swagger.config.ts
│   │   └── validation.config.ts
│   ├── common/                          # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── modules/                         # Feature modules
│   │   ├── surveys/                     # Survey CRUD operations
│   │   ├── responses/                   # Survey responses
│   ├── entities/                        # TypeORM entities
│   ├── migrations/                      # Database migrations
├── test/                                # Test files
├── docs/                                # API documentation
├── docker/                              # Docker configuration
├── .env.example                         # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- MSSQL Server 2019+
- Docker (optional, for containerized development)
- Git

## Installation & Setup

### 1. Create NestJS Project

```bash
# Install NestJS CLI globally
npm i -g @nestjs/cli

# Create new project
nest new surveyforge-backend
cd surveyforge-backend

# Install required dependencies
npm install @nestjs/typeorm typeorm mssql
npm install @nestjs/config @nestjs/swagger
npm install class-validator class-transformer
npm install @nestjs/schedule
npm install @nestjs/event-emitter
npm install helmet compression
npm install winston nest-winston
npm install joi
```

### 2. Environment Configuration

Create `.env` file:

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourStrong@Passw0rd
DB_DATABASE=surveyforge
DB_SYNCHRONIZE=false
DB_LOGGING=true

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis (for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 3. Database Configuration

```typescript
// src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mssql',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: configService.get('DB_SYNCHRONIZE'),
  logging: configService.get('DB_LOGGING'),
  options: {
    encrypt: false, // For local development
    trustServerCertificate: true,
  },
  cli: {
    migrationsDir: 'src/migrations',
  },
});
```

## Database Design

### Core Tables

#### 2. Surveys Table
```sql
CREATE TABLE surveys (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  title NVARCHAR(500) NOT NULL,
  description NVARCHAR(MAX),
  userId UNIQUEIDENTIFIER NOT NULL,
  status NVARCHAR(50) DEFAULT 'draft',
  isPublic BIT DEFAULT 0,
  allowAnonymous BIT DEFAULT 0,
  settings NVARCHAR(MAX), -- JSON for survey settings
  theme NVARCHAR(MAX), -- JSON for survey theme
  expiresAt DATETIME2,
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

#### 3. Survey_Pages Table
```sql
CREATE TABLE survey_pages (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  surveyId UNIQUEIDENTIFIER NOT NULL,
  name NVARCHAR(255) NOT NULL,
  orderIndex INT NOT NULL,
  isActive BIT DEFAULT 1,
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY (surveyId) REFERENCES surveys(id) ON DELETE CASCADE
);
```

#### 4. Survey_Questions Table
```sql
CREATE TABLE survey_questions (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  pageId UNIQUEIDENTIFIER NOT NULL,
  name NVARCHAR(255) NOT NULL,
  type NVARCHAR(100) NOT NULL,
  title NVARCHAR(500) NOT NULL,
  description NVARCHAR(MAX),
  placeholder NVARCHAR(255),
  required BIT DEFAULT 0,
  orderIndex INT NOT NULL,
  validation NVARCHAR(MAX), -- JSON for validation rules
  conditionalLogic NVARCHAR(MAX), -- JSON for conditional logic
  styling NVARCHAR(MAX), -- JSON for styling options
  options NVARCHAR(MAX), -- JSON for question options
  isActive BIT DEFAULT 1,
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY (pageId) REFERENCES survey_pages(id) ON DELETE CASCADE
);
```

#### 5. Survey_Responses Table
```sql
CREATE TABLE survey_responses (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  surveyId UNIQUEIDENTIFIER NOT NULL,
  userId UNIQUEIDENTIFIER, -- NULL for anonymous responses
  sessionId NVARCHAR(255), -- For anonymous tracking
  startedAt DATETIME2 DEFAULT GETDATE(),
  completedAt DATETIME2,
  timeSpent INT, -- in seconds
  deviceInfo NVARCHAR(MAX), -- JSON for device/browser info
  ipAddress NVARCHAR(45),
  userAgent NVARCHAR(500),
  createdAt DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY (surveyId) REFERENCES surveys(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

#### 6. Survey_Response_Answers Table
```sql
CREATE TABLE survey_response_answers (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  responseId UNIQUEIDENTIFIER NOT NULL,
  questionId UNIQUEIDENTIFIER NOT NULL,
  answer NVARCHAR(MAX), -- JSON for complex answers
  textAnswer NVARCHAR(MAX), -- For text-based answers
  numericAnswer DECIMAL(18,4), -- For numeric answers
  createdAt DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY (responseId) REFERENCES survey_responses(id) ON DELETE CASCADE,
  FOREIGN KEY (questionId) REFERENCES survey_questions(id)
);
```

#### 7. Survey_Templates Table
```sql
CREATE TABLE survey_templates (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  name NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX),
  category NVARCHAR(100),
  thumbnail NVARCHAR(500),
  structure NVARCHAR(MAX) NOT NULL, -- JSON for survey structure
  isPublic BIT DEFAULT 0,
  createdBy UNIQUEIDENTIFIER,
  usageCount INT DEFAULT 0,
  rating DECIMAL(3,2),
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY (createdBy) REFERENCES users(id)
);
```

## Core Modules

### 1. App Module (Root)

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SurveysModule } from './modules/surveys/surveys.module';
import { ResponsesModule } from './modules/responses/responses.module';
import { getDatabaseConfig } from './config/database.config';
import { validationSchema } from './config/validation.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    
    // Feature modules
    AuthModule,
    UsersModule,
    SurveysModule,
    ResponsesModule,
  ],
})
export class AppModule {}
```

### 2. Surveys Module

```typescript
// src/modules/surveys/surveys.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveysController } from './surveys.controller';
import { SurveysService } from './surveys.service';
import { Survey } from '../../entities/survey.entity';
import { SurveyPage } from '../../entities/survey-page.entity';
import { SurveyQuestion } from '../../entities/survey-question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Survey, SurveyPage, SurveyQuestion]),
  ],
  controllers: [SurveysController],
  providers: [SurveysService],
  exports: [SurveysService],
})
export class SurveysModule {}
```

### 3. Survey Service

```typescript
// src/modules/surveys/surveys.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Survey } from '../../entities/survey.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey)
    private surveysRepository: Repository<Survey>,
    private dataSource: DataSource,
  ) {}

  async createSurvey(createSurveyDto: CreateSurveyDto, userId: string): Promise<Survey> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create survey
      const survey = this.surveysRepository.create({
        ...createSurveyDto,
        userId,
      });
      const savedSurvey = await queryRunner.manager.save(survey);

      // Create pages and questions
      if (createSurveyDto.pages) {
        for (const pageData of createSurveyDto.pages) {
          const page = this.pagesRepository.create({
            ...pageData,
            surveyId: savedSurvey.id,
          });
          const savedPage = await queryRunner.manager.save(page);

          if (pageData.questions) {
            for (const questionData of pageData.questions) {
              const question = this.questionsRepository.create({
                ...questionData,
                pageId: savedPage.id,
              });
              await queryRunner.manager.save(question);
            }
          }
        }
      }

      await queryRunner.commitTransaction();
      return savedSurvey;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllSurveys(userId: string, filters?: any): Promise<Survey[]> {
    const queryBuilder = this.surveysRepository
      .createQueryBuilder('survey')
      .leftJoinAndSelect('survey.pages', 'pages')
      .leftJoinAndSelect('pages.questions', 'questions')
      .where('survey.userId = :userId', { userId });

    if (filters?.status) {
      queryBuilder.andWhere('survey.status = :status', { status: filters.status });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(survey.title LIKE :search OR survey.description LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return queryBuilder.getMany();
  }

  async findSurveyById(id: string, userId: string): Promise<Survey> {
    const survey = await this.surveysRepository
      .createQueryBuilder('survey')
      .leftJoinAndSelect('survey.pages', 'pages')
      .leftJoinAndSelect('pages.questions', 'questions')
      .where('survey.id = :id', { id })
      .andWhere('survey.userId = :userId', { userId })
      .getOne();

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    return survey;
  }

  async updateSurvey(id: string, updateSurveyDto: UpdateSurveyDto, userId: string): Promise<Survey> {
    const survey = await this.findSurveyById(id, userId);
    
    // Update survey
    Object.assign(survey, updateSurveyDto);
    
    // Handle pages and questions updates
    if (updateSurveyDto.pages) {
      // Delete existing pages and questions
      await this.questionsRepository.delete({ pageId: survey.pages.map(p => p.id) });
      await this.pagesRepository.delete({ surveyId: id });
      
      // Create new pages and questions
      for (const pageData of updateSurveyDto.pages) {
        const page = this.pagesRepository.create({
          ...pageData,
          surveyId: id,
        });
        const savedPage = await this.pagesRepository.save(page);

        if (pageData.questions) {
          for (const questionData of pageData.questions) {
            const question = this.questionsRepository.create({
              ...questionData,
              pageId: savedPage.id,
            });
            await this.questionsRepository.save(question);
          }
        }
      }
    }

    return this.surveysRepository.save(survey);
  }

  async deleteSurvey(id: string, userId: string): Promise<void> {
    const survey = await this.findSurveyById(id, userId);
    await this.surveysRepository.remove(survey);
  }

  async duplicateSurvey(id: string, userId: string): Promise<Survey> {
    const originalSurvey = await this.findSurveyById(id, userId);
    
    const duplicatedSurvey = this.surveysRepository.create({
      title: `${originalSurvey.title} (Copy)`,
      description: originalSurvey.description,
      userId,
      status: 'draft',
      settings: originalSurvey.settings,
      theme: originalSurvey.theme,
    });

    const savedSurvey = await this.surveysRepository.save(duplicatedSurvey);

    // Duplicate pages and questions
    for (const page of originalSurvey.pages) {
      const duplicatedPage = this.pagesRepository.create({
        name: page.name,
        orderIndex: page.orderIndex,
        surveyId: savedSurvey.id,
      });
      const savedPage = await this.pagesRepository.save(duplicatedPage);

      for (const question of page.questions) {
        const duplicatedQuestion = this.questionsRepository.create({
          name: question.name,
          type: question.type,
          title: question.title,
          description: question.description,
          placeholder: question.placeholder,
          required: question.required,
          orderIndex: question.orderIndex,
          validation: question.validation,
          conditionalLogic: question.conditionalLogic,
          styling: question.styling,
          options: question.options,
          pageId: savedPage.id,
        });
        await this.questionsRepository.save(duplicatedQuestion);
      }
    }

    return savedSurvey;
  }
}
```

## API Endpoints

### Survey Management Endpoints

```typescript
// src/modules/surveys/surveys.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';

@ApiTags('Surveys')
@Controller('surveys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new survey' })
  @ApiResponse({ status: 201, description: 'Survey created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createSurvey(
    @Body() createSurveyDto: CreateSurveyDto,
    @Request() req,
  ) {
    return this.surveysService.createSurvey(createSurveyDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all surveys for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Surveys retrieved successfully' })
  async findAllSurveys(
    @Request() req,
    @Query() filters: any,
  ) {
    return this.surveysService.findAllSurveys(req.user.id, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific survey by ID' })
  @ApiResponse({ status: 200, description: 'Survey retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  async findSurveyById(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.surveysService.findSurveyById(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a survey' })
  @ApiResponse({ status: 200, description: 'Survey updated successfully' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  async updateSurvey(
    @Param('id') id: string,
    @Body() updateSurveyDto: UpdateSurveyDto,
    @Request() req,
  ) {
    return this.surveysService.updateSurvey(id, updateSurveyDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a survey' })
  @ApiResponse({ status: 200, description: 'Survey deleted successfully' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  async deleteSurvey(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.surveysService.deleteSurvey(id, req.user.id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate a survey' })
  @ApiResponse({ status: 201, description: 'Survey duplicated successfully' })
  async duplicateSurvey(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.surveysService.duplicateSurvey(id, req.user.id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a survey' })
  @ApiResponse({ status: 200, description: 'Survey published successfully' })
  async publishSurvey(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.surveysService.publishSurvey(id, req.user.id);
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish a survey' })
  @ApiResponse({ status: 200, description: 'Survey unpublished successfully' })
  async unpublishSurvey(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.surveysService.unpublishSurvey(id, req.user.id);
  }
}
```

### Public Survey Endpoints

```typescript
// src/modules/surveys/public-surveys.controller.ts
import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PublicSurveysService } from './public-surveys.service';
import { SubmitResponseDto } from '../responses/dto/submit-response.dto';

@ApiTags('Public Surveys')
@Controller('public/surveys')
export class PublicSurveysController {
  constructor(private readonly publicSurveysService: PublicSurveysService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a public survey for response' })
  @ApiResponse({ status: 200, description: 'Survey retrieved successfully' })
  async getPublicSurvey(@Param('id') id: string) {
    return this.publicSurveysService.getPublicSurvey(id);
  }

  @Post(':id/response')
  @ApiOperation({ summary: 'Submit a survey response' })
  @ApiResponse({ status: 201, description: 'Response submitted successfully' })
  async submitResponse(
    @Param('id') surveyId: string,
    @Body() submitResponseDto: SubmitResponseDto,
    @Request() req,
  ) {
    return this.publicSurveysService.submitResponse(surveyId, submitResponseDto, req);
  }
}
```

## Validation & DTOs

### Create Survey DTO

```typescript
// src/modules/surveys/dto/create-survey.dto.ts
import { IsString, IsOptional, IsArray, IsBoolean, IsDateString, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({ description: 'Question name/identifier' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Question type' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Question title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Question description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Placeholder text' })
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiPropertyOptional({ description: 'Is question required' })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({ description: 'Question order index' })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;

  @ApiPropertyOptional({ description: 'Validation rules' })
  @IsOptional()
  @IsObject()
  validation?: any;

  @ApiPropertyOptional({ description: 'Conditional logic' })
  @IsOptional()
  @IsObject()
  conditionalLogic?: any;

  @ApiPropertyOptional({ description: 'Styling options' })
  @IsOptional()
  @IsObject()
  styling?: any;

  @ApiPropertyOptional({ description: 'Question options' })
  @IsOptional()
  @IsArray()
  options?: any[];
}

export class CreatePageDto {
  @ApiProperty({ description: 'Page name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Page order index' })
  @IsOptional()
  @IsNumber()
  orderIndex?: number;

  @ApiPropertyOptional({ description: 'Page questions' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
}

export class CreateSurveyDto {
  @ApiProperty({ description: 'Survey title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Survey description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Survey settings' })
  @IsOptional()
  @IsObject()
  settings?: any;

  @ApiPropertyOptional({ description: 'Survey theme' })
  @IsOptional()
  @IsObject()
  theme?: any;

  @ApiPropertyOptional({ description: 'Survey pages' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePageDto)
  pages?: CreatePageDto[];

  @ApiPropertyOptional({ description: 'Survey expiration date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
```

## Error Handling

### Global Exception Filter

```typescript
// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.message;
      } else {
        message = exception.message;
        error = exception.message;
      }
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : 'Unknown error',
    );

    // Send error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error,
    });
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
// src/modules/surveys/surveys.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SurveysService } from './surveys.service';
import { Survey } from '../../entities/survey.entity';

describe('SurveysService', () => {
  let service: SurveysService;
  let mockSurveyRepository: any;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveysService,
        {
          provide: getRepositoryToken(Survey),
          useValue: mockRepository,
        },
        {
          provide: 'DataSource',
          useValue: {
            createQueryRunner: jest.fn(() => ({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: mockRepository,
            })),
          },
        },
      ],
    }).compile();

    service = module.get<SurveysService>(SurveysService);
    mockSurveyRepository = module.get(getRepositoryToken(Survey));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSurvey', () => {
    it('should create a survey with pages and questions', async () => {
      const createSurveyDto = {
        title: 'Test Survey',
        description: 'Test Description',
        pages: [
          {
            name: 'Page 1',
            questions: [
              {
                name: 'q1',
                type: 'text-input',
                title: 'Test Question',
              },
            ],
          },
        ],
      };

      const userId = 'user-123';
      const mockSurvey = { id: 'survey-123', ...createSurveyDto };

      mockSurveyRepository.create.mockReturnValue(mockSurvey);
      mockSurveyRepository.save.mockResolvedValue(mockSurvey);

      const result = await service.createSurvey(createSurveyDto, userId);

      expect(result).toEqual(mockSurvey);
      expect(mockSurveyRepository.create).toHaveBeenCalledWith({
        ...createSurveyDto,
        userId,
      });
    });
  });
});
```

## Deployment

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mssql
      - DB_PORT=1433
      - DB_USERNAME=sa
      - DB_PASSWORD=YourStrong@Passw0rd
      - DB_DATABASE=surveyforge
    depends_on:
      - mssql
      - redis

  mssql:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Passw0rd
      - MSSQL_PID=Express
    ports:
      - "1433:1433"
    volumes:
      - mssql_data:/var/opt/mssql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mssql_data:
  redis_data:
```

### Environment-Specific Configurations

```typescript
// src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
```

## Best Practices

### 1. Code Organization
- Use feature-based module structure
- Keep controllers thin, business logic in services
- Use DTOs for data validation and transformation
- Implement proper error handling and logging

### 2. Security
- Implement JWT-based authentication
- Use role-based access control
- Validate all inputs using class-validator
- Implement rate limiting for public endpoints
- Use HTTPS in production

### 3. Performance
- Implement database indexing for frequently queried fields
- Use Redis for caching frequently accessed data
- Implement pagination for large datasets
- Use database transactions for complex operations

### 4. Monitoring & Logging
- Implement structured logging with Winston
- Add request/response logging middleware
- Monitor database performance
- Set up health check endpoints

### 5. Testing
- Write unit tests for services
- Write integration tests for controllers
- Use test databases for testing
- Implement CI/CD pipeline

### 6. Documentation
- Use Swagger for API documentation
- Maintain README files for each module
- Document database schema changes
- Keep deployment guides updated

## Frontend-Backend Integration

### API Service Layer (`src/services/api.js`)
The frontend communicates with the backend through a comprehensive API service layer:

```javascript
// Survey API services
export const surveyAPI = {
  // Get all surveys
  getSurveys: async (filters = {}) => {
    const response = await api.get('/surveys', { params: { filters } });
    return response.data;
  },

  // Get survey by ID
  getSurvey: async (id) => {
    const response = await api.get(`/surveys/${id}`);
    return response.data;
  },

  // Create new survey
  createSurvey: async (surveyData) => {
    const response = await api.post('/surveys', surveyData);
    return response.data;
  },

  // Update survey
  updateSurvey: async (id, surveyData) => {
    const response = await api.put(`/surveys/${id}`, surveyData);
    return response.data;
  },

  // Delete survey
  deleteSurvey: async (id) => {
    const response = await api.delete(`/surveys/${id}`);
    return response.data;
  },

  // Duplicate survey
  duplicateSurvey: async (id) => {
    const response = await api.post(`/surveys/${id}/duplicate`);
    return response.data;
  },

  // Publish survey
  publishSurvey: async (id) => {
    const response = await api.post(`/surveys/${id}/publish`);
    return response.data;
  },

  // Unpublish survey
  unpublishSurvey: async (id) => {
    const response = await api.post(`/surveys/${id}/unpublish`);
    return response.data;
  }
};
```

### Data Transformation Utilities (`src/utils/dataTransformers.js`)
The application includes comprehensive data transformation utilities:

```javascript
// Transform frontend survey data to backend API format
export const transformToBackendFormat = (frontendData) => {
  // Ensure all questions have unique orderIndex values
  const normalizedData = { ...frontendData };
  if (normalizedData.pages && Array.isArray(normalizedData.pages)) {
    normalizedData.pages = normalizedData.pages.map((page, pageIndex) => {
      const normalizedPage = { ...page, orderIndex: pageIndex };
      
      if (page.questions && Array.isArray(page.questions)) {
        normalizedPage.questions = page.questions.map((question, questionIndex) => ({
          ...question,
          orderIndex: questionIndex
        }));
      }
      
      return normalizedPage;
    });
  }
  
  const transformed = {
    title: String(normalizedData.title || ''),
    description: String(normalizedData.description || ''),
    settings: parseJsonField(normalizedData.settings) || {},
    theme: parseJsonField(normalizedData.theme) || {},
    isPublic: ensureBoolean(normalizedData.isPublic, false),
    allowAnonymous: ensureBoolean(normalizedData.allowAnonymous, true),
    expiresAt: ensureDate(normalizedData.expiresAt),
    pages: normalizedData.pages?.map(page => ({
      name: String(page.name || ''),
      orderIndex: ensureNumber(page.orderIndex, 0),
      questions: page.questions?.map(question => ({
        name: String(question.name || ''),
        type: String(mapQuestionType(question.type) || 'text'),
        title: String(question.title || ''),
        description: String(question.description || ''),
        placeholder: String(question.placeholder || ''),
        required: ensureBoolean(question.required, false),
        orderIndex: ensureNumber(question.orderIndex, 0),
        validation: parseJsonField(question.validation) || {},
        conditionalLogic: parseJsonField(question.conditionalLogic) || {},
        styling: parseJsonField(question.styling) || {},
        options: ensureArray(question.options)
      })) || []
    })) || []
  };
  
  return transformed;
};

// Transform backend API response to frontend format
export const transformToFrontendFormat = (backendData) => {
  const transformed = {
    id: backendData.id,
    title: backendData.title || '',
    description: backendData.description || '',
    currentPageId: backendData.pages?.[0]?.id || 'page_1',
    pages: backendData.pages?.map(page => ({
      id: page.id,
      name: page.name || '',
      orderIndex: page.orderIndex || 0,
      questionCount: page.questions?.length || 0,
      questions: page.questions?.map(question => ({
        id: question.id,
        name: question.name || '',
        type: mapBackendQuestionType(question.type),
        icon: getQuestionIcon(question.type),
        title: question.title || '',
        description: question.description || '',
        placeholder: question.placeholder || '',
        required: question.required || false,
        orderIndex: question.orderIndex || 0,
        validation: parseJsonField(question.validation) || {},
        conditionalLogic: parseJsonField(question.conditionalLogic) || {},
        styling: parseJsonField(question.styling) || {},
        options: parseJsonField(question.options) || []
      })) || []
    })) || []
  };
  
  return transformed;
};
```

### Authentication & Security
The frontend implements secure authentication with the backend:

```javascript
// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Error Handling & Validation
Comprehensive error handling ensures robust frontend-backend communication:

```javascript
// Validate backend data before processing
export const validateBackendData = (data) => {
  if (!data) {
    throw new Error('No data provided');
  }
  
  if (!data.title) {
    throw new Error('Survey title is required');
  }
  
  if (!data.pages || !Array.isArray(data.pages)) {
    throw new Error('Survey must have at least one page');
  }
  
  // Validate each page and question
  data.pages.forEach((page, pageIndex) => {
    if (!page.name) {
      throw new Error(`Page ${pageIndex + 1} must have a name`);
    }
    
    if (page.questions && Array.isArray(page.questions)) {
      page.questions.forEach((question, questionIndex) => {
        if (!question.title) {
          throw new Error(`Question ${questionIndex + 1} in page "${page.name}" must have a title`);
        }
      });
    }
  });
  
  return data;
};
```

## Getting Started

1. **Clone and Setup**
   ```bash
   git clone <your-repo>
   cd surveyforge-backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   # Create database
   # Run migrations
   npm run migration:run
   ```

4. **Start Development Server**
   ```bash
   npm run start:dev
   ```

5. **Access Swagger Documentation**
   ```
   http://localhost:3000/api/docs
   ```

This backend setup provides a solid foundation for your SurveyForge application with proper separation of concerns, security, validation, and scalability in mind.
