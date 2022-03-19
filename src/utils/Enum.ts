import { registerEnumType } from 'type-graphql';


export enum RoomType {
  RESIDENTIAL = 'residential',
  BUSINESS = 'business'
}
registerEnumType(RoomType, {
  name: 'RoomType',
  description: 'Enum for rooms types'
});

export enum Period {
  THIRTY_DAYS = 30,
  SIXTY_DAYS = 60,
  NINETY_DAYS = 90
}
registerEnumType(Period, {
  name: 'Period',
  description: 'Enum for periods'
});

export enum Role {
  MANAGER = 'manager',
  PUBLIC = 'public'
}