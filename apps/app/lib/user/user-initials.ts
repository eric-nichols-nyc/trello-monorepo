export type PersonNameFields = {
  readonly email?: string | null;
  readonly firstName?: string | null;
  readonly fullName?: string | null;
  readonly lastName?: string | null;
};

/**
 * First letter of first name + first letter of last name when both exist;
 * otherwise derives up to two characters from a single name, full name, or email.
 */
export function initialsFromPersonNameFields(person: PersonNameFields): string {
  const first = person.firstName?.trim();
  const last = person.lastName?.trim();
  if (first && last) {
    return `${first[0]!}${last[0]!}`.toUpperCase();
  }
  if (first) {
    return first.slice(0, 2).toUpperCase();
  }
  if (last) {
    return last.slice(0, 2).toUpperCase();
  }
  const full = person.fullName?.trim();
  if (full) {
    const parts = full.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0]!}${parts.at(-1)![0]!}`.toUpperCase();
    }
    if (parts.length === 1) {
      return parts[0]!.slice(0, 2).toUpperCase();
    }
  }
  const email = person.email?.trim();
  if (email) {
    return email[0]!.toUpperCase();
  }
  return "?";
}
