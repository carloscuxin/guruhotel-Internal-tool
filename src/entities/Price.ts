import { Field, ID, Int, ObjectType } from 'type-graphql';
import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
import { Room } from './Room';
import { DateScalar } from '../utils/DateScalar';


@ObjectType()
export class Price {
  @Field(() => ID)
  readonly _id: string;

  @Field()
  @Property({ required: true })
  competitor_name: string;

  @Field()
  @Property({ required: true })
  currency: string;

  @Field(() => Int)
  @Property({ required: true })
  taxes: number;

  @Field(() => Int)
  @Property({ required: true })
  amount: number;

  @Field(() => DateScalar)
  @Property({ required: true })
  date: Date;

  @Field(() => Room)
  @Property({ required: true, ref: 'Room' })
  room: Ref<Room>;
}

export const PriceModel = getModelForClass(Price);
