// @ts-nocheck
export interface TagDocument {
  _id: string;
  guildId: string;
  name: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  uses: number;
}

export const tagsCollectionName = 'server_tags';
