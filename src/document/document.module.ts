import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DocUpload, DocUploadSchema } from 'src/schemas/document.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocUpload.name, schema: DocUploadSchema },
    ]),
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
