export class PasswordReset {
  id: number;
  userId: number;
  otpHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;

  constructor(passwordReset: Partial<PasswordReset>) {
    this.id = passwordReset.id!;
    this.userId = passwordReset.userId!;
    this.otpHash = passwordReset.otpHash!;
    this.expiresAt = passwordReset.expiresAt!;
    this.createdAt = passwordReset.createdAt!;
    this.consumedAt = passwordReset.consumedAt ?? null;
  }

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }
}
