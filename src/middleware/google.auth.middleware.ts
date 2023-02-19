import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import * as verifier from 'google-id-token-verifier';

import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleService } from 'src/role/role.service';
import { UserService } from 'src/user/user.service';

config();

@Injectable()
export class GoogleStrategy implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
  ) {}
  // @Injectable()
  // export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  //   constructor() {
  //     super({
  //       clientID: process.env.GOOGLE_CLIENT_ID,
  //       clientSecret: process.env.GOOGLE_SECRET,
  //       callbackURL: 'http://localhost:3000/google/redirect',
  //       scope: ['email', 'profile'],
  //     });
  //   }
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeaders = req.headers.authorization;
    const user = {
      email: req.body.email,
      firstName: req.body.familyName,
      lastName: req.body.givenName,
      picture: req.body.imageUrl,
      googleId: req.body.googleId,
    };
    const googleToken = req.body.googleId,
      clientID = process.env.GOOGLE_CLIENT_ID;
    verifier.verify(googleToken, clientID, function (err, tokenInfo) {
      if (!err) {
        // use tokenInfo in here.
        console.log(tokenInfo);
      }
    });
    next();
  }

  //   async use(
  //     accessToken: string,
  //     refreshToken: string,
  //     profile: any,
  //     done: VerifyCallback,
  //   ): Promise<any> {
  //       done(null, profile);
  //       console.log(profile);
  //     const { name, emails, photos } = profile;
  //     console.log(name);
  //     console.log(emails);
  //     console.log(photos);

  //     const user = {
  //       email: emails[0].value,
  //       firstName: name.givenName,
  //       lastName: name.familyName,
  //       picture: photos[0].value,
  //       accessToken,
  //     };
  //     console.log(user, 'user');
  //     done(null, user);
  //   }
}
