import { Entity, ManyToOne, type Opt, PrimaryKey, PrimaryKeyProp, Property, Unique } from '@mikro-orm/core';
import { Contracts } from './Contracts';
import { Users } from './Users';

@Entity()
@Unique({ name: 'reviews_contract_id_reviewer_user_id_key', properties: ['contract', 'reviewer'] })
export class Reviews {

  [PrimaryKeyProp]?: 'reviewId';

  @PrimaryKey({ type: 'integer', generated: 'by default as identity' })
  reviewId!: number & Opt;

  @ManyToOne({ entity: () => Contracts, fieldName: 'contract_id' })
  contract!: Contracts;

  @ManyToOne({ entity: () => Users })
  reviewer!: Users;

  @ManyToOne({ entity: () => Users })
  reviewee!: Users;

  @Property({ type: 'smallint' })
  rating!: number;

  @Property({ type: 'text', nullable: true })
  comment?: string;

  @Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP` })
  createdAt?: Date;

}
