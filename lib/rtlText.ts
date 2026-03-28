/**
 * Reverses a Hebrew/RTL string so jsPDF renders it in the correct visual order.
 * Leaves LTR segments (ASCII tab lines) untouched when called selectively.
 * For pure-Hebrew text a simple full-string character reverse is the standard
 * workaround when using jsPDF (which draws text LTR internally).
 */
export function reverseRtl(text: string): string {
  return text.split('').reverse().join('');
}
