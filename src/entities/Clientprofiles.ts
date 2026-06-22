import { Entity, OneToOne, type Opt, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';
import { Users } from './Users';

@Entity()
export class Clientprofiles {

  [PrimaryKeyProp]?: 'profileId';

  @PrimaryKey({ type: 'integer', generated: 'by default as identity' })
  profileId!: number & Opt;

  @OneToOne({ entity: () => Users, fieldName: 'user_id', deleteRule: 'cascade', unique: 'clientprofiles_user_id_key' })
  user!: Users;

  @Property({ nullable: true })
  companyName?: string;

  @Property({ length: 500, nullable: true })
  websiteUrl?: string;

  @Property({ type: 'boolean', nullable: true })
  paymentVerified?: boolean = false;

  @Property({ type: 'text', nullable: true })
  bio?: string;

}
