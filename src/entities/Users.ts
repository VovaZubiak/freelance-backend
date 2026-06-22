import { Collection, Entity, ManyToMany, OneToOne, type Opt, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';
import { Roles } from './Roles';
import { Skills } from './Skills';
import { Freelancerprofiles } from './Freelancerprofiles';
import { Clientprofiles } from './Clientprofiles';

@Entity()
export class Users {

  [PrimaryKeyProp]?: 'userId';

  @PrimaryKey({ type: 'integer', generated: 'by default as identity' })
  userId!: number & Opt;

  @Property({ unique: 'users_email_key' })
  email!: string;

  @Property()
  passwordHash!: string;

  @Property({ nullable: true })
  fullName?: string;

  @Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP` })
  registrationDate?: Date;

  @Property({ nullable: true })
  lastLogin?: Date;

  @Property({ type: 'boolean', nullable: true })
  isActive?: boolean = true;

  @Property({ length: 500, nullable: true })
  profileImageUrl?: string;

  @Property({ type: 'text', nullable: true })
  avatarUrl?: string;

  @ManyToMany({ entity: () => Skills, pivotTable: 'freelancerskills', joinColumn: 'user_id', inverseJoinColumn: 'skill_id' })
  freelancerskills = new Collection<Skills>(this);

  @ManyToMany({ entity: () => Roles, pivotTable: 'userroles', joinColumn: 'user_id', inverseJoinColumn: 'role_id' })
  roles = new Collection<Roles>(this);

  @OneToOne(() => Freelancerprofiles, profile => profile.user, { nullable: true })
  freelancerProfile?: Freelancerprofiles;

  @OneToOne(() => Clientprofiles, profile => profile.user, { nullable: true })
  clientProfile?: Clientprofiles;

}
