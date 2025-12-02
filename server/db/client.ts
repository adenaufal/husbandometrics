import { drizzle as drizzleLibSQL, LibSQLDatabase } from 'drizzle-orm/libsql';
import { drizzle as drizzleMySQL, MySql2Database } from 'drizzle-orm/mysql2';
import { createClient } from '@libsql/client';
import mysql from 'mysql2/promise';
import { env } from '../config/env';
import * as sqliteSchema from './schema/sqlite';
import * as mysqlSchema from './schema/mysql';

export type DatabaseConnection =
  | { type: 'turso'; db: LibSQLDatabase<typeof sqliteSchema> }
  | { type: 'planetscale'; db: MySql2Database<typeof mysqlSchema> };

let connection: DatabaseConnection | null = null;

const createTursoConnection = (): DatabaseConnection | null => {
  if (!env.tursoUrl) return null;

  const client = createClient({
    url: env.tursoUrl,
    authToken: env.tursoAuthToken,
  });

  const db = drizzleLibSQL(client, {
    schema: sqliteSchema,
  });

  return { type: 'turso', db };
};

const createPlanetScaleConnection = async (): Promise<DatabaseConnection | null> => {
  if (!env.planetscaleUrl) return null;

  const pool = mysql.createPool(env.planetscaleUrl);
  const db = drizzleMySQL(pool, {
    mode: 'default',
    schema: mysqlSchema,
  });

  return { type: 'planetscale', db };
};

export const initConnection = async (): Promise<DatabaseConnection | null> => {
  if (connection) return connection;

  if (env.provider === 'turso') {
    connection = createTursoConnection();
    return connection;
  }

  if (env.provider === 'planetscale') {
    connection = await createPlanetScaleConnection();
    return connection;
  }

  return null;
};

export const getConnection = () => connection;
