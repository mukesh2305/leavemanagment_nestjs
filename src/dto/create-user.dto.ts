export class CreateUserDto {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  department: string;
  role: string;
  reporting_manager: string;
  leave_rules: string;
  details: string;
  leave_balance: number;
  status: string;
}
