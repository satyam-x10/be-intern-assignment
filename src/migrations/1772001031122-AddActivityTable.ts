import { MigrationInterface, QueryRunner } from "typeorm";

export class AddActivityTable1772001031122 implements MigrationInterface {
    name = 'AddActivityTable1772001031122'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "activities" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "type" varchar(50) NOT NULL, "targetId" integer, "metadata" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "temporary_activities" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "type" varchar(50) NOT NULL, "targetId" integer, "metadata" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_5a2cfe6f705df945b20c1b22c71" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_activities"("id", "userId", "type", "targetId", "metadata", "createdAt") SELECT "id", "userId", "type", "targetId", "metadata", "createdAt" FROM "activities"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`ALTER TABLE "temporary_activities" RENAME TO "activities"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activities" RENAME TO "temporary_activities"`);
        await queryRunner.query(`CREATE TABLE "activities" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer NOT NULL, "type" varchar(50) NOT NULL, "targetId" integer, "metadata" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "activities"("id", "userId", "type", "targetId", "metadata", "createdAt") SELECT "id", "userId", "type", "targetId", "metadata", "createdAt" FROM "temporary_activities"`);
        await queryRunner.query(`DROP TABLE "temporary_activities"`);
        await queryRunner.query(`DROP TABLE "activities"`);
    }

}
