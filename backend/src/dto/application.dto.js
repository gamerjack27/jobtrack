// Mass-assignment protection for incoming application updates
export function toApplicationUpdateDTO(input) {
  const allowed = ["company", "jobTitle", "status", "appliedDate", "salary", "location", "notes"];
  const updateData = {};
  
  for (const key of allowed) {
    if (key in input) {
      updateData[key] = input[key];
    }
  }

  return updateData;
}