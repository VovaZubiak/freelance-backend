import { Entity, PrimaryKey, Property, ManyToMany, Collection } from '@mikro-orm/core';
import { Users } from './Users';

@Entity({ tableName: 'roles' })
export class Roles {
  @PrimaryKey()
  roleId!: number;

  @Property({ unique: true })
  roleName!: string;

  @ManyToMany(() => Users, user => user.roles)
  users = new Collection<Users>(this);
}