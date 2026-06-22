import { Entity, PrimaryKey, Property, ManyToOne, OptionalProps } from '@mikro-orm/core';
import { Users } from './Users';
import { Team } from './Team';

@Entity()
export class TeamMember {
    [OptionalProps]?: 'id' | 'joinedAt';
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Team)
  team!: Team;

  @ManyToOne(() => Users)
  user!: Users;

  // Роль всередині команди (наприклад: 'developer', 'designer', або 'co-admin')
  @Property({ default: 'member' })
  role!: string; 

  @Property()
  joinedAt: Date = new Date();
}