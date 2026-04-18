import type { PersonNameFields } from "./user-initials";

type UserHandleFields = {
  readonly email?: string | null;
  readonly username?: string | null;
};

export function displayNameFromPersonNameFields(
  person: PersonNameFields,
  fallback = "Member"
): string {
  const fromFullName = person.fullName?.trim();
  if (fromFullName) {
    return fromFullName;
  }

  const fromSplit = [person.firstName, person.lastName].filter(Boolean).join(" ").trim();
  if (fromSplit) {
    return fromSplit;
  }

  return fallback;
}

function normalizeHandle(raw: string | null | undefined): string {
  if (!raw || raw.trim().length === 0) {
    return "@member";
  }
  const trimmed = raw.trim();
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export function handleFromUserFields(user: UserHandleFields): string {
  if (user.username) {
    return normalizeHandle(user.username);
  }
  const emailPrefix = user.email?.split("@")[0];
  return normalizeHandle(emailPrefix);
}

