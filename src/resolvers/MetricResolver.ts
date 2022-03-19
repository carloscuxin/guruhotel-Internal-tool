import { Args, Authorized, Ctx, Query, Resolver } from 'type-graphql';
import { Hotel, HotelModel, Metric, Room } from '../entities';
import { MetricsArgs } from './types';
import { getMetrics } from '../utils/external';
import { Role } from '../utils/Enum';
import { Context } from '../utils/authChecker';
import { Cache } from '../utils/Cache';


@Resolver(Metric)
export class MetricResolver {
  @Authorized(Role.MANAGER)
  @Query(() => [Metric])
  async getHotelMetrics(@Args() { hotel_id, day, room_type }: MetricsArgs, @Ctx() { cache }: Context) {
    const cache_class = new Cache(cache, `hotel-${hotel_id}`);

    // Se mandan a buscar los cuarto a cache para avalidar
    let rooms: string | Room[] = cache_class.getData();
    if (!rooms) { // Se manda a buscar el hotel y sus cuartos con base al id proporcionado
      const hotel = await HotelModel.findOne({ hotel_id }) as Hotel;
      if (!hotel) return [];
      cache_class.setData(hotel.rooms);
      rooms = hotel.rooms;
    } else { rooms = JSON.parse(rooms); }

    // Se filtran los cuartos de acuerdo al tipo proporcionado
    return (rooms as Room[])
      .filter(room => room.room_type === room_type)
      .map(async (room) => await getMetrics(hotel_id, room, day));
  }
}
