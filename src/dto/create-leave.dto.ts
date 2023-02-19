export class CreateLeaveDto {
  leave_type: string;
  leave_amount: number;
  applied_by: string;
  startDateLeaveType: string;
  endDateLeaveType: string;
  startDate: Date;
  endDate: Date;
  user_id: string;
  reason: string;
  status: string;
  approved_by: string;
  rejection_reason: string;
}

//6 fields
