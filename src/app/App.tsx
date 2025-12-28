import { useState } from 'react';
import { Calculator } from './components/Calculator';
import { TaxResults } from './components/TaxResults';

export interface TaxCalculation {
  grossIncome: number;
  taxableIncome: number;
  federalTax: number;
  effectiveRate: number;
  netIncome: number;
  breakdown: {
    bracket: string;
    income: number;
    rate: number;
    tax: number;
  }[];
  currency?: string;
  taxLabel?: string;
}

export default function App() {
  const [calculation, setCalculation] = useState<TaxCalculation | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-700 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-emerald-900 mb-2">Global Tax Calculator</h1>
          <p className="text-emerald-700">Calculate your income tax worldwide</p>
        </div>

        <Calculator onCalculate={setCalculation} />
        
        {calculation && (
          <TaxResults 
            calculation={calculation} 
            currency={calculation.currency}
            taxLabel={calculation.taxLabel}
          />
        )}
      </div>
    </div>
  );
}