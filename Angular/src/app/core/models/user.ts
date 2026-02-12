export class User {
  public id: number;
  public email: string;
  public name: string;
  public phone_number: string;
  public role: 'ADMIN' | 'STAFF' | 'CLIENT';

  constructor(
    id: number,
    email: string,
    name: string,
    phone_number: string,
    role: string
  ) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.phone_number = phone_number;
    this.role = (role?.toUpperCase() || 'CLIENT') as 'ADMIN' | 'STAFF' | 'CLIENT';
  }

  get isAdmin(): boolean { return this.role === 'ADMIN'; }
  get isStaff(): boolean { return this.role === 'STAFF'; }
  get isClient(): boolean { return this.role === 'CLIENT'; }
}