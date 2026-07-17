export interface ValidationResult {
  valid: boolean;
  message: string;
}

export function requiredText(value: string | undefined, label: string): ValidationResult {
  return value?.trim()
    ? { valid: true, message: "" }
    : { valid: false, message: `${label} is required.` };
}

export function validUrl(value: string | undefined, label: string, required = false): ValidationResult {
  if (!value?.trim()) {
    return required ? { valid: false, message: `${label} is required.` } : { valid: true, message: "" };
  }

  try {
    new URL(value);
    return { valid: true, message: "" };
  } catch {
    return { valid: false, message: `${label} must be a valid URL.` };
  }
}

export function validDate(value: string | undefined, label: string): ValidationResult {
  if (!value) {
    return { valid: false, message: `${label} is required.` };
  }

  return Number.isNaN(new Date(value).getTime())
    ? { valid: false, message: `${label} must be a valid date.` }
    : { valid: true, message: "" };
}

export function validFileSize(file: File | null, maxMb: number): ValidationResult {
  if (!file) {
    return { valid: false, message: "Please select a file." };
  }

  return file.size <= maxMb * 1024 * 1024
    ? { valid: true, message: "" }
    : { valid: false, message: `File must be under ${maxMb}MB.` };
}

export function firstInvalid(...results: ValidationResult[]) {
  return results.find((result) => !result.valid)?.message || "";
}
