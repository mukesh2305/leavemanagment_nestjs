import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';

    response.on('finish', () => {
      const { statusCode } = response;
      //   const  data  = response.locals.res || {};
      const contentLength = response.get('content-length');

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}>>>>${new Date()} `,
      );
      fs.createWriteStream('./log/log.txt', {
        flags: 'a',
      }).write(
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip} ${new Date()}>>>>\n`,
      );
    });

    next();
  }
}
