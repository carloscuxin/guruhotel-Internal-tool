import { Args, Authorized, Ctx, Query, Resolver } from 'type-graphql';
// Own Libs
import { Hotel, Room, HotelModel } from '../entities';
import { InsightsArgs } from './types';
import { getPrices } from '../utils/external';
import { Role } from '../utils/Enum';
import { Context } from '../utils/authChecker';
import { Cache } from '../utils/Cache';


@Resolver(Hotel)
export class HotelResolver {
  @Authorized(Role.MANAGER)
  @Query(() => [Room])
  async getHotelInsights(@Args() { hotel_id, period, room_type, limit }: InsightsArgs, @Ctx() { cache }: Context) {
    const cache_class = new Cache(cache, `hotel-${hotel_id}`);
    let count = 1;

    // Se mandan a buscar los cuarto a cache para avalidar
    let rooms: string | Room[] = cache_class.getData();
    if (!rooms) { // Se manda a buscar el hotel y sus cuartos con base al id proporcionado
      const hotel = await HotelModel.findOne({ hotel_id }) as Hotel;
      if (!hotel) return [];
      cache_class.setData(hotel.rooms);
      rooms = hotel.rooms;
    } else { rooms = JSON.parse(rooms); }
    
    // Se filtran los cuartos de acuerdo al tipo y limite proporcionado
    return (rooms as Room[]).filter(room => {
      if (room.room_type !== room_type) return false;
      if (count > limit) return false;
      count++;
      return true;
    }).map(async (room) => {
      room.prices = await getPrices(hotel_id, room, period, cache_class);
      return room;
    });
  }
}
