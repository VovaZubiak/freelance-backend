import { Entity, ManyToOne, OneToOne, type Opt, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';
import { Projects } from './Projects';
import { Proposals } from './Proposals';
import { Users } from './Users';

@Entity()
export class Contracts {

  [PrimaryKeyProp]?: 'contractId';

  @PrimaryKey({ type: 'integer', generated: 'by default as identity' })
  contractId!: number & Opt;

  @OneToOne({ entity: () => Projects, fieldName: 'project_id', unique: 'contracts_project_id_key' })
  project!: Projects;

  @OneToOne({ entity: () => Proposals, fieldName: 'proposal_id', unique: 'contracts_proposal_id_key' })
  proposal!: Proposals;

  @ManyToOne({ entity: () => Users })
  client!: Users;

  @ManyToOne({ entity: () => Users })
  freelancer!: Users;

  @Property({ type: 'decimal', precision: 12, scale: 2 })
  agreedAmount!: string;

  @Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP` })
  startDate?: Date;

  @Property({ nullable: true })
  endDate?: Date;

  @Property({ type: 'string', length: 50, nullable: true })
  status?: string = 'active';

}
