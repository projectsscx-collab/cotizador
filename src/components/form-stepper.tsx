'use client';

interface FormStepperProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = ['Datos personales', 'Cotización', 'Emisión'];

const FormStepper: React.FC<FormStepperProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center w-full">
      <ol className="flex items-center w-full max-w-2xl">
        {stepLabels.map((label, index) => {
          const step = index + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;

          return (
            <li
              key={step}
              className={`flex items-center w-full ${
                index < totalSteps - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-300 after:inline-block" : ''
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
                    isActive ? 'bg-red-600 text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
                <span className={`mt-2 text-sm ${isActive ? 'font-semibold text-red-600' : isCompleted ? 'text-green-500' : 'text-gray-500'}`}>
                  {label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default FormStepper;
