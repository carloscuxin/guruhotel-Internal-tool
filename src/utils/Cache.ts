import NodeCache from 'node-cache';


export class Cache {
  private cache: NodeCache;
  private key: string;

  constructor(cache: NodeCache, key?: string) {
    this.cache = cache;
    this.key = key;
  }

  public setKey = (key: string): void => {
    this.key = key;
  };

  public getData = (): string | undefined => this.cache?.get(this.key);

  public setData = (data: unknown, stringify: boolean = true): void => {
    this.cache?.set(this.key, stringify ? JSON.stringify(data) : data);
  }
}
