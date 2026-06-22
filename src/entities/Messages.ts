import { Entity, ManyToOne, type Opt, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';
import { Contracts } from './Contracts';
import { Proposals } from './Proposals';
import { Users } from './Users';
import { Projectfiles } from './Projectfiles';

@Entity()
export class Messages {

  [PrimaryKeyProp]?: 'messageId';

  @PrimaryKey({ type: 'integer', generated: 'by default as identity' })
  messageId!: number & Opt;

  @ManyToOne({ entity: () => Contracts, fieldName: 'contract_id', deleteRule: 'cascade', nullable: true })
  contract?: Contracts;

  @ManyToOne({ entity: () => Proposals, fieldName: 'proposal_id', deleteRule: 'cascade', nullable: true })
  proposal?: Proposals;

  @ManyToOne({ entity: () => Users })
  sender!: Users;

  @ManyToOne({ entity: () => Users })
  receiver!: Users;

  @Property({ type: 'text' })
  messageBody!: string;

  @Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP` })
  sentAt?: Date;

  @Property({ type: 'boolean', nullable: true })
  isRead?: boolean = false;

  @ManyToOne({ entity: () => Projectfiles, nullable: true })
  attachedFile?: Projectfiles;
}