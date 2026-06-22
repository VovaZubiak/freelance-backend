import { Entity, PrimaryKey, Property, ManyToOne, OptionalProps } from '@mikro-orm/core';
import { Users } from './Users';
import { Team } from './Team';

@Entity()
export class TeamMessage {
    [OptionalProps]?: 'id' | 'createdAt';
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Team)
  team!: Team;

  // Хто написав повідомлення
  @ManyToOne(() => Users)
  sender!: Users;

  @Property({ type: 'text' })
  content!: string;

  @Property()
  createdAt: Date = new Date();
}