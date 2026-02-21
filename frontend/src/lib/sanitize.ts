/**
 * Sanitizes a string by removing potentially dangerous characters.
 * Allows alphanumeric, spaces, dots, hyphens, and underscores.
 */
export function sanitizeInput(value: string): string {
    return value.replace(/[^a-zA-Z0-9\s.\-_]/g, '');
}

/**
 * Sanitizes a ticker symbol: uppercase alphanumeric only, max 10 chars.
 */
export function sanitizeTicker(value: string): string {
    return value.replace(/[^a-zA-Z0-9.]/g, '').toUpperCase().slice(0, 10);
}

/**
 * Validates an email address format.
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Sanitizes an email input: only allow email-safe characters.
 */
export function sanitizeEmail(value: string): string {
    return value.replace(/[^a-zA-Z0-9@.\-_+]/g, '').slice(0, 254);
}
