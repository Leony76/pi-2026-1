export function toClientAllocationType(allocationType: string) {
  if (allocationType === "WEEK") {
    return "WEEK";
  }

  return allocationType as "DAILY" | "WEEK" | "MONTH" | string;
}