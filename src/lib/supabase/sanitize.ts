/**
 * Utilities to sanitize user inputs used in Supabase / PostgREST query filters
 * to prevent PostgREST filter injection and query parsing failures (HTTP 400).
 */

/**
 * Sanitizes search keywords intended for PostgREST filter clauses (e.g. `.or()` or `.ilike()`).
 *
 * PostgREST uses commas (`,`) to delimit clauses in `.or=(...)`, dots (`.`) to delimit
 * `column.operator.value`, parentheses (`()`) to group filters, and quotes/backslashes
 * for string boundary handling.
 *
 * This function strips those structural characters and collapses consecutive whitespace,
 * returning a safe string that will not cause PostgREST syntax errors or filter alteration.
 */
export function sanitizePostgrestFilterTerm(input?: string | null): string {
  if (!input) return "";

  return input
    .replace(/[,().\\"'%]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Sanitizes an identifier (UUID, slug, reference number) intended for exact match
 * interpolation in PostgREST `.or()` clauses (e.g. `id.eq.${id},slug.eq.${id}`).
 *
 * Retains only alphanumeric characters, hyphens, and underscores.
 */
export function sanitizePostgrestIdentifier(input?: string | null): string {
  if (!input) return "";

  return input.replace(/[^a-zA-Z0-9\-_]/g, "").trim();
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Checks whether a given string is a valid UUID format.
 * Prevents PostgreSQL 22P02 errors (invalid syntax for type uuid)
 * when querying against UUID columns in PostgreSQL.
 */
export function isUuid(input?: string | null): boolean {
  if (!input) return false;
  return UUID_REGEX.test(input.trim());
}


