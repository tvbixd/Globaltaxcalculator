import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TaxCalculation } from '../App';

interface CalculatorProps {
  onCalculate: (calculation: TaxCalculation) => void;
}

type Country = 'nigeria' | 'usa' | 'uk' | 'canada' | 'ghana' | 'kenya' | 'south-africa' | 'australia';

interface CountryConfig {
  name: string;
  currency: string;
  taxBrackets: { max: number; rate: number; label: string }[];
  reliefFields: {
    pension?: { label: string; description: string };
    nhf?: { label: string; description: string };
    standard?: { label: string; amount: number };
  };
  taxLabel: string;
}

const COUNTRY_CONFIGS: Record<Country, CountryConfig> = {
  nigeria: {
    name: 'Nigeria',
    currency: '₦',
    taxBrackets: [
      { max: 300000, rate: 0.07, label: "7%" },
      { max: 600000, rate: 0.11, label: "11%" },
      { max: 1100000, rate: 0.15, label: "15%" },
      { max: 1600000, rate: 0.19, label: "19%" },
      { max: 3200000, rate: 0.21, label: "21%" },
      { max: Infinity, rate: 0.24, label: "24%" }
    ],
    reliefFields: {
      pension: {
        label: 'Pension Contribution (8%)',
        description: 'pension contribution (typically 8% of basic + housing + transport)'
      },
      nhf: {
        label: 'National Housing Fund (2.5%)',
        description: '2.5% of basic salary contribution to NHF'
      }
    },
    taxLabel: 'PAYE Tax'
  },
  usa: {
    name: 'United States',
    currency: '$',
    taxBrackets: [
      { max: 11000, rate: 0.10, label: "10%" },
      { max: 44725, rate: 0.12, label: "12%" },
      { max: 95375, rate: 0.22, label: "22%" },
      { max: 182100, rate: 0.24, label: "24%" },
      { max: 231250, rate: 0.32, label: "32%" },
      { max: 578125, rate: 0.35, label: "35%" },
      { max: Infinity, rate: 0.37, label: "37%" }
    ],
    reliefFields: {
      standard: {
        label: 'Standard Deduction',
        amount: 13850
      }
    },
    taxLabel: 'Federal Income Tax'
  },
  uk: {
    name: 'United Kingdom',
    currency: '£',
    taxBrackets: [
      { max: 12570, rate: 0.00, label: "0%" },
      { max: 50270, rate: 0.20, label: "20%" },
      { max: 125140, rate: 0.40, label: "40%" },
      { max: Infinity, rate: 0.45, label: "45%" }
    ],
    reliefFields: {},
    taxLabel: 'Income Tax'
  },
  canada: {
    name: 'Canada',
    currency: '$',
    taxBrackets: [
      { max: 53359, rate: 0.15, label: "15%" },
      { max: 106717, rate: 0.205, label: "20.5%" },
      { max: 165430, rate: 0.26, label: "26%" },
      { max: 235675, rate: 0.29, label: "29%" },
      { max: Infinity, rate: 0.33, label: "33%" }
    ],
    reliefFields: {
      standard: {
        label: 'Basic Personal Amount',
        amount: 15000
      }
    },
    taxLabel: 'Federal Income Tax'
  },
  ghana: {
    name: 'Ghana',
    currency: '₵',
    taxBrackets: [
      { max: 5220, rate: 0.00, label: "0%" },
      { max: 7320, rate: 0.05, label: "5%" },
      { max: 9360, rate: 0.10, label: "10%" },
      { max: 41400, rate: 0.175, label: "17.5%" },
      { max: 242400, rate: 0.25, label: "25%" },
      { max: Infinity, rate: 0.30, label: "30%" }
    ],
    reliefFields: {},
    taxLabel: 'Income Tax'
  },
  kenya: {
    name: 'Kenya',
    currency: 'KSh',
    taxBrackets: [
      { max: 288000, rate: 0.10, label: "10%" },
      { max: 388000, rate: 0.25, label: "25%" },
      { max: 6000000, rate: 0.30, label: "30%" },
      { max: Infinity, rate: 0.35, label: "35%" }
    ],
    reliefFields: {
      standard: {
        label: 'Personal Relief',
        amount: 28800
      }
    },
    taxLabel: 'PAYE Tax'
  },
  'south-africa': {
    name: 'South Africa',
    currency: 'R',
    taxBrackets: [
      { max: 237100, rate: 0.18, label: "18%" },
      { max: 370500, rate: 0.26, label: "26%" },
      { max: 512800, rate: 0.31, label: "31%" },
      { max: 673000, rate: 0.36, label: "36%" },
      { max: 857900, rate: 0.39, label: "39%" },
      { max: 1817000, rate: 0.41, label: "41%" },
      { max: Infinity, rate: 0.45, label: "45%" }
    ],
    reliefFields: {
      standard: {
        label: 'Primary Rebate',
        amount: 17235
      }
    },
    taxLabel: 'Income Tax'
  },
  australia: {
    name: 'Australia',
    currency: '$',
    taxBrackets: [
      { max: 18200, rate: 0.00, label: "0%" },
      { max: 45000, rate: 0.19, label: "19%" },
      { max: 120000, rate: 0.325, label: "32.5%" },
      { max: 180000, rate: 0.37, label: "37%" },
      { max: Infinity, rate: 0.45, label: "45%" }
    ],
    reliefFields: {},
    taxLabel: 'Income Tax'
  }
};

