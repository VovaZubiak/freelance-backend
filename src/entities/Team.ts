import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection, OptionalProps } from '@mikro-orm/core';
import { Users } from './Users';
import { TeamMember } from './TeamMember';

@Entity()
export class Team {
[OptionalProps]?: 'teamId' | 'createdAt';
  @PrimaryKey()
  teamId!: number;

  @Property({ unique: true })
  name!: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ type: 'text', nullable: true })
  avatarUrl?: string;

  @ManyToOne(() => Users)
  owner!: Users;

  @OneToMany(() => TeamMember, member => member.team)
  members = new Collection<TeamMember>(this);

  @Property()
  createdAt: Date = new Date();
}