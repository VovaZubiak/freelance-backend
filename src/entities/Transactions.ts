import { Entity, ManyToOne, type Opt, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';
import { Contracts } from './Contracts';
import { Userwallets } from './Userwallets';

@Entity()
export class Transactions {

  [PrimaryKeyProp]?: 'transactionId';

  @PrimaryKey({ type: 'integer', generated: 'by default as identity' })
  transactionId!: number & Opt;

  @ManyToOne({ entity: () => Userwallets, fieldName: 'wallet_id' })
  wallet!: Userwallets;

  @ManyToOne({ entity: () => Contracts, fieldName: 'contract_id', nullable: true })
  contract?: Contracts;

  @Property({ type: 'decimal', precision: 12, scale: 2 })
  amount!: string;

  @Property({ length: 50 })
  type!: string;

  @Property({ type: 'string', length: 50, nullable: true })
  status?: string = 'completed';

  @Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP` })
  createdAt?: Date;

}
