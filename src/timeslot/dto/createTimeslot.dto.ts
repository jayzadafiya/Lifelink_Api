class SlotData {
  time: string;
  bookingDate: string;
}

export class TimeslotDTO {
  [key: string]: SlotData[];
}
