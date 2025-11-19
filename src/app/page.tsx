
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import PersonalDetailsForm from '@/components/forms/personal-details-form';
import QuoteForm from '@/components/forms/quote-form';
import EmissionForm from '@/components/forms/emission-form';
import SubmissionConfirmation from '@/components/forms/submission-confirmation';
import FormStepper from '@/components/forms/form-stepper';
import { updateQuotation, updateOpportunity } from '@/ai/flows/insert-lead-flow';
import type { FormData } from '@/lib/salesforce-schemas';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/header';

const TOTAL_STEPS = 3;
const STEP_LABELS = ['Datos', 'Cotización', 'Emisión'];

const calculateUniqueId = (prefix = 'ID') => {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `${prefix}${timestamp}${randomPart}`;
};

const initialFormData: FormData = {};

function AppContent() {
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<Partial<FormData>>(initialFormData);
    const [direction, setDirection] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResponse, setSubmissionResponse] = useState<any>(null);

    useEffect(() => {
        const dataFromUrl: Partial<FormData> = {};
        let isSelectedFound = false;

        searchParams.forEach((value, key) => {
            if (['NetPremium__c', 'TotalPremium__c', 'Commission__c', 'Taxes__c', 'TotalPremiumFactured__c'].includes(key)) {
                (dataFromUrl as any)[key] = parseFloat(value) || 0;
            } else if (key === 'IsSelected__c') {
                isSelectedFound = true;
                (dataFromUrl as any)[key] = value === 'true';
            } else if (key === 'AccountRoleIntermediaryId__r.IdInternal__c') {
                dataFromUrl.AccountRoleIntermediaryId__r = { IdInternal__c: value };
            } else if (key === 'RecordType.Name') {
                dataFromUrl.RecordType = { Name: value };
            } else if (key.toLowerCase() === 'accountid') { // Case-insensitive check for AccountId
                dataFromUrl.AccountId = value;
            } else {
                (dataFromUrl as any)[key] = value;
            }
        });

        if (!isSelectedFound) {
            dataFromUrl.IsSelected__c = true;
        }

        if (!dataFromUrl.idFullOperation) {
            dataFromUrl.idFullOperation = calculateUniqueId('IS');
        }
        
        setFormData(dataFromUrl);
    }, [searchParams]);

    const handleNextStep = (data: Partial<FormData>) => {
        setDirection(1);
        setFormData((prev) => ({ ...prev, ...data }));
        if (currentStep < TOTAL_STEPS + 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handleQuotationSubmit = async (data: Partial<FormData>) => {
        setIsSubmitting(true);
        const finalData = { ...formData, ...data };
        setFormData(finalData);

        try {
            const response = await updateQuotation(finalData);
            // We don't set submissionResponse here, we wait for the final opportunity update
            handleNextStep(finalData); // Proceed to next step
        } catch (error) {
            console.error('Error during quotation submission:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
            toast({
                variant: 'destructive',
                title: 'Error al Enviar la Cotización',
                description: errorMessage,
            });
            // Decide if you want to stop the flow here or let them proceed
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpportunitySubmit = async (opportunityData: any) => {
        setIsSubmitting(true);
        try {
            const response = await updateOpportunity(opportunityData);
            setSubmissionResponse(response);
            setCurrentStep((prev) => prev + 1); // Go to final confirmation
        } catch (error) {
            console.error('Error during opportunity submission:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
            toast({
                variant: 'destructive',
                title: 'Error al Actualizar la Oportunidad',
                description: errorMessage,
            });
            setSubmissionResponse({ success: false, fullResponse: error });
            setCurrentStep((prev) => prev + 1); // Still go to confirmation to show error
        } finally {
            setIsSubmitting(false);
        }
    }

    const handlePrev = () => {
        if (currentStep > 1) {
            setDirection(-1);
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleStartOver = () => {
        window.location.reload();
    };

    const formVariants = {
        hidden: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
        visible: { x: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeInOut' } },
        exit: (direction: number) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }),
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <PersonalDetailsForm onSubmit={handleNextStep} initialData={formData} />;
            case 2:
                return <QuoteForm 
                            initialData={formData}
                            isSubmitting={isSubmitting}
                            onSubmit={handleQuotationSubmit} // Update Asset
                            onBack={handlePrev} 
                        />;
            case 3:
                return <EmissionForm 
                            initialData={formData}
                            isSubmitting={isSubmitting}
                            onSubmit={handleOpportunitySubmit} // Update Opportunity
                            onBack={handlePrev} 
                        />;
            case 4:
                return <SubmissionConfirmation onStartOver={handleStartOver} updateResponse={submissionResponse} />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full max-w-5xl bg-card p-8 rounded-lg shadow-md mt-4">
            <header className="flex flex-col items-center justify-center mb-12">
                <FormStepper currentStep={Math.min(currentStep, TOTAL_STEPS + 1)} steps={STEP_LABELS} />
            </header>

            <main className="overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <div className="flex-grow flex items-start justify-center p-4 sm:p-6">
                <Suspense fallback={<div className="text-center mt-10">Cargando datos de la cotización...</div>}>
                    <AppContent />
                </Suspense>
            </div>
        </div>
    );
}
