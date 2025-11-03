import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Verification } from './components/Verification';
import { Features } from './components/Features';
import { Team } from './components/Team';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { VerificationResultData, ProgressState } from './types';
import { analyzeDocument } from './services/geminiService';

const App: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [verificationResult, setVerificationResult] = useState<VerificationResultData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [progress, setProgress] = useState<ProgressState>({ percent: 0, text: '' });

    const resetState = () => {
        setFile(null);
        setPreviewUrl(null);
        setVerificationResult(null);
        setError(null);
        setIsLoading(false);
        setProgress({ percent: 0, text: '' });
    };
    
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleVerification = useCallback(async (selectedFile: File) => {
        if (!process.env.API_KEY) {
            setError('API key is not configured. Please set the API_KEY environment variable.');
            return;
        }

        resetState();
        setIsLoading(true);
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));

        try {
            const stages: { percent: number; text: string }[] = [
                { percent: 10, text: "Preprocessing document image..." },
                { percent: 25, text: "Sending to Gemini AI for analysis..." },
                { percent: 50, text: "Running multi-language OCR..." },
                { percent: 65, text: "Analyzing security features..." },
                { percent: 80, text: "Validating document structure..." },
                { percent: 95, text: "Compiling verification report..." },
            ];

            for (const stage of stages) {
                setProgress(stage);
                await new Promise(resolve => setTimeout(resolve, 400));
            }

            const base64Image = await fileToBase64(selectedFile);
            
            setProgress({ percent: 98, text: "Receiving results from Gemini..." });
            
            const result = await analyzeDocument(base64Image, selectedFile.type);
            setVerificationResult(result);
            setError(null);

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during verification.';
            setError(`Verification Failed: ${errorMessage}`);
            setVerificationResult(null);
        } finally {
            setProgress({ percent: 100, text: "Analysis complete." });
            setIsLoading(false);
        }
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                <Hero />
                <Verification
                    onFileSelect={handleVerification}
                    isLoading={isLoading}
                    progress={progress}
                    verificationResult={verificationResult}
                    previewUrl={previewUrl}
                    error={error}
                    resetState={resetState}
                />
                <Features />
                <Team />
                <Contact />
            </main>
            <Footer />
        </div>
    );
};

export default App;