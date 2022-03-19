import { Field, Float, ID, ObjectType } from 'type-graphql';
import { prop as Property, getModelForClass, Ref } from '@typegoose/typegoose';
// Own Libs
import { Room } from './Room';
import { DateScalar } from '../utils/DateScalar';


@ObjectType()
class ParamsMetric {
  @Field()
  @Property({ required: true })
  competitor_name: string;

  @Field(() => Float)
  @Property({ required: true })
  gross_amount: number;

  @Field(() => Float)
  @Property({ required: true })
  net_amount: number;
}

@ObjectType()
class PriceMetric {
  @Field(() => ParamsMetric)
  @Property({ required: true, type: ParamsMetric })
  best_price: ParamsMetric;

  @Field(() => ParamsMetric)
  @Property({ required: true, type: ParamsMetric })
  average_price: ParamsMetric;

  @Field(() => ParamsMetric)
  @Property({ required: true, type: ParamsMetric })
  worst_price: ParamsMetric;
}

@ObjectType()
export class Metric {
  @Field(() => ID)
  readonly _id: string;

  @Field(() => ID)
  @Property({ required: true })
  room_id: string;

  @Field()
  @Property({ required: true })
  room_name: string;

  @Field(() => DateScalar)
  @Property({ required: true })
  date: Date;

  @Field(() => PriceMetric)
  @Property({ required: true, type: PriceMetric })
  metrics: PriceMetric;

  @Field(() => Room)
  @Property({ required: true, ref: 'Room' })
  room: Ref<Room>;
}

export const MetricModel = getModelForClass(Metric);
