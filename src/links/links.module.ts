import { Module } from '@nestjs/common';
   import { TypeOrmModule } from '@nestjs/typeorm';
   import { LinksService } from './links.service';
   import { Link } from './entities/link.entity';

   @Module({
     imports: [TypeOrmModule.forFeature([Link])],
     providers: [LinksService],
     exports: [LinksService],
   })
   export class LinksModule {}