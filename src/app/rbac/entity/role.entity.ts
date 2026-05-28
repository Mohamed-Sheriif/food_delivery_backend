export class Role {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Role>) {
    this.id = data.id!;
    this.name = data.name!;
    this.displayName = data.displayName!;
    this.description = data.description ?? null;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }
}
