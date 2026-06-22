import { Entity, ManyToOne, type Opt, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';
import { Contracts } from './Contracts';
import { Users } from './Users';

@Entity()
export class Projectfiles {

  [PrimaryKeyProp]?: 'fileId';

  @PrimaryKey({ type: 'integer', generated: 'by default as identity' })
  fileId!: number & Opt;

  @ManyToOne({ entity: () => Contracts, fieldName: 'contract_id', deleteRule: 'cascade' })
  contract!: Contracts;

  @ManyToOne({ entity: () => Users })
  uploader!: Users;

  @Property({ nullable: true })
  fileNameOriginal?: string;

  @Property({ length: 1024 })
  filePathStorage!: string;

  @Property({ nullable: true })
  fileSizeBytes?: bigint;

  @Property({ length: 500, nullable: true })
  description?: string;

  @Property({ type: 'boolean', nullable: true })
  isSensitive?: boolean = false;

  @Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP` })
  uploadedAt?: Date;

}
