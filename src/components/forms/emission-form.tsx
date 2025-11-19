
'use client';

import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormData } from '@/lib/salesforce-schemas';

interface EmissionFormProps {
  initialData: Partial<FormData>;
  isSubmitting: boolean;
  onSubmit: (data: Partial<OpportunityUpdateData>) => void;
  onBack: () => void;
}

const OpportunityUpdateSchema = z.object({
    CloseDate: z.string().nonempty("La fecha de cierre es requerida"),
    Amount: z.number().positive("El importe debe ser un número positivo"),
    PolicyNumber__c: z.string().nonempty("El número de póliza es requerido"),
});

type OpportunityUpdateData = z.infer<typeof OpportunityUpdateSchema>;

const inputStyle = "mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow";
const labelStyle = "block text-sm font-medium text-gray-700";

const EmissionForm: React.FC<EmissionFormProps> = ({ initialData, isSubmitting, onSubmit, onBack }) => {
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<OpportunityUpdateData>({
    resolver: zodResolver(OpportunityUpdateSchema),
    defaultValues: {
        CloseDate: initialData.IssueDate__c || new Date().toISOString().split('T')[0],
        Amount: initialData.NetPremium__c || 0, // Changed from TotalPremiumFactured__c
        PolicyNumber__c: initialData.IdExternal__c || '',
    },
  });

  useEffect(() => {
    reset({
        CloseDate: initialData.IssueDate__c || new Date().toISOString().split('T')[0],
        Amount: initialData.NetPremium__c || 0, // Changed from TotalPremiumFactured__c
        PolicyNumber__c: initialData.IdExternal__c || '',
    });
  }, [initialData, reset]);

  const handleFormSubmit: SubmitHandler<OpportunityUpdateData> = (data) => {
    const finalData = {
        ...data,
        StageName: "06",
        OpportunityId__c: initialData.OpportunityId__c
    };
    onSubmit(finalData); 
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
    <h1 className="text-2xl font-bold text-center text-gray-800">Actualizar Oportunidad</h1>
    
    <section className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold border-b pb-2 mb-4">Detalles de la Oportunidad</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
                <label className={labelStyle}>Fecha de Cierre</label>
                <input type="date" {...register('CloseDate')} className={inputStyle} />
                {errors.CloseDate && <p className="text-red-500 text-xs mt-1">{errors.CloseDate.message}</p>}
            </div>
            <div>
                <label className={labelStyle}>Importe</label>
                <input type="number" step="0.01" {...register('Amount', { valueAsNumber: true })} className={inputStyle} />
                {errors.Amount && <p className="text-red-500 text-xs mt-1">{errors.Amount.message}</p>}
            </div>
            <div className="md:col-span-2">
                <label className={labelStyle}>Número de Póliza</label>
                <input {...register('PolicyNumber__c')} className={inputStyle} />
                {errors.PolicyNumber__c && <p className="text-red-500 text-xs mt-1">{errors.PolicyNumber__c.message}</p>}
            </div>
        </div>
    </section>

    <div className="flex justify-between pt-6">
        <button type="button" onClick={onBack} className="px-8 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors" disabled={isSubmitting}>
        Anterior
        </button>
        <button type="submit" className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors" disabled={isSubmitting}>
        {isSubmitting ? 'Actualizando...' : 'Actualizar y Finalizar'}
        </button>
    </div>
    </form>
  );
};

export default EmissionForm;
