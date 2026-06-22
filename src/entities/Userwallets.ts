import { Entity, OneToOne, type Opt, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';
import { Users } from './Users';

@Entity()
export class Userwallets {

  [PrimaryKeyProp]?: 'walletId';

  @PrimaryKey({ type: 'integer', generated: 'by default as identity' })
  walletId!: number & Opt;

  @OneToOne({ entity: () => Users, fieldName: 'user_id', deleteRule: 'cascade', unique: 'userwallets_user_id_key' })
  user!: Users;

  @Property({ type: 'decimal', precision: 12, scale: 2, defaultRaw: `0.00` })
  balance!: string & Opt;

  @Property({ type: 'string', length: 3, nullable: true })
  currency?: string = 'UAH';

}
