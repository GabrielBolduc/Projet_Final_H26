export class User {
  public id: number;
  public email: string;
  public name: string;
  public phone_number: string;
  public type: 'Admin' | 'Staff' | 'Client'; 
  public ability?: string;

  constructor(
    id: number,
    email: string,
    name: string,
    phone_number: string,
    type: string,
    ability?: string
  ) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.phone_number = phone_number;
    
    this.type = (type || 'Client') as 'Admin' | 'Staff' | 'Client';
    
    this.ability = ability;
  }

  get isAdmin(): boolean { return this.type === 'Admin'; }
  get isStaff(): boolean { return this.type === 'Staff'; }
  get isClient(): boolean { return this.type === 'Client'; }
}