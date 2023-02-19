import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
// import { JwtService } from '@nestjs/jwt';

@Injectable()
export class permissionMiddleware implements NestMiddleware {
  // constructor(
  //     private jwtService: JwtService,
  // ) {}
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...', req.user);
    // let token= req.headers.authorization.split(" ")[1];

    // let payload = this.jwtService.decode(token);
    // console.log(payload,"payload")

    next();
  }
}
