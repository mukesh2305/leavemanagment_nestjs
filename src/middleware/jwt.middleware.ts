import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from '../auth/constants';
import { UserService } from '../user/user.service';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // console.log("checkpoint 1");
    const username = req.body.username;
    const password = req.body.password;
    // const email = req.body.email;
    // const googleId = req.body.googleId;
    // if(email && googleId) {
    const googleToken = req.body.tokenId,
      clientID =
        '569924139795-rrk117k5euht7m0rudtkfmtb4m4kaudv.apps.googleusercontent.com';
    if (googleToken && clientID) {
      const client = new OAuth2Client(clientID);
      async function verify() {
        const ticket = await client.verifyIdToken({
          idToken: googleToken,
          audience: clientID,
        });
        return ticket.getPayload();
      }
      try {
        const data = await verify();
        // console.log(data);
        if (data.email_verified) {
          const user = await this.userService.findEmail(data.email);
          // console.log(user, 'user');
          if (user) {
            if (user.status === 'active') {
              const payload = {
                username: user.email,
                sub: user._id,
                role: user.user_role,
              };
              const access_token = this.jwtService.sign(payload);

              res.status(200).send({
                access_token: access_token,
                data: user,
              });
            } else {
              throw new UnauthorizedException('User is not active');
            }
          } else {
            throw new UnauthorizedException('User not found');
          }
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      const user = await this.userService.findEmail(username);
      // console.log(user, 'user');
      if (user) {
        if (user.status === 'active') {
          const verifyPassword = await bcrypt.compare(password, user.password);
          // console.log(verifyPassword, 'verifyPassword');
          if (verifyPassword) {
            const payload = {
              username: user.email,
              sub: user._id,
              role: user.user_role,
            };
            const access_token = this.jwtService.sign(payload);

            res.status(200).send({
              access_token: access_token,
              data: user,
            });
          } else {
            throw new UnauthorizedException('Invalid credentials');
          }
        } else {
          throw new UnauthorizedException('User is inactive');
        }
      } else {
        throw new UnauthorizedException('User not found');
      }
    }
    // verifier.verify(googleToken, clientID, function (err, tokenInfo) {
    //   console.log(err, ' err');
    //   if (!err) {
    //     // use tokenInfo in here.
    //     console.log(tokenInfo, '>>>>>>>>>>>>>>..');
    //   }
    // });

    // console.log(username, password);
  }
}
