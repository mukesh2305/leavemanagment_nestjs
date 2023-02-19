import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import 'dotenv/config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CommandModule, CommandService } from 'nestjs-command';
// import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'verbose', 'debug'],
    cors: true,
  });

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  // app.useStaticAssets(join(__dirname, '..', 'uploads'));

  const config = new DocumentBuilder()
    .setTitle('leave management')
    .setDescription('Leave management API description')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      bearerFormat: 'JWT',
      scheme: 'bearer',
      description: 'Please enter access token',
      name: 'Access token',
    })
    // .addBearerAuth(
    //   { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    //   'access-token',
    // )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors();
  // app.use(helmet());

  await app.listen(process.env.PORT, () => {
    console.log(`🚀  Server is running on port ${process.env.PORT}`);
  });
}
bootstrap();
