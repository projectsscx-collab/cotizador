
'use client';

import { CheckCircle, XCircle } from 'lucide-react';

interface SubmissionConfirmationProps {
  onStartOver: () => void;
  updateResponse: any; 
}

const SubmissionConfirmation: React.FC<SubmissionConfirmationProps> = ({ onStartOver, updateResponse }) => {
  const isSuccess = updateResponse?.success;

  return (
    <div className="flex flex-col items-center justify-center text-center py-10">
      {isSuccess ? (
        <>
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">¡Actualización Exitosa!</h2>
          <p className="mt-2 text-gray-600">
            El Asset ha sido actualizado correctamente en Salesforce.
          </p>
          <div className="mt-4 text-sm text-gray-600 bg-gray-100 p-3 rounded-md">
            ID del Asset: <span className="font-mono font-semibold">{updateResponse?.assetId}</span>
          </div>
        </>
      ) : (
        <>
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Error en la Actualización</h2>
          <p className="mt-2 text-gray-600 max-w-md">
            Hubo un problema al intentar actualizar el Asset en Salesforce. Por favor, revisa los detalles del error.
          </p>
          <div className="mt-4 text-sm text-red-700 bg-red-50 p-3 rounded-md w-full max-w-md">
            <pre className="whitespace-pre-wrap font-mono text-left text-xs">
                {JSON.stringify(updateResponse?.fullResponse, null, 2)}
            </pre>
          </div>
        </>
      )}
      
      <button
        onClick={onStartOver}
        className="mt-8 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Volver al Inicio
      </button>
    </div>
  );
};

export default SubmissionConfirmation;
