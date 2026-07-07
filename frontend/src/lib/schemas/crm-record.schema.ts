import { z } from 'zod';

export const CrmStatusEnum = z.enum([
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
]);

export const DataSourceEnum = z.enum([
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
]);

export const CrmRecordSchema = z.object({
  created_at: z.string(),
  name: z.string(),
  email: z.string().optional().or(z.literal('')),
  country_code: z.string().optional().or(z.literal('')),
  mobile_without_country_code: z.string().optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  lead_owner: z.string().optional().or(z.literal('')),
  crm_status: CrmStatusEnum.optional().or(z.literal('')),
  crm_note: z.string().optional().or(z.literal('')),
  data_source: DataSourceEnum.optional().or(z.literal('')),
  possession_time: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
});

export type CrmRecord = z.infer<typeof CrmRecordSchema>;
export type CrmStatus = z.infer<typeof CrmStatusEnum>;
export type DataSource = z.infer<typeof DataSourceEnum>;
