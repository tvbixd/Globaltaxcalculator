import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { TaxCalculation } from '../App';
import { DollarSign, Wallet, Percent } from 'lucide-react';

interface TaxResultsProps {
  calculation: TaxCalculation;
  currency?: string;
  taxLabel?: string;
}

export function TaxResults({ calculation, currency = '₦', taxLabel = 'PAYE Tax' }: TaxResultsProps) {
  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg">
          <div className="flex items-start justify-between mb-2">
            <DollarSign className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-xs opacity-90 mb-1">{taxLabel}</p>
          <p className="text-xl">{currency}{calculation.federalTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg">
          <div className="flex items-start justify-between mb-2">
            <Wallet className="w-5 h-5 opacity-80" />
          </div>
          <p className="text-xs opacity-90 mb-1">Net Income</p>
          <p className="text-xl">{currency}{calculation.netIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </Card>
      </div>

      {/* Details Card */}
      <Card className="p-6 bg-white shadow-lg">
        <h2 className="mb-4 text-emerald-900">Tax Summary</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Gross Income</span>
            <span>{currency}{calculation.grossIncome.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Taxable Income</span>
            <span>{currency}{calculation.taxableIncome.toLocaleString()}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{taxLabel}</span>
            <span className="text-red-600">{currency}{calculation.federalTax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Effective Tax Rate</span>
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <Percent className="w-4 h-4" />
              {calculation.effectiveRate.toFixed(2)}%
            </span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span>Net Income</span>
            <span className="text-green-600">{currency}{calculation.netIncome.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </Card>

      {/* Breakdown Card */}
      {calculation.breakdown.length > 0 && (
        <Card className="p-6 bg-white shadow-lg">
          <h2 className="mb-4 text-emerald-900">Tax Bracket Breakdown</h2>
          
          <div className="space-y-3">
            {calculation.breakdown.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{currency}{item.bracket}</span>
                  <span className="text-sm text-emerald-700">{(item.rate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {currency}{item.income.toLocaleString(undefined, { maximumFractionDigits: 0 })} taxable
                  </span>
                  <span className="text-sm">
                    {currency}{item.tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
                {index < calculation.breakdown.length - 1 && <Separator className="mt-2" />}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Monthly Breakdown */}
      <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg">
        <h3 className="mb-4 text-gray-900">Monthly Breakdown</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Gross Monthly</span>
            <span>{currency}{(calculation.grossIncome / 12).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Monthly PAYE</span>
            <span className="text-red-600">{currency}{(calculation.federalTax / 12).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Net Monthly</span>
            <span className="text-green-600">{currency}{(calculation.netIncome / 12).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-4 bg-green-50 border-green-200 border">
        <p className="text-xs text-green-800">
          <strong>Note:</strong> This calculator provides estimates based on standard tax rates. Actual tax may vary based on regional taxes, additional deductions, credits, and other factors specific to your situation.
        </p>
      </Card>
    </div>
  );
}