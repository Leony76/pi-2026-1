export function toPrismaAllocationType(allocationType: "DAILY" | "WEEK" | "MONTH") {
  if (allocationType === "DAILY") {
    return "DAILY";
  }

  if (allocationType === "WEEK") {
    return "WEEK";
  }

  return "MONTH";
}