export interface UpdateProfileType {
  name: string;
  email: string;
}

export interface UpdatePasswordType {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
