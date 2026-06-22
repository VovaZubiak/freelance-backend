import { Migration } from '@mikro-orm/migrations';

export class Migration20260507152416 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "reset_tokens" ("token_id" serial primary key, "token" varchar(255) not null, "expires_at" timestamptz not null, "created_at" timestamptz not null, "user_user_id" int not null);`);
    this.addSql(`alter table "reset_tokens" add constraint "reset_tokens_token_unique" unique ("token");`);

    this.addSql(`alter table "reset_tokens" add constraint "reset_tokens_user_user_id_foreign" foreign key ("user_user_id") references "users" ("user_id") on update cascade;`);

    this.addSql(`alter table "userroles" drop constraint "userroles_role_id_fkey";`);
    this.addSql(`alter table "userroles" drop constraint "userroles_user_id_fkey";`);

    this.addSql(`alter table "projects" drop constraint "projects_client_user_id_fkey";`);

    this.addSql(`alter table "proposals" drop constraint "proposals_freelancer_user_id_fkey";`);
    this.addSql(`alter table "proposals" drop constraint "proposals_project_id_fkey";`);

    this.addSql(`alter table "freelancerskills" drop constraint "freelancerskills_skill_id_fkey";`);
    this.addSql(`alter table "freelancerskills" drop constraint "freelancerskills_user_id_fkey";`);

    this.addSql(`alter table "freelancerprofiles" drop constraint "freelancerprofiles_user_id_fkey";`);

    this.addSql(`alter table "contracts" drop constraint "contracts_client_user_id_fkey";`);
    this.addSql(`alter table "contracts" drop constraint "contracts_freelancer_user_id_fkey";`);
    this.addSql(`alter table "contracts" drop constraint "contracts_project_id_fkey";`);
    this.addSql(`alter table "contracts" drop constraint "contracts_proposal_id_fkey";`);

    this.addSql(`alter table "reviews" drop constraint "reviews_contract_id_fkey";`);
    this.addSql(`alter table "reviews" drop constraint "reviews_reviewee_user_id_fkey";`);
    this.addSql(`alter table "reviews" drop constraint "reviews_reviewer_user_id_fkey";`);

    this.addSql(`alter table "projectfiles" drop constraint "projectfiles_contract_id_fkey";`);
    this.addSql(`alter table "projectfiles" drop constraint "projectfiles_uploader_user_id_fkey";`);

    this.addSql(`alter table "messages" drop constraint "messages_contract_id_fkey";`);
    this.addSql(`alter table "messages" drop constraint "messages_receiver_user_id_fkey";`);
    this.addSql(`alter table "messages" drop constraint "messages_sender_user_id_fkey";`);

    this.addSql(`alter table "disputes" drop constraint "disputes_assigned_admin_id_fkey";`);
    this.addSql(`alter table "disputes" drop constraint "disputes_contract_id_fkey";`);
    this.addSql(`alter table "disputes" drop constraint "disputes_reported_by_user_id_fkey";`);

    this.addSql(`alter table "clientprofiles" drop constraint "clientprofiles_user_id_fkey";`);

    this.addSql(`alter table "userwallets" drop constraint "userwallets_user_id_fkey";`);

    this.addSql(`alter table "transactions" drop constraint "transactions_contract_id_fkey";`);
    this.addSql(`alter table "transactions" drop constraint "transactions_wallet_id_fkey";`);

    this.addSql(`alter table "roles" alter column "role_id" type int using ("role_id"::int);`);
    this.addSql(`alter table "roles" alter column "role_name" type varchar(255) using ("role_name"::varchar(255));`);
    this.addSql(`create sequence if not exists "roles_role_id_seq";`);
    this.addSql(`select setval('roles_role_id_seq', (select max("role_id") from "roles"));`);
    this.addSql(`alter table "roles" alter column "role_id" set default nextval('roles_role_id_seq');`);
    this.addSql(`alter table "roles" drop constraint "roles_role_name_key";`);
    this.addSql(`alter table "roles" add constraint "roles_role_name_unique" unique ("role_name");`);

    this.addSql(`alter table "userroles" add constraint "userroles_user_id_foreign" foreign key ("user_id") references "users" ("user_id") on update cascade on delete cascade;`);
    this.addSql(`alter table "userroles" add constraint "userroles_role_id_foreign" foreign key ("role_id") references "roles" ("role_id") on update cascade on delete cascade;`);

    this.addSql(`alter table "projects" add constraint "projects_client_user_id_foreign" foreign key ("client_user_id") references "users" ("user_id") on update cascade on delete cascade;`);

    this.addSql(`alter table "proposals" add constraint "proposals_project_id_foreign" foreign key ("project_id") references "projects" ("project_id") on update cascade on delete cascade;`);
    this.addSql(`alter table "proposals" add constraint "proposals_freelancer_user_id_foreign" foreign key ("freelancer_user_id") references "users" ("user_id") on update cascade on delete cascade;`);

    this.addSql(`alter table "freelancerskills" add constraint "freelancerskills_user_id_foreign" foreign key ("user_id") references "users" ("user_id") on update cascade on delete cascade;`);
    this.addSql(`alter table "freelancerskills" add constraint "freelancerskills_skill_id_foreign" foreign key ("skill_id") references "skills" ("skill_id") on update cascade on delete cascade;`);

    this.addSql(`alter table "freelancerprofiles" add constraint "freelancerprofiles_user_id_foreign" foreign key ("user_id") references "users" ("user_id") on update cascade on delete cascade;`);

    this.addSql(`alter table "contracts" add constraint "contracts_project_id_foreign" foreign key ("project_id") references "projects" ("project_id") on update cascade;`);
    this.addSql(`alter table "contracts" add constraint "contracts_proposal_id_foreign" foreign key ("proposal_id") references "proposals" ("proposal_id") on update cascade;`);
    this.addSql(`alter table "contracts" add constraint "contracts_client_user_id_foreign" foreign key ("client_user_id") references "users" ("user_id") on update cascade;`);
    this.addSql(`alter table "contracts" add constraint "contracts_freelancer_user_id_foreign" foreign key ("freelancer_user_id") references "users" ("user_id") on update cascade;`);

    this.addSql(`alter table "reviews" drop constraint reviews_rating_check;`);

    this.addSql(`alter table "reviews" add constraint "reviews_contract_id_foreign" foreign key ("contract_id") references "contracts" ("contract_id") on update cascade;`);
    this.addSql(`alter table "reviews" add constraint "reviews_reviewer_user_id_foreign" foreign key ("reviewer_user_id") references "users" ("user_id") on update cascade;`);
    this.addSql(`alter table "reviews" add constraint "reviews_reviewee_user_id_foreign" foreign key ("reviewee_user_id") references "users" ("user_id") on update cascade;`);

    this.addSql(`alter table "projectfiles" add constraint "projectfiles_contract_id_foreign" foreign key ("contract_id") references "contracts" ("contract_id") on update cascade on delete cascade;`);
    this.addSql(`alter table "projectfiles" add constraint "projectfiles_uploader_user_id_foreign" foreign key ("uploader_user_id") references "users" ("user_id") on update cascade;`);

    this.addSql(`alter table "messages" add constraint "messages_contract_id_foreign" foreign key ("contract_id") references "contracts" ("contract_id") on update cascade on delete cascade;`);
    this.addSql(`alter table "messages" add constraint "messages_sender_user_id_foreign" foreign key ("sender_user_id") references "users" ("user_id") on update cascade;`);
    this.addSql(`alter table "messages" add constraint "messages_receiver_user_id_foreign" foreign key ("receiver_user_id") references "users" ("user_id") on update cascade;`);

    this.addSql(`alter table "disputes" add constraint "disputes_contract_id_foreign" foreign key ("contract_id") references "contracts" ("contract_id") on update cascade;`);
    this.addSql(`alter table "disputes" add constraint "disputes_reported_by_user_id_foreign" foreign key ("reported_by_user_id") references "users" ("user_id") on update cascade;`);
    this.addSql(`alter table "disputes" add constraint "disputes_assigned_admin_id_foreign" foreign key ("assigned_admin_id") references "users" ("user_id") on update cascade on delete set null;`);

    this.addSql(`alter table "clientprofiles" add constraint "clientprofiles_user_id_foreign" foreign key ("user_id") references "users" ("user_id") on update cascade on delete cascade;`);

    this.addSql(`alter table "userwallets" add constraint "userwallets_user_id_foreign" foreign key ("user_id") references "users" ("user_id") on update cascade on delete cascade;`);

    this.addSql(`alter table "transactions" add constraint "transactions_wallet_id_foreign" foreign key ("wallet_id") references "userwallets" ("wallet_id") on update cascade;`);
    this.addSql(`alter table "transactions" add constraint "transactions_contract_id_foreign" foreign key ("contract_id") references "contracts" ("contract_id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "reset_tokens" cascade;`);

    this.addSql(`alter table "clientprofiles" drop constraint "clientprofiles_user_id_foreign";`);

    this.addSql(`alter table "contracts" drop constraint "contracts_project_id_foreign";`);
    this.addSql(`alter table "contracts" drop constraint "contracts_proposal_id_foreign";`);
    this.addSql(`alter table "contracts" drop constraint "contracts_client_user_id_foreign";`);
    this.addSql(`alter table "contracts" drop constraint "contracts_freelancer_user_id_foreign";`);

    this.addSql(`alter table "disputes" drop constraint "disputes_contract_id_foreign";`);
    this.addSql(`alter table "disputes" drop constraint "disputes_reported_by_user_id_foreign";`);
    this.addSql(`alter table "disputes" drop constraint "disputes_assigned_admin_id_foreign";`);

    this.addSql(`alter table "freelancerprofiles" drop constraint "freelancerprofiles_user_id_foreign";`);

    this.addSql(`alter table "freelancerskills" drop constraint "freelancerskills_user_id_foreign";`);
    this.addSql(`alter table "freelancerskills" drop constraint "freelancerskills_skill_id_foreign";`);

    this.addSql(`alter table "messages" drop constraint "messages_contract_id_foreign";`);
    this.addSql(`alter table "messages" drop constraint "messages_sender_user_id_foreign";`);
    this.addSql(`alter table "messages" drop constraint "messages_receiver_user_id_foreign";`);

    this.addSql(`alter table "projectfiles" drop constraint "projectfiles_contract_id_foreign";`);
    this.addSql(`alter table "projectfiles" drop constraint "projectfiles_uploader_user_id_foreign";`);

    this.addSql(`alter table "projects" drop constraint "projects_client_user_id_foreign";`);

    this.addSql(`alter table "proposals" drop constraint "proposals_project_id_foreign";`);
    this.addSql(`alter table "proposals" drop constraint "proposals_freelancer_user_id_foreign";`);

    this.addSql(`alter table "reviews" drop constraint "reviews_contract_id_foreign";`);
    this.addSql(`alter table "reviews" drop constraint "reviews_reviewer_user_id_foreign";`);
    this.addSql(`alter table "reviews" drop constraint "reviews_reviewee_user_id_foreign";`);

    this.addSql(`alter table "transactions" drop constraint "transactions_wallet_id_foreign";`);
    this.addSql(`alter table "transactions" drop constraint "transactions_contract_id_foreign";`);

    this.addSql(`alter table "userroles" drop constraint "userroles_user_id_foreign";`);
    this.addSql(`alter table "userroles" drop constraint "userroles_role_id_foreign";`);

    this.addSql(`alter table "userwallets" drop constraint "userwallets_user_id_foreign";`);

    this.addSql(`alter table "clientprofiles" add constraint "clientprofiles_user_id_fkey" foreign key ("user_id") references "users" ("user_id") on update no action on delete cascade;`);

    this.addSql(`alter table "contracts" add constraint "contracts_client_user_id_fkey" foreign key ("client_user_id") references "users" ("user_id") on update no action on delete no action;`);
    this.addSql(`alter table "contracts" add constraint "contracts_freelancer_user_id_fkey" foreign key ("freelancer_user_id") references "users" ("user_id") on update no action on delete no action;`);
    this.addSql(`alter table "contracts" add constraint "contracts_project_id_fkey" foreign key ("project_id") references "projects" ("project_id") on update no action on delete no action;`);
    this.addSql(`alter table "contracts" add constraint "contracts_proposal_id_fkey" foreign key ("proposal_id") references "proposals" ("proposal_id") on update no action on delete no action;`);

    this.addSql(`alter table "disputes" add constraint "disputes_assigned_admin_id_fkey" foreign key ("assigned_admin_id") references "users" ("user_id") on update no action on delete no action;`);
    this.addSql(`alter table "disputes" add constraint "disputes_contract_id_fkey" foreign key ("contract_id") references "contracts" ("contract_id") on update no action on delete no action;`);
    this.addSql(`alter table "disputes" add constraint "disputes_reported_by_user_id_fkey" foreign key ("reported_by_user_id") references "users" ("user_id") on update no action on delete no action;`);

    this.addSql(`alter table "freelancerprofiles" add constraint "freelancerprofiles_user_id_fkey" foreign key ("user_id") references "users" ("user_id") on update no action on delete cascade;`);

    this.addSql(`alter table "freelancerskills" add constraint "freelancerskills_skill_id_fkey" foreign key ("skill_id") references "skills" ("skill_id") on update no action on delete cascade;`);
    this.addSql(`alter table "freelancerskills" add constraint "freelancerskills_user_id_fkey" foreign key ("user_id") references "users" ("user_id") on update no action on delete cascade;`);

    this.addSql(`alter table "messages" add constraint "messages_contract_id_fkey" foreign key ("contract_id") references "contracts" ("contract_id") on update no action on delete cascade;`);
    this.addSql(`alter table "messages" add constraint "messages_receiver_user_id_fkey" foreign key ("receiver_user_id") references "users" ("user_id") on update no action on delete no action;`);
    this.addSql(`alter table "messages" add constraint "messages_sender_user_id_fkey" foreign key ("sender_user_id") references "users" ("user_id") on update no action on delete no action;`);

    this.addSql(`alter table "projectfiles" add constraint "projectfiles_contract_id_fkey" foreign key ("contract_id") references "contracts" ("contract_id") on update no action on delete cascade;`);
    this.addSql(`alter table "projectfiles" add constraint "projectfiles_uploader_user_id_fkey" foreign key ("uploader_user_id") references "users" ("user_id") on update no action on delete no action;`);

    this.addSql(`alter table "projects" add constraint "projects_client_user_id_fkey" foreign key ("client_user_id") references "users" ("user_id") on update no action on delete cascade;`);

    this.addSql(`alter table "proposals" add constraint "proposals_freelancer_user_id_fkey" foreign key ("freelancer_user_id") references "users" ("user_id") on update no action on delete cascade;`);
    this.addSql(`alter table "proposals" add constraint "proposals_project_id_fkey" foreign key ("project_id") references "projects" ("project_id") on update no action on delete cascade;`);

    this.addSql(`alter table "reviews" add constraint "reviews_contract_id_fkey" foreign key ("contract_id") references "contracts" ("contract_id") on update no action on delete no action;`);
    this.addSql(`alter table "reviews" add constraint "reviews_reviewee_user_id_fkey" foreign key ("reviewee_user_id") references "users" ("user_id") on update no action on delete no action;`);
    this.addSql(`alter table "reviews" add constraint "reviews_reviewer_user_id_fkey" foreign key ("reviewer_user_id") references "users" ("user_id") on update no action on delete no action;`);
    this.addSql(`alter table "reviews" add constraint reviews_rating_check check((rating >= 1) AND (rating <= 5));`);

    this.addSql(`alter table "roles" alter column "role_id" type int4 using ("role_id"::int4);`);
    this.addSql(`alter table "roles" alter column "role_name" type varchar(50) using ("role_name"::varchar(50));`);
    this.addSql(`alter table "roles" alter column "role_id" drop default;`);
    this.addSql(`alter table "roles" drop constraint "roles_role_name_unique";`);
    this.addSql(`alter table "roles" add constraint "roles_role_name_key" unique ("role_name");`);

    this.addSql(`alter table "transactions" add constraint "transactions_contract_id_fkey" foreign key ("contract_id") references "contracts" ("contract_id") on update no action on delete no action;`);
    this.addSql(`alter table "transactions" add constraint "transactions_wallet_id_fkey" foreign key ("wallet_id") references "userwallets" ("wallet_id") on update no action on delete no action;`);

    this.addSql(`alter table "userroles" add constraint "userroles_role_id_fkey" foreign key ("role_id") references "roles" ("role_id") on update no action on delete cascade;`);
    this.addSql(`alter table "userroles" add constraint "userroles_user_id_fkey" foreign key ("user_id") references "users" ("user_id") on update no action on delete cascade;`);

    this.addSql(`alter table "userwallets" add constraint "userwallets_user_id_fkey" foreign key ("user_id") references "users" ("user_id") on update no action on delete cascade;`);
  }

}
