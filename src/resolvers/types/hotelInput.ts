import { ArgsType, Field, Int } from 'type-graphql';
import { RoomType, Period } from '../../utils/Enum';
import { IsOnlyDate } from '../../utils/DateValidator';


@ArgsType()
export class InsightsArgs {
  @Field(() => Int)
  hotel_id: number;

  @Field(() => Period)
  period: Period

  @Field(() => RoomType)
  room_type: RoomType;

  @Field(() => Int)
  limit: number;
}

@ArgsType()
export class MetricsArgs {
  @Field(() => Int)
  hotel_id: number;

  @Field()
  @IsOnlyDate()
  day: string

  @Field(() => RoomType)
  room_type: RoomType;
}
