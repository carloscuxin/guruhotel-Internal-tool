import { getModelForClass, prop as Property } from '@typegoose/typegoose';
import { Role } from '../utils/Enum';


export class User {
  readonly _id: string;

  @Property({ required: true })
  user: string;

  @Property({ required: true, type: String })
  role: Role;
}

export const UserModel = getModelForClass(User);
