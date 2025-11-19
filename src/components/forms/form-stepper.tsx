
interface FormStepperProps {
    currentStep: number;
    steps: string[];
}

const FormStepper: React.FC<FormStepperProps> = ({ currentStep, steps }) => {
    const totalSteps = steps.length;

    return (
        <div className="w-full max-w-2xl px-4 sm:px-0">
            <div className="relative flex items-center justify-between">
                {/* Progress Bar */}
                <div className="absolute left-0 top-1/2 w-full h-1.5 bg-gray-200 rounded-full" style={{ transform: 'translateY(-50%)' }}></div>
                <div
                    className="absolute left-0 top-1/2 h-1.5 bg-red-600 rounded-full transition-all duration-500 ease-in-out"
                    style={{
                        width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
                        transform: 'translateY(-50%)',
                    }}
                ></div>

                {/* Steps */}
                {steps.map((label, index) => {
                    const step = index + 1;
                    const isCompleted = step < currentStep;
                    const isActive = step === currentStep;

                    const labelClasses = `
                        mt-3 text-center text-sm font-medium transition-colors
                        ${isActive ? 'text-red-600' : 'text-gray-500'}
                        ${isCompleted ? 'text-gray-800' : ''}
                    `;

                    return (
                        <div key={step} className="relative z-10 flex flex-col items-center">
                            <div
                                className={`
                                    w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all duration-300 shadow-md
                                    ${isCompleted ? 'bg-red-600 border-red-700 text-white' : ''}
                                    ${isActive ? 'bg-white border-red-600 scale-110' : ''}
                                    ${!isCompleted && !isActive ? 'bg-white border-gray-300 text-gray-400' : ''}
                                `}
                            >
                                {isCompleted ? (
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className={`text-lg font-bold ${isActive ? 'text-red-600' : ''}`}>{step}</span>
                                )}
                            </div>
                            <p className={labelClasses}>
                                {label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FormStepper;
