import 'reflect-metadata';
import { GraphQLSchema } from 'graphql';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server';
// Own Libs
import { DBConnection } from './db';
import { HotelResolver } from '../resolvers/HotelResolver';
import { MetricResolver } from '../resolvers/MetricResolver';
import { PingResolver } from '../resolvers/PingResolver';
import { DBFulFill } from './migration'
import { authChecker, Context } from '../utils/authChecker';
import { UserModel } from '../entities';
import NodeCache from 'node-cache';
import { ApolloServerPluginCacheControl } from 'apollo-server-core';


export class Server {
  public port: number;
  private schema: GraphQLSchema;
  private cache: NodeCache;

  constructor(port: number) {
    this.port = port;
  }

  static init = (port: number): Server => {
    return new Server(port);
  }

  public createCache = (): void => {
    this.cache = new NodeCache({ stdTTL: 600 });
  };

  public buildSchema = async (): Promise<void> => {
    await new DBConnection().connect();
    this.schema = await buildSchema({
      resolvers: [
        HotelResolver,
        MetricResolver,
        PingResolver
      ],
      authChecker,
      emitSchemaFile: true
    });
  }

  public start = async (callback: (...args: any[]) => void): Promise<void> => {
    DBFulFill.fill();
    const server = new ApolloServer({
      schema: this.schema,
      plugins: [ApolloServerPluginCacheControl({ defaultMaxAge: 5 })],
      context: async ({ req }: any) => {
        const ctx: Context = { user: null, cache: this.cache };
        const authorization = req.headers?.authorization;
        if (!authorization) return ctx;

        // Se obtiene el usuario y se busca en al bd
        const [user, _pass] = Buffer.from(authorization.split(' ')[1], 'base64').toString().split(':');
        ctx.user = await UserModel.findOne({ user });
        return ctx;
      }
    });
    const info = await server.listen(this.port);
    callback(info);
  }
}
