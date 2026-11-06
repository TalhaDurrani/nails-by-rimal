// Preserve case-insensitive matching without treating email characters as SQL wildcards.
export function literalEmailPattern(email: string): string {
  return email.replace(/[\\%_]/g, '\\$&');
}
