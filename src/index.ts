import { ServerInfo } from 'apollo-server';
import { Server } from './server';


const port: number = parseInt(process.env.PORT as string) || 9000;
const server = Server.init(port);

server.createCache();
server.buildSchema().then(() => {
  server.start(({ url }: ServerInfo) => console.log(`Server running in ${url}`));
});
