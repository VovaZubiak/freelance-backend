import { Migration } from '@mikro-orm/migrations';

export class Migration20260510194339 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "messages" add column "proposal_id" int null;`);
    this.addSql(`alter table "messages" alter column "contract_id" type int using ("contract_id"::int);`);
    this.addSql(`alter table "messages" alter column "contract_id" drop not null;`);
    this.addSql(`alter table "messages" add constraint "messages_proposal_id_foreign" foreign key ("proposal_id") references "proposals" ("proposal_id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "messages" drop constraint "messages_proposal_id_foreign";`);

    this.addSql(`alter table "messages" drop column "proposal_id";`);

    this.addSql(`alter table "messages" alter column "contract_id" type int4 using ("contract_id"::int4);`);
    this.addSql(`alter table "messages" alter column "contract_id" set not null;`);
  }

}
