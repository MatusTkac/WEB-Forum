import { Group } from "./group";

export class User {

  public static clone(user: User): User {
    return new User(user.name, user.email, user.id, user.lastLogin, user.active, user.password, user.groups?.map(g => Group.clone(g)) || []);
  }

  constructor(
    public name: string,
    public email: string,
    public id?: number,
    public lastLogin?: Date,
    public active: boolean = true,
    public password: string = '',
    public groups: Group[] = []
  ){}

  toString() {
    return `[${this.id}, ${this.name}]`;
  }
}