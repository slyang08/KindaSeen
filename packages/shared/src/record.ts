// packages/shared/src/record.ts
export type Record = {
  id: string;
  user_id: string;
  title: string;
  media_type: string;
  status: string;
  rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type RecordCreate = {
  title: string;
  media_type: string;
  status: string;
  rating?: number | null;
  notes?: string | null;
};

export type RecordUpdate = Partial<RecordCreate>;
