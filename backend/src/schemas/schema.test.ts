import { CrmRecordSchema } from './crm-record.schema';
import { RawCsvDataSchema } from './raw-csv-row.schema';

const sample = {
  created_at: '2026-05-13 14:20:48',
  name: 'John Doe',
  email: 'john.doe@example.com',
  country_code: '+91',
  mobile_without_country_code: '9876543210',
  company: 'GrowEasy',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  lead_owner: 'test@gmail.com',
  crm_status: 'GOOD_LEAD_FOLLOW_UP',
  crm_note: 'Client is asking to reschedule demo',
  data_source: '',
  possession_time: '',
  description: '',
};

console.log('CRM Record valid:', CrmRecordSchema.safeParse(sample).success);

const rawCsv = {
  headers: ['Full Name', 'Email Address'],
  rows: [{ 'Full Name': 'Jane', 'Email Address': 'jane@x.com' }],
};

console.log('Raw CSV valid:', RawCsvDataSchema.safeParse(rawCsv).success);