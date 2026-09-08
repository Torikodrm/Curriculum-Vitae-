export type AvatarGender = "male" | "female";

export function normalizeAvatarGender(value: string | undefined): AvatarGender {
  return value?.trim().toLowerCase() === "female" ? "female" : "male";
}

export const avatarGender = normalizeAvatarGender(process.env.NEXT_PUBLIC_AVATAR_GENDER);

const fallbackValue = (value: string | undefined, fallback: string) => value?.trim() || fallback;

export const profile = {
  firstName: fallbackValue(process.env.NEXT_PUBLIC_PROFILE_FIRST_NAME, "Arian"),
  lastName: fallbackValue(process.env.NEXT_PUBLIC_PROFILE_LAST_NAME, "Rohe"),
  role: fallbackValue(process.env.NEXT_PUBLIC_PROFILE_ROLE, "Independent designer & developer"),
  email: fallbackValue(process.env.NEXT_PUBLIC_PROFILE_EMAIL, "hello@arianrohe.com"),
  intro: fallbackValue(process.env.NEXT_PUBLIC_PROFILE_INTRO, "I compose identities, interfaces and digital worlds for people shaping culture."),
  availability: fallbackValue(process.env.NEXT_PUBLIC_PROFILE_AVAILABILITY, "Available for select collaborations / 2024—25"),
  year: fallbackValue(process.env.NEXT_PUBLIC_PROFILE_YEAR, "2024"),
};
