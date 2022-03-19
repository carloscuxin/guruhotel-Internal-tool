import { Authorized, Query, Resolver } from 'type-graphql';
import mongoose from 'mongoose';
import axios from 'axios';
import { Ping } from '../entities';


@Resolver(Ping)
export class PingResolver {
  @Authorized()
  @Query(() => Ping)
  async ping(): Promise<Ping> {
    const status_db = mongoose.connection.readyState;
    let status_external_api = true;

    // Se verifica el status de la api externa
    try { await axios.get('http://external-api.dev:5000/ping'); }
    catch (error) { status_external_api = false; }

    return {
      db: status_db === 1,
      local_api: status_db === 1,
      external_api: status_external_api
    }
  }
}
