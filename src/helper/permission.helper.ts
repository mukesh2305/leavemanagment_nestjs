export async function validatePermission(req, permission): Promise<any> {
  // console.log("permission",permission)
  console.log('req.user helper', req.user);
  if (req.user) {
    if (req.user.role.role_name == 'superAdmin') {
      console.log('superAdmin>>>');
      return true;
      // } else if (req.user.role.role_name == 'admin') {
      //   return true;
    } else {
      // if (req.user.user_id == req.param.id) {
      //   return true;
      // }
      if (req.user.permission.includes(permission)) {
        // console.log('permission22', permission);
        // console.log("responseData",responseData)

        return true;
      } else {
        return false;
      }
    }
  } else {
    return false;
  }
  // let rolePermission= await this.RoleService.findOne(role)
  // console.log("rolePermission",rolePermission)
}
export async function employeeAuthorization(req, id): Promise<any> {
  console.log(req.user, 'req.user');
  if (req.user) {
  }
  if (req.user.role.role_name == 'superAdmin') {
    return true;
  } else {
    console.log('req.user.user_id', req.user.user_id);
    console.log('id', id);
    if (req.user.user_id.equals(id)) {
      return true;
    } else {
      return false;
    }
  }
}

export async function adminAuthorization(req): Promise<any> {
  if (
    req.user.role.role_name == 'superAdmin' ||
    req.user.role.role_name == 'admin'
  ) {
    return true;
  } else {
    return false;
  }
}

// }
