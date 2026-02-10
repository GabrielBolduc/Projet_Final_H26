export class staff {
    public user_id: number;
    public email: string;
    public username: string;
    public telephone: string;
    readonly role: string;
    public ability: string;
  
    constructor(
      public id: number, 
      public user_email: string, 
      username: string, 
      telephone: string,  
      role: string
      , ability: string
    ) {
      this.user_id = id;
      this.email = user_email;
      this.username = username ;
      this.telephone = telephone ;
      this.ability = ability ;
      this.role = role ;
    }
  }