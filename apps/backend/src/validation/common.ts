import { ValidationError } from "../errors/httpError";
export const asObject = (value: unknown, fieldName = "body"): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an object`);
  }
  return value as Record<string, unknown>;
};
export const asString = (value: unknown, fieldName: string, required = true): string => {
  if (value === undefined || value === null || value === "") {
    if (required) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return "";
  }
  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }
  const trimmed = value.trim();
  if (required && !trimmed) {
    throw new ValidationError(`${fieldName} is required`);
  }
  return trimmed;
};
export const asOptionalString = (value: unknown, fieldName: string): string | undefined => {
  const normalized = asString(value, fieldName, false);
  return normalized ? normalized : undefined;
};
export const asDateString = (value: unknown, fieldName: string): string => {
  const date = asString(value, fieldName);
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    throw new ValidationError(`${fieldName} must be a valid date string`);
  }
  return d.toISOString();
};
export const asNumber = (value: unknown, fieldName: string, fallback = 0): number => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new ValidationError(`${fieldName} must be a number`);
  }
  return num;
};
