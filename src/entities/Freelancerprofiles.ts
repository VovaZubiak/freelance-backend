import { Entity, OneToOne, type Opt, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';
import { Users } from './Users';

@Entity()
export class Freelancerprofiles {

  [PrimaryKeyProp]?: 'profileId';

  @PrimaryKey({ type: 'integer', generated: 'by default as identity' })
  profileId!: number & Opt;

  @OneToOne({ entity: () => Users, fieldName: 'user_id', deleteRule: 'cascade', unique: 'freelancerprofiles_user_id_key' })
  user!: Users;

  @Property({ nullable: true })
  headline?: string;

  @Property({ type: 'text', nullable: true })
  bio?: string;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate?: string;

  @Property({ length: 100, nullable: true })
  availability?: string;

  @Property({ type: 'decimal', precision: 3, scale: 2, nullable: true, defaultRaw: `0.00` })
  totalRating?: string;

  @Property({ nullable: true })
  websiteUrl?: string;

}
