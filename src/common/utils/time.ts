export function secondsToMilliseconds(seconds: number) {
  return seconds * 1000;
}
export function toISO8601(inputDate: string | Date): string {
  // Step 1: Parse the inputDate to a Date object if it's a string.
  let date: Date;
  
  if (typeof inputDate === "string") {
    date = new Date(inputDate);
    
    // Validate the parsed date
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string provided");
    }
  } else if (inputDate instanceof Date) {
    date = inputDate;
  } else {
    throw new Error("Input must be a valid Date object or a string");
  }

  // Step 2: Convert the Date object to an ISO-8601 string
  return date.toISOString();
}