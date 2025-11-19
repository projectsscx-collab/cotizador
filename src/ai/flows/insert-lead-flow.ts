
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { SalesforceTokenResponseSchema, FormDataSchema } from '@/lib/salesforce-schemas';

// --- Flow to get the authentication token ---
const getSalesforceTokenFlow = ai.defineFlow(
  {
    name: 'getSalesforceTokenFlow',
    inputSchema: z.void(),
    outputSchema: SalesforceTokenResponseSchema,
  },
  async () => {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', '3MVG9GnaLrwG9TQSi1HwolwMYR_mPFa_N1Vlp6IDnM5CBR7gEw3J3.kA_Yq55RKLo0cpoWqEJPOG0ar8XEV32');
    params.append('client_secret', '2ED807FA499232A40E0F2A8E1A68503F39CC565D2AE677EBA4E80EDBB41F6A42');
    params.append('username', 'rwsap@latam.mapfre.com.ropov3');
    params.append('password', 'R0PoCor3V3@2025!');

    const response = await fetch('https://test.salesforce.com/services/oauth2/token', {
      method: 'POST',
      body: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Salesforce login failed: ${response.status} ${errorText}`);
    }

    return response.json();
  }
);

// --- Flow to UPDATE the Asset ---
const updateQuotationFlow = ai.defineFlow(
  {
    name: 'updateQuotationFlow',
    inputSchema: z.object({ assetData: FormDataSchema }),
    outputSchema: z.any(), 
  },
  async ({ assetData }) => {
    const token = await getSalesforceTokenFlow();

    const { ISOCode__c, IdExternal__c, OpportunityId__c } = assetData;

    if (!ISOCode__c || !IdExternal__c) {
      throw new Error('ISOCode__c and IdExternal__c are required to identify the asset.');
    }

    const idInternal = `${ISOCode__c}_${IdExternal__c}`;
    const endpoint = `${token.instance_url}/services/data/v59.0/sobjects/Asset/IdInternal__c/${idInternal}`;

    // Construct the final payload for Salesforce with only the specified fields.
    const finalPayload = {
        IdExternal__c: assetData.IdExternal__c,
        Name: assetData.IdExternal__c, // As per requirement
        EffectiveDate__c: assetData.EffectiveDate__c,
        ExpirationDate__c: assetData.ExpirationDate__c,
        NetPremium__c: assetData.NetPremium__c,
        PaymentMethod__c: assetData.PaymentMethod__c,
        PaymentTerm__c: assetData.PaymentTerm__c,
        RecordType: { Name: "XX Quotation" }, // Hardcoded value
        ISOCode__c: "XX", // Hardcoded value
        OpportunityId__c: assetData.OpportunityId__c,
        AccountId: assetData.AccountId,
    };

    const assetResponse = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(finalPayload),
    });

    if (assetResponse.status === 204) {
      return {
        success: true,
        assetId: idInternal,
        fullResponse: 'Update successful (No Content)',
      };
    }
    
    const responseText = await assetResponse.text();
    if (!responseText) {
      if (assetResponse.ok) {
          return {
              success: true,
              assetId: idInternal,
              fullResponse: `Request successful with status ${assetResponse.status}, but no response body.`
          };
      }
      throw new Error(`Salesforce returned an empty response with status: ${assetResponse.status}`);
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Salesforce JSON response:', responseText);
      throw new Error(`Failed to parse Salesforce JSON response. Status: ${assetResponse.status}, Body: ${responseText}`);
    }

    if (!assetResponse.ok) {
      const errorDetails = JSON.stringify(responseData);
      console.error("Salesforce Update Error Response:", errorDetails);
      throw new Error(`Failed to update asset: ${assetResponse.status} ${errorDetails}`);
    }

    return {
      success: true,
      assetId: responseData.id || idInternal,
      fullResponse: responseData,
    };
  }
);

// --- Exported function to be called from the frontend ---
export async function updateQuotation(assetData: any): Promise<any> {
  // Validate with Zod before running the flow.
  const validatedData = FormDataSchema.parse(assetData);
  return updateQuotationFlow({ assetData: validatedData });
}

// --- Schema for the Opportunity update ---
const OpportunityUpdateSchema = z.object({
    OpportunityId__c: z.string(),
    CloseDate: z.string(),
    Amount: z.number(),
    PolicyNumber__c: z.string(),
  });
  
  // --- Flow to UPDATE the Opportunity ---
  const updateOpportunityFlow = ai.defineFlow(
    {
      name: 'updateOpportunityFlow',
      inputSchema: z.object({ opportunityData: OpportunityUpdateSchema }),
      outputSchema: z.any(),
    },
    async ({ opportunityData }) => {
      const token = await getSalesforceTokenFlow();
  
      const { OpportunityId__c, ...updatePayload } = opportunityData;
  
      if (!OpportunityId__c) {
        throw new Error('OpportunityId__c is required to identify the opportunity.');
      }
  
      const endpoint = `${token.instance_url}/services/data/v59.0/sobjects/Opportunity/${OpportunityId__c}`;
  
      const finalPayload = {
        ...updatePayload,
        StageName: "06", // Always set StageName to "06"
      };
  
      const opportunityResponse = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalPayload),
      });
  
      // Handle No Content response
      if (opportunityResponse.status === 204) {
        return {
          success: true,
          opportunityId: OpportunityId__c,
          fullResponse: 'Update successful (No Content)',
        };
      }
  
      const responseText = await opportunityResponse.text();
      if (!responseText) {
        if (opportunityResponse.ok) {
            return {
                success: true,
                opportunityId: OpportunityId__c,
                fullResponse: `Request successful with status ${opportunityResponse.status}, but no response body.`
            };
        }
        throw new Error(`Salesforce returned an empty response with status: ${opportunityResponse.status}`);
      }
  
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse Salesforce JSON response:', responseText);
        throw new Error(`Failed to parse Salesforce JSON response. Status: ${opportunityResponse.status}, Body: ${responseText}`);
      }
  
      if (!opportunityResponse.ok) {
        const errorDetails = JSON.stringify(responseData);
        console.error("Salesforce Update Error Response:", errorDetails);
        throw new Error(`Failed to update opportunity: ${opportunityResponse.status} ${errorDetails}`);
      }
  
      return {
        success: true,
        opportunityId: OpportunityId__c,
        fullResponse: responseData,
      };
    }
  );
  
  // --- Exported function to be called from the frontend ---
  export async function updateOpportunity(opportunityData: any): Promise<any> {
    // Validate with Zod before running the flow.
    const validatedData = OpportunityUpdateSchema.parse(opportunityData);
    return updateOpportunityFlow({ opportunityData: validatedData });
  }
