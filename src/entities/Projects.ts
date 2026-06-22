import { Collection, Entity, ManyToMany, ManyToOne, OneToOne, type Opt, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';
import { Users } from './Users';
import type { Skills } from './Skills';
import { Contracts } from './Contracts';

@Entity()
export class Projects {

  [PrimaryKeyProp]?: 'projectId';

  @PrimaryKey({ type: 'integer', generated: 'by default as identity' })
  projectId!: number & Opt;

  @ManyToOne({ entity: () => Users, deleteRule: 'cascade' })
  client!: Users;

  @Property()
  title!: string;

  @Property({ type: 'text' })
  description!: string;

  @Property({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budget?: string;

  @Property({ type: 'string', length: 50, nullable: true })
  status?: string = 'open_for_bidding';

  @Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP` })
  createdAt?: Date;

  @Property({ type: 'date', nullable: true })
  deadlineDate?: string;

  @ManyToMany('Skills', 'projects', { owner: true })
  skills = new Collection<Skills>(this);

  @OneToOne({ entity: () => Contracts, mappedBy: 'project', nullable: true })
  contract?: Contracts;

}
