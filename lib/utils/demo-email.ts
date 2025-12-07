/**
 * Demo Email Utilities
 * Handles email interception for demo accounts
 */

/**
 * Check if an email is a demo account
 */
export function isDemoEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@digidocsdemo.com');
}

/**
 * Check if any emails in an array are demo accounts
 */
export function hasDemoEmails(emails: string | string[]): boolean {
  const emailArray = Array.isArray(emails) ? emails : [emails];
  return emailArray.some(email => isDemoEmail(email));
}

/**
 * Get demo user name from email
 */
export function getDemoUserName(email: string): string {
  if (!isDemoEmail(email)) return email;
  
  const name = email.split('@')[0];
  return name
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Replace demo emails with a real email address
 */
export function replaceDemoEmail(
  originalEmail: string | string[],
  realEmail: string
): string | string[] {
  if (Array.isArray(originalEmail)) {
    return originalEmail.map(email => isDemoEmail(email) ? realEmail : email);
  }
  return isDemoEmail(originalEmail) ? realEmail : originalEmail;
}
