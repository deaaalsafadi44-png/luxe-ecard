export const guestSlugFormatter = {
  normalize(rawGuestValue: string): string {
    return rawGuestValue.trim().toLowerCase().replace(/\s+/g, "-");
  },
};
