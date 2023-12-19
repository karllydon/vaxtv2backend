import { RedisClientType } from "redis";

export interface RedisHelperInterface {
  client: RedisClientType;
  RedisSet(key: string, data: string): void;
  RedisGet(key: string): any;
  RedisDelete(key: string): void;
}
