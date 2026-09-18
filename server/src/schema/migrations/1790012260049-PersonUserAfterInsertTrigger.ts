import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE OR REPLACE FUNCTION person_user_after_insert()
  RETURNS TRIGGER
  LANGUAGE PLPGSQL
  AS $$
    BEGIN
      INSERT INTO person ("ownerId", "personGroupId", "name", "birthDate")
      SELECT i."sharedWithId", i."personGroupId", shared."name", shared."birthDate"
      FROM inserted_rows i
      INNER JOIN person shared
        ON shared."ownerId" = i."sharedById" AND shared."personGroupId" = i."personGroupId"
      ON CONFLICT ("ownerId", "personGroupId") DO NOTHING;
      RETURN NULL;
    END
  $$;`.execute(db);
  await sql`CREATE OR REPLACE TRIGGER "person_user_after_insert"
  AFTER INSERT ON "person_user"
  REFERENCING NEW TABLE AS "inserted_rows"
  FOR EACH STATEMENT
  EXECUTE FUNCTION person_user_after_insert();`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('function_person_user_after_insert', '{"type":"function","name":"person_user_after_insert","sql":"CREATE OR REPLACE FUNCTION person_user_after_insert()\\n  RETURNS TRIGGER\\n  LANGUAGE PLPGSQL\\n  AS $$\\n    BEGIN\\n      INSERT INTO person (\\"ownerId\\", \\"personGroupId\\", \\"name\\", \\"birthDate\\")\\n      SELECT i.\\"sharedWithId\\", i.\\"personGroupId\\", shared.\\"name\\", shared.\\"birthDate\\"\\n      FROM inserted_rows i\\n      INNER JOIN person shared\\n        ON shared.\\"ownerId\\" = i.\\"sharedById\\" AND shared.\\"personGroupId\\" = i.\\"personGroupId\\"\\n      ON CONFLICT (\\"ownerId\\", \\"personGroupId\\") DO NOTHING;\\n      RETURN NULL;\\n    END\\n  $$;"}'::jsonb);`.execute(db);
  await sql`INSERT INTO "migration_overrides" ("name", "value") VALUES ('trigger_person_user_after_insert', '{"type":"trigger","name":"person_user_after_insert","sql":"CREATE OR REPLACE TRIGGER \\"person_user_after_insert\\"\\n  AFTER INSERT ON \\"person_user\\"\\n  REFERENCING NEW TABLE AS \\"inserted_rows\\"\\n  FOR EACH STATEMENT\\n  EXECUTE FUNCTION person_user_after_insert();"}'::jsonb);`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER "person_user_after_insert" ON "person_user";`.execute(db);
  await sql`DROP FUNCTION person_user_after_insert;`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'function_person_user_after_insert';`.execute(db);
  await sql`DELETE FROM "migration_overrides" WHERE "name" = 'trigger_person_user_after_insert';`.execute(db);
}
