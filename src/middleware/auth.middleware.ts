import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
// import { jwtConstants } from '../auth/constants';
import { UserService } from '../user/user.service';
import { RoleService } from 'src/role/role.service';

@Injectable()
export class authMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeaders = req.headers.authorization;
    // next(); //by passing
    // console.log(req.headers, 'authHeaders');
    if (authHeaders && (authHeaders as string).split(' ')[1]) {
      const token = (authHeaders as string).split(' ')[1];
      // console.log(token, 'token');
      let decoded;
      try {
        decoded = await this.jwtService.verify(token);
        // console.log(decoded, 'decoded');
        req.user = decoded;
        // console.log(req.user, 'req.user');
      } catch (error) {
        throw new UnauthorizedException('Invalid token or expired token');
      }
      // console.log(decoded, 'decoded');
      if (decoded) {
        const user = await this.userService.findById(decoded.sub);
        if (user) {
          if (user.status === 'active') {
            const userRole = await this.roleService.findById(decoded.role);
            // console.log(userRole, 'userRole');
            const permissionArray = [];
            userRole.permission.forEach((element) => {
              permissionArray.push(element.permission_name);
            });
            // console.log(permissionArray, 'permissionArray');
            Object.assign(req.user, { permission: permissionArray });
            Object.assign(req.user, { role_name: userRole.role_name });
            Object.assign(req.user, { user_id: user._id });
            next();
          } else {
            throw new UnauthorizedException('User is not active');
          }
        } else {
          throw new UnauthorizedException();
        }
      } else {
        throw new UnauthorizedException('Token is not valid');
      }
    } else {
      throw new UnauthorizedException('Token not found ');
    }
  }
}
