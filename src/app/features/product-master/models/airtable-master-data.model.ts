export interface AirtableRecord<TFields = Record<string, any>> {
  id: string;
  createdTime?: string;
  fields: TFields;
}

export interface AirtableListResponse<TFields = Record<string, any>> {
  records: AirtableRecord<TFields>[];
  offset?: string;
}

export interface AirtableCreateUpdateResponse<TFields = Record<string, any>> {
  records: AirtableRecord<TFields>[];
}

export interface AirtableDeleteResponse {
  records: Array<{
    id: string;
    deleted: boolean;
  }>;
}
