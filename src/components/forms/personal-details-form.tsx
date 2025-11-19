
'use client';

import { useEffect } from 'react'; // Import useEffect
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormData, FormDataSchema } from '@/lib/salesforce-schemas';

interface PersonalDetailsFormProps {
  initialData: Partial<FormData>;
  onSubmit: (data: Partial<FormData>) => void;
}

const PersonalDetailsSchema = FormDataSchema.pick({
  firstName: true,
  lastName: true,
  birthdate: true,
  mobilePhone: true,
  phone: true,
  email: true,
});

const inputStyle = "mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow";

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({ initialData, onSubmit }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<FormData>>({
    resolver: zodResolver(PersonalDetailsSchema),
    defaultValues: initialData,
  });

  // Add useEffect to reset the form when initialData changes
  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const handleFormSubmit: SubmitHandler<Partial<FormData>> = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Datos Personales y de Contacto</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input {...register('firstName')} className={inputStyle} />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">Apellido</label>
          <input {...register('lastName')} className={inputStyle} />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
          <input type="date" {...register('birthdate')} className={inputStyle} />
          {errors.birthdate && <p className="text-red-500 text-xs mt-1">{errors.birthdate.message}</p>}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">Teléfono Móvil</label>
          <input {...register('mobilePhone')} className={inputStyle} />
          {errors.mobilePhone && <p className="text-red-500 text-xs mt-1">{errors.mobilePhone.message}</p>}
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">Teléfono Fijo (Opcional)</label>
          <input {...register('phone')} className={inputStyle} />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
          <input {...register('email')} className={inputStyle} />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
          Siguiente
        </button>
      </div>
    </form>
  );
};

export default PersonalDetailsForm;
