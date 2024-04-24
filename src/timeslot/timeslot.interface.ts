/**
 * Interface representing separated time slots with booking dates.
 * Each key represents a time slot, and its value is an array of objects containing booking time and dates.
 */

interface SeparatedTimeSlots {
  [key: string]: { time: string; bookingDate: string[] }[];
}

export { SeparatedTimeSlots };
