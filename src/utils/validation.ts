import { AppError } from './AppError';

export function parsePositiveInteger(value: unknown, fieldName: string): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new AppError(`${fieldName} must be a positive integer`, 400);
  }
  return parsed;
}

export function parseNonEmptyString(value: unknown, fieldName: string, maxLength = 5000): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError(`${fieldName} must be a non-empty string`, 400);
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new AppError(`${fieldName} must not exceed ${maxLength} characters`, 400);
  }
  return normalized;
}