export function Calculator({ onCalculate }: CalculatorProps) {
  const [country, setCountry] = useState<Country>('nigeria');
  const [income, setIncome] = useState('');
  const [incomePeriod, setIncomePeriod] = useState<'monthly' | 'annual'>('monthly');
  const [pension, setPension] = useState('');
  const [nhf, setNhf] = useState('');
  const [deductions, setDeductions] = useState('');

  const config = COUNTRY_CONFIGS[country];

  const calculateTax = () => {
    const incomeValue = parseFloat(income) || 0;
    const grossIncome = incomePeriod === 'monthly' ? incomeValue * 12 : incomeValue;
    
    let totalReliefs = 0;
    let otherDeductions = 0;

    // Country-specific relief calculations
    if (country === 'nigeria') {
      const pensionContribution = parseFloat(pension) || 0;
      const nhfContribution = parseFloat(nhf) || 0;
      
      // CRA calculation
      const onePercent = grossIncome * 0.01;
      const higherAmount = Math.max(onePercent, 200000);
      const cra = higherAmount + (grossIncome * 0.20);
      
      totalReliefs = cra + pensionContribution + nhfContribution;
      otherDeductions = pensionContribution + nhfContribution;
    } else if (config.reliefFields.standard) {
      // Countries with standard deduction/relief
      totalReliefs = config.reliefFields.standard.amount;
      const additionalDeductions = parseFloat(deductions) || 0;
      totalReliefs += additionalDeductions;
    } else {
      // Countries without standard relief
      const additionalDeductions = parseFloat(deductions) || 0;
      totalReliefs = additionalDeductions;
    }

    const taxableIncome = Math.max(0, grossIncome - totalReliefs);

    let tax = 0;
    let previousMax = 0;
    const breakdown = [];

    for (const bracket of config.taxBrackets) {
      const incomeInBracket = Math.min(taxableIncome, bracket.max) - previousMax;
      
      if (incomeInBracket > 0) {
        const bracketTax = incomeInBracket * bracket.rate;
        tax += bracketTax;
        
        breakdown.push({
          bracket: `${(previousMax + 1).toLocaleString()} - ${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()}`,
          income: incomeInBracket,
          rate: bracket.rate,
          tax: bracketTax
        });
      }
      
      if (taxableIncome <= bracket.max) break;
      previousMax = bracket.max;
    }

    // For South Africa, apply tax rebate
    if (country === 'south-africa' && config.reliefFields.standard) {
      tax = Math.max(0, tax - config.reliefFields.standard.amount);
    }

    const effectiveRate = grossIncome > 0 ? (tax / grossIncome) * 100 : 0;
    const netIncome = grossIncome - tax - otherDeductions;

    onCalculate({
      grossIncome,
      taxableIncome,
      federalTax: tax,
      effectiveRate,
      netIncome,
      breakdown,
      currency: config.currency,
      taxLabel: config.taxLabel
    });
  };

  return (
    <Card className="p-6 mb-6 bg-white shadow-lg">
      <div className="space-y-5">
        {/* Country Selector */}
        <div>
          <Label htmlFor="country">Country</Label>
          <Select value={country} onValueChange={(value: Country) => {
            setCountry(value);
            setIncome('');
            setPension('');
            setNhf('');
            setDeductions('');
          }}>
            <SelectTrigger id="country" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nigeria">🇳🇬 Nigeria</SelectItem>
              <SelectItem value="usa">🇺🇸 United States</SelectItem>
              <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
              <SelectItem value="canada">🇨🇦 Canada</SelectItem>
              <SelectItem value="ghana">🇬🇭 Ghana</SelectItem>
              <SelectItem value="kenya">🇰🇪 Kenya</SelectItem>
              <SelectItem value="south-africa">🇿🇦 South Africa</SelectItem>
              <SelectItem value="australia">🇦🇺 Australia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Income Period Toggle */}
        <div>
          <Label className="mb-3 block">Income Period</Label>
          <RadioGroup 
            value={incomePeriod} 
            onValueChange={(value: 'monthly' | 'annual') => setIncomePeriod(value)}
            className="grid grid-cols-2 gap-3"
          >
            <div className="relative">
              <RadioGroupItem value="monthly" id="monthly" className="peer sr-only" />
              <Label 
                htmlFor="monthly" 
                className="flex items-center justify-center px-4 py-3 rounded-lg border-2 border-gray-200 cursor-pointer transition-all peer-data-[state=checked]:bg-emerald-600 peer-data-[state=checked]:border-emerald-600 peer-data-[state=checked]:text-white hover:border-emerald-300"
              >
                Monthly
              </Label>
            </div>
            <div className="relative">
              <RadioGroupItem value="annual" id="annual" className="peer sr-only" />
              <Label 
                htmlFor="annual" 
                className="flex items-center justify-center px-4 py-3 rounded-lg border-2 border-gray-200 cursor-pointer transition-all peer-data-[state=checked]:bg-emerald-600 peer-data-[state=checked]:border-emerald-600 peer-data-[state=checked]:text-white hover:border-emerald-300"
              >
                Annual
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Income Input */}
        <div>
          <Label htmlFor="income">
            {incomePeriod === 'monthly' ? 'Monthly Gross Income' : 'Annual Gross Income'}
          </Label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{config.currency}</span>
            <Input
              id="income"
              type="number"
              placeholder="0"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {incomePeriod === 'monthly' 
              ? 'Your monthly salary before deductions' 
              : 'Your total annual salary before deductions'}
          </p>
        </div>

        {/* Nigeria-specific fields */}
        {country === 'nigeria' && (
          <>
            <div>
              <Label htmlFor="pension">{config.reliefFields.pension?.label}</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{config.currency}</span>
                <Input
                  id="pension"
                  type="number"
                  placeholder="0"
                  value={pension}
                  onChange={(e) => setPension(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {incomePeriod === 'monthly' ? 'Monthly' : 'Annual'} {config.reliefFields.pension?.description}
              </p>
            </div>

            <div>
              <Label htmlFor="nhf">{config.reliefFields.nhf?.label}</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{config.currency}</span>
                <Input
                  id="nhf"
                  type="number"
                  placeholder="0"
                  value={nhf}
                  onChange={(e) => setNhf(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Optional: {incomePeriod === 'monthly' ? 'Monthly' : 'Annual'} {config.reliefFields.nhf?.description}
              </p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <p className="text-xs text-emerald-800">
                <strong>Consolidated Relief Allowance (CRA)</strong> is automatically calculated as the higher of 1% of gross income or ₦200,000 plus 20% of gross income.
              </p>
            </div>
          </>
        )}

        {/* Standard deduction/relief info */}
        {config.reliefFields.standard && country !== 'south-africa' && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>{config.reliefFields.standard.label}:</strong> {config.currency}{config.reliefFields.standard.amount.toLocaleString()} is automatically applied.
            </p>
          </div>
        )}

        {/* South Africa rebate info */}
        {country === 'south-africa' && config.reliefFields.standard && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>{config.reliefFields.standard.label}:</strong> {config.currency}{config.reliefFields.standard.amount.toLocaleString()} is automatically deducted from your tax liability.
            </p>
          </div>
        )}

        {/* Additional deductions for non-Nigeria countries */}
        {country !== 'nigeria' && (
          <div>
            <Label htmlFor="deductions">Additional Deductions (Optional)</Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{config.currency}</span>
              <Input
                id="deductions"
                type="number"
                placeholder="0"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Itemized deductions, retirement contributions, etc.
            </p>
          </div>
        )}

        <Button 
          onClick={calculateTax} 
          className="w-full bg-emerald-700 hover:bg-emerald-800"
        >
          Calculate {config.taxLabel}
        </Button>
      </div>
    </Card>
  );
}