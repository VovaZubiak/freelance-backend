import { Entity, ManyToOne, type Opt, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';
import { Projects } from './Projects';
import { Users } from './Users';

@Entity()
export class Proposals {

  [PrimaryKeyProp]?: 'proposalId';

  @PrimaryKey({ type: 'integer', generated: 'by default as identity' })
  proposalId!: number & Opt;

  @ManyToOne({ entity: () => Projects, fieldName: 'project_id', deleteRule: 'cascade' })
  project!: Projects;

  @ManyToOne({ entity: () => Users, deleteRule: 'cascade' })
  freelancer!: Users;

  @Property({ type: 'text', nullable: true })
  coverLetter?: string;

  @Property({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  bidAmount?: string;

  @Property({ nullable: true })
  estimatedTimeDays?: number;

  @Property({ type: 'string', length: 50, nullable: true })
  status?: string = 'submitted';

  @Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP` })
  submittedAt?: Date;

}
