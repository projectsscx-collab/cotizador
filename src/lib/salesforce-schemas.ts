
import { z } from 'zod';

export const FormDataSchema = z.object({
  // IDs and technical fields
  IdExternal__c: z.string().optional(),
  Name: z.string().optional(), // Quote Number - Will be set to IdExternal__c

  // Step 2: Quote & Payment Details
  EffectiveDate__c: z.string().optional(),    // Fecha de inicio
  ExpirationDate__c: z.string().optional(),   // Fecha de cierre
  NetPremium__c: z.number().optional(),
  PaymentMethod__c: z.string().optional(),
  PaymentTerm__c: z.string().optional(),
  
  // Hardcoded fields
  RecordType: z.object({ Name: z.string() }).default({ Name: "XX Quotation" }),
  ISOCode__c: z.string().default("XX"),

  // Other fields from form that are not sent to salesforce
  id: z.string().optional(),
  idFullOperation: z.string().optional(),
  idInternal__c: z.string().optional(), 
  OpportunityId__c: z.string().optional(),
  firstName: z.string().min(1, 'El nombre es obligatorio.').optional(),
  lastName: z.string().min(1, 'El apellido es obligatorio.').optional(),
  birthdate: z.string().min(1, 'La fecha de nacimiento es obligatoria.').optional(),
  mobilePhone: z.string().min(1, 'El teléfono móvil es obligatorio.').optional(),
  phone: z.string().optional(),
  email: z.string().email('El correo electrónico no es válido.').optional(),
  IssueDate__c: z.string().optional(),
  DueDate__c: z.string().optional(),
  TotalPremium__c: z.number().optional(),
  TotalPremiumFactured__c: z.number().optional(),
  Commission__c: z.number().optional(),
  Taxes__c: z.number().optional(),
  PaymentPeriodicity__c: z.string().optional(),
  BusinessLine__c: z.string().optional(),
  Branch__c: z.string().optional(),
  AccountRoleIntermediaryId__r: z.object({ IdInternal__c: z.string() }).optional(),
  IsSelected__c: z.boolean().optional(),
  AccountId: z.string().optional(),
});

export type FormData = z.infer<typeof FormDataSchema>;

export const SalesforceTokenResponseSchema = z.object({
  access_token: z.string(),
  instance_url: z.string(),
  id: z.string(),
  token_type: z.string(),
  issued_at: z.string(),
  signature: z.string(),
});
