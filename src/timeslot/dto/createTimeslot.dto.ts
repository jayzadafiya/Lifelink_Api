class TimeSlotDto {
  [key: string]: string[];
}

export class CreateTimeslotsDto {
  timeSlots: TimeSlotDto[];
}
