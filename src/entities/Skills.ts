import { Collection, Entity, ManyToMany, type Opt, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';
import type { Projects } from './Projects';

@Entity()
export class Skills {

  [PrimaryKeyProp]?: 'skillId';

  @PrimaryKey({ type: 'integer', generated: 'by default as identity' })
  skillId!: number & Opt;

  @Property({ length: 100, unique: 'skills_skill_name_key' })
  skillName!: string;

  @ManyToMany('Projects', 'skills')
  projects = new Collection<Projects>(this);

}
