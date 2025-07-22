interface ValidateUserInput {
  username?: string;
  password?: string;
  name?: string;
  email?: string;
  confirmPassword?: string;
}

interface ValidateUserOptions {
  isSignup?: boolean;
}

function validateUser(
  { username, password, name, email, confirmPassword }: ValidateUserInput = {},
  { isSignup = false }: ValidateUserOptions = {}
): string[] {
  const errors: string[] = [];

  // Username
  if (!username || username.trim() === "") {
    errors.push("Username is required");
  }

  // Password
  if (!password || password.trim() === "") {
    errors.push("Password is required");
  }

  // On signup, check extra fields
  if (isSignup) {
    if (!name || name.trim() === "") {
      errors.push("Name is required");
    }
    if (!email || email.trim() === "") {
      errors.push("Email is required");
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.push("Email is invalid");
    }
    if (!confirmPassword || confirmPassword !== password) {
      errors.push("Passwords do not match");
    }
  }

  return errors;
}

export default validateUser;
