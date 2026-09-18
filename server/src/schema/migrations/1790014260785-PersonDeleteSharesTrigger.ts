import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE OR REPLACE FUNCTION person_delete_shares()
  RETURNS TRIGGER
  LANGUAGE PLPGSQL
  AS $$
    BEGIN
      DELETE FROM person_user
      USING deleted_rows
      WHERE person_user."personGroupId" = deleted_rows."personGroupId"
        AND person_user."sharedWithId" = deleted_rows."ownerId";
      RETURN NULL;
    END
  $$;`.execute(db);
  await sql`CREATE OR REPLACE TRIGGER "person_delete_shares"
  AFTER DELETE ON "person"
  REFERENCING OLD TABLE AS "deleted_rows"
  FOR EACH STATEMENT
  EXECUTE FUNCTION person_delete_shares();`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('function_person_delete_shares', '{"type":"function","name":"person_delete_shares","sql":"CREATE OR REPLACE FUNCTION person_delete_shares()\\n  RETURNS TRIGGER\\n  LANGUAGE PLPGSQL\\n  AS $$\\n    BEGIN\\n      DELETE FROM person_user\\n      USING deleted_rows\\n      WHERE person_user.\\"personGroupId\\" = deleted_rows.\\"personGroupId\\"\\n        AND person_user.\\"sharedWithId\\" = deleted_rows.\\"ownerId\\";\\n      RETURN NULL;\\n    END\\n  $$;"}'::jsonb);`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('trigger_person_delete_shares', '{"type":"trigger","name":"person_delete_shares","sql":"CREATE OR REPLACE TRIGGER \\"person_delete_shares\\"\\n  AFTER DELETE ON \\"person\\"\\n  REFERENCING OLD TABLE AS \\"deleted_rows\\"\\n  FOR EACH STATEMENT\\n  EXECUTE FUNCTION person_delete_shares();"}'::jsonb);`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER "person_delete_shares" ON "person";`.execute(db);
  await sql`DROP FUNCTION person_delete_shares;`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'function_person_delete_shares';`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'trigger_person_delete_shares';`.execute(db);
}
