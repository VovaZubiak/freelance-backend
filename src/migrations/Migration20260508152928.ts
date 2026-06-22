import { Migration } from '@mikro-orm/migrations';

export class Migration20260508152928 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "projects_skills" ("projects_project_id" int not null, "skills_skill_id" int not null, constraint "projects_skills_pkey" primary key ("projects_project_id", "skills_skill_id"));`);

    this.addSql(`alter table "projects_skills" add constraint "projects_skills_projects_project_id_foreign" foreign key ("projects_project_id") references "projects" ("project_id") on update cascade on delete cascade;`);
    this.addSql(`alter table "projects_skills" add constraint "projects_skills_skills_skill_id_foreign" foreign key ("skills_skill_id") references "skills" ("skill_id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "projects_skills" cascade;`);
  }

}
