import {Knex} from "knex";

export interface DatabaseInterface {
    CreateConnection(sourcename: string): Knex
}
