import { Entity, ManyToOne, OneToOne, type Opt, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';
import { Contracts } from './Contracts';
import { Users } from './Users';

@Entity()
export class Disputes {

  [PrimaryKeyProp]?: 'disputeId';

  @PrimaryKey({ type: 'integer', generated: 'by default as identity' })
  disputeId!: number & Opt;

  @OneToOne({ entity: () => Contracts, fieldName: 'contract_id', unique: 'disputes_contract_id_key' })
  contract!: Contracts;

  @ManyToOne({ entity: () => Users })
  reportedBy!: Users;

  @ManyToOne({ entity: () => Users, fieldName: 'assigned_admin_id', nullable: true })
  assignedAdmin?: Users;

  @Property({ type: 'text' })
  reason!: string;

  @Property({ type: 'string', length: 50, nullable: true })
  status?: string = 'open';

  @Property({ type: 'text', nullable: true })
  resolutionNotes?: string;

  @Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP` })
  createdAt?: Date;

}
