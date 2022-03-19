import { Field, ObjectType } from 'type-graphql';


@ObjectType()
export class Ping {
  @Field(() => Boolean)
  db: boolean;

  @Field(() => Boolean)
  local_api: boolean;

  @Field(() => Boolean)
  external_api: boolean;
}
