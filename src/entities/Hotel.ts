import { prop as Property, getModelForClass } from '@typegoose/typegoose';
import { Room } from './Room';


export class Hotel {
  readonly id: string;

  @Property({ required: true })
  hotel_id: number;

  @Property({ required: true })
  name: string;

  @Property({ required: true })
  city: string;

  @Property({ required: true })
  state: string;

  @Property({ type: () => Room })
  rooms: Room[];
}

export const HotelModel = getModelForClass(Hotel);
