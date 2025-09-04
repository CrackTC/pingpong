export function validatePassword(password: string): string | null {
  if (password.length < 8 || password.length > 16) {
    return "Password must be between 8 and 16 characters long.";
  }
  if (!/[a-zA-Z]/.test(password)) {
    return "Password must contain at least one alphabet character.";
  }
  if (!/\d/.test(password)) {
    return "Password must contain at least one number.";
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return "Password must contain at least one special symbol.";
  }
  return null; // Password is valid
}
