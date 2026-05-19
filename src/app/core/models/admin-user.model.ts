export interface AdminUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'admin';
}
