
'use client';

import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormData, FormDataSchema } from '@/lib/salesforce-schemas';
import { useSearchParams } from 'next/navigation';

interface QuoteFormProps {
  initialData: Partial<FormData>;
  onSubmit: (data: Partial<FormData>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const QuoteStepSchema = FormDataSchema.pick({
  IdExternal__c: true,
  EffectiveDate__c: true,
  ExpirationDate__c: true,
  NetPremium__c: true,
  PaymentMethod__c: true,
  PaymentTerm__c: true,
  OpportunityId__c: true,
  AccountId: true,
});

const inputStyle = "mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow";
const labelStyle = "block text-sm font-medium text-gray-700";

const QuoteForm: React.FC<QuoteFormProps> = ({ initialData, onSubmit, onBack, isSubmitting }) => {
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Partial<FormData>>({
    resolver: zodResolver(QuoteStepSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    const idExternal = searchParams.get('IdExternal__c');
    const effectiveDate = searchParams.get('EffectiveDate__c');
    const expirationDate = searchParams.get('ExpirationDate__c');
    const netPremium = searchParams.get('NetPremium__c');
    const paymentMethod = searchParams.get('PaymentMethod__c');
    const paymentTerm = searchParams.get('PaymentTerm__c');
    const opportunityId = searchParams.get('OpportunityId__c');
    const accountId = searchParams.get('AccountId');

    const urlData = {
        ...(idExternal && { IdExternal__c: idExternal }),
        ...(effectiveDate && { EffectiveDate__c: effectiveDate }),
        ...(expirationDate && { ExpirationDate__c: expirationDate }),
        ...(netPremium && { NetPremium__c: parseFloat(netPremium) }),
        ...(paymentMethod && { PaymentMethod__c: paymentMethod }),
        ...(paymentTerm && { PaymentTerm__c: paymentTerm }),
        ...(opportunityId && { OpportunityId__c: opportunityId }),
        ...(accountId && { AccountId: accountId }),
    };

    reset({ ...initialData, ...urlData });
  }, [searchParams, reset, initialData]);

  const handleFormSubmit: SubmitHandler<Partial<FormData>> = (data) => {
    const finalData = {
      ...data,
      Name: data.IdExternal__c,
      ISOCode__c: 'XX',
      IsSelected__c: true,
      RecordType: { Name: 'XX Quotation' },
    };
    onSubmit(finalData);
  };

  return (
    <div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        <section>
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Detalles de la Cotización</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
                <label className={labelStyle}>Número de cotización</label>
                <input {...register('IdExternal__c')} className={inputStyle} />
                {errors.IdExternal__c && <p className="text-red-500 text-xs mt-1">{errors.IdExternal__c.message}</p>}
            </div>
            <div>
                <label className={labelStyle}>Fecha de efectividad</label>
                <input type="date" {...register('EffectiveDate__c')} className={inputStyle} />
                {errors.EffectiveDate__c && <p className="text-red-500 text-xs mt-1">{errors.EffectiveDate__c.message}</p>}
            </div>
            <div>
                <label className={labelStyle}>Fecha de expiración</label>
                <input type="date" {...register('ExpirationDate__c')} className={inputStyle} />
                {errors.ExpirationDate__c && <p className="text-red-500 text-xs mt-1">{errors.ExpirationDate__c.message}</p>}
            </div>
            <div>
                <label className={labelStyle}>Prima neta</label>
                <input type="number" step="0.01" {...register('NetPremium__c', { valueAsNumber: true })} className={inputStyle} />
                {errors.NetPremium__c && <p className="text-red-500 text-xs mt-1">{errors.NetPremium__c.message}</p>}
            </div>
            <div>
                <label className={labelStyle}>Método de pago</label>
                <select {...register('PaymentMethod__c')} className={inputStyle}>
                    <option value="01">Tarjeta de crédito</option>
                    <option value="02">Transferencia bancaria</option>
                    <option value="03">Paypal</option>
                </select>
                {errors.PaymentMethod__c && <p className="text-red-500 text-xs mt-1">{errors.PaymentMethod__c.message}</p>}
            </div>
            <div>
                <label className={labelStyle}>Plazo de pago</label>
                <select {...register('PaymentTerm__c')} className={inputStyle}>
                    <option value="01">12 Meses</option>
                    <option value="02">14 Meses</option>
                    <option value="03">36 Meses</option>
                </select>
                {errors.PaymentTerm__c && <p className="text-red-500 text-xs mt-1">{errors.PaymentTerm__c.message}</p>}
            </div>
            </div>
        </section>

        <div className="flex justify-between pt-6">
            <button type="button" onClick={onBack} className="px-8 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors" disabled={isSubmitting}>
            Anterior
            </button>
            <button type="submit" className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar y Continuar'}
            </button>
        </div>
        </form>
  </div>
  );
};

export default QuoteForm;
