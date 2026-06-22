import { Entity, PrimaryKey, Property, ManyToOne, OptionalProps } from '@mikro-orm/core';
import { Users } from './Users';

@Entity()
export class ResetTokens {
    [OptionalProps]?: 'tokenId' | 'createdAt';

  @PrimaryKey()
  tokenId!: number;

  @Property({ unique: true })
  token!: string;

  @Property()
  expiresAt!: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @ManyToOne(() => Users)
  user!: Users;
}