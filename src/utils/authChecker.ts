import { AuthChecker } from 'type-graphql';
import NodeCache from 'node-cache';
import { User } from '../entities'


export interface Context {
  user?: User,
  cache?: NodeCache
}

export const authChecker: AuthChecker<Context> = ({ context: { user } }, roles) => {
  if (!user) return false;
  if (roles.length > 0 && !roles.includes(user.role)) return false;

  return true;
};
