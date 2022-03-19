import { Field, ID, Int, ObjectType } from 'type-graphql';
import { prop as Property } from '@typegoose/typegoose';
// Own Libs
import { RoomType } from '../utils/Enum';
import { Price } from './Price';
import { Metric } from './Metric';
import { DateScalar } from '../utils/DateScalar';


@ObjectType()
export class Room {
  @Field(() => ID)
  @Property({ required: true })
  room_id: string;

  @Field()
  @Property({ required: true })
  room_name: string;

  @Field(() => RoomType)
  @Property({ required: true, type: String })
  room_type: RoomType;

  @Field(() => Int)
  @Property({ required: true })
  bed_count: number;

  @Field(() => [String])
  @Property({ required: true, type: [String] })
  amenities: string[];

  @Field(() => DateScalar)
  @Property({ default: Date.now() })
  last_updated_at: Date;

  @Field(() => [Price])
  prices: Price[]

  @Field(() => [Metric])
  metrics: Metric[]
}
