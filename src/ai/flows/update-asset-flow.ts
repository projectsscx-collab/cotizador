
import { SalesforceTokenResponseSchema } from '@/lib/salesforce-schemas';
import { z } from 'zod';
import { nonAuthenticatedFlow } from '@genkit-ai/flow';

const UpdatableFieldsFromInputSchema = z.object({
    EffectiveDate__c: z.string().optional(),
    ExpirationDate__c: z.string().optional(),
    NetPremium__c: z.number().optional(),
    PaymentMethod__c: z.string().optional(),
    PaymentTerm__c: z.string().optional(),
});

async function getSalesforceToken() {
    const url = `${process.env.SALESFORCE_LOGIN_URL}/services/oauth2/token`;
    const body = new URLSearchParams({
        grant_type: 'password',
        client_id: process.env.SALESFORCE_CLIENT_ID || '',
        client_secret: process.env.SALESFORCE_CLIENT_SECRET || '',
        username: process.env.SALESFORCE_USERNAME || '',
        password: process.env.SALESFORCE_PASSWORD || '',
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Salesforce token API error: ${response.status} ${errorText}`);
    }

    return SalesforceTokenResponseSchema.parse(await response.json());
}

export const updateAssetFlow = nonAuthenticatedFlow(
    {
        name: 'updateAssetFlow',
        inputSchema: z.object({ 
            IdExternal__c: z.string(),
            Name: z.string(),
            EffectiveDate__c: z.string().optional(),
            ExpirationDate__c: z.string().optional(),
            NetPremium__c: z.number().optional(),
            PaymentMethod__c: z.string().optional(),
            PaymentTerm__c: z.string().optional(),
        }),
        outputSchema: z.any(),
    },
    async (input) => {
        const token = await getSalesforceToken();
        const ISOCode__c = 'XX';
        const idInternal__c = `${ISOCode__c}_${input.IdExternal__c}`;

        const endpoint = `${token.instance_url}/services/data/v59.0/sobjects/Asset/idInternal__c/${idInternal__c}`;

        const updatableFields = UpdatableFieldsFromInputSchema.parse(input);

        const assetPayload = {
            ...updatableFields,
            Name: input.Name,
            ISOCode__c: 'XX',
            IsSelected__c: true,
            RecordType: { Name: 'XX Quotation' },
        };

        console.log('Endpoint:', endpoint);
        console.log('Payload:', JSON.stringify(assetPayload, null, 2));

        const salesforceResponse = await fetch(endpoint, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.access_token}`,
            },
            body: JSON.stringify(assetPayload),
        });

        if (!salesforceResponse.ok) {
            const errorText = await salesforceResponse.text();
            console.error('Salesforce API Error:', errorText);
            throw new Error(`Failed to update asset: ${salesforceResponse.status} ${errorText}`);
        }

        if (salesforceResponse.status === 204) {
            return { success: true, message: 'Asset updated successfully.' };
        }

        return await salesforceResponse.json();
    }
);
