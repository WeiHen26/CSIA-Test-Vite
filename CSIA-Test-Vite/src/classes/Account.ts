export class Account {
  private userId: string;
  private email: string;
  private name: string;
  private role: string;

  constructor(userId: string, email: string, name: string, role: string) {
    this.userId = userId;
    this.email = email;
    this.name = name;
    this.role = role;
  }

  public getUserId(){
    return this.userId;
  }

  public getEmail(){
    return this.email;
  }

  public getName(){
    return this.name;
  }
  public getRole(){
    return this.role;
  }
}

