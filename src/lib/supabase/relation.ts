/**
 * PostgREST returns a single object for a to-one embed (`subjects(name)` on a
 * row that has a `subject_id` FK) and an array for a to-many one. Without
 * generated database types TypeScript cannot tell the two apart, so this
 * codebase read `?.[0]?` everywhere — which resolves to `undefined` on every
 * to-one embed. That is why joined names all rendered as their placeholder:
 * every mistake showed "Unsorted", every circle member showed "Member".
 *
 * Normalising both shapes fixes the reads without depending on which one the
 * server sends, and keeps working if generated types are introduced later.
 */
export function toOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
