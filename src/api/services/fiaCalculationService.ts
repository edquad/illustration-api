import { Request, Response } from 'express';

// FIA Calculation Constants
const MONTHS_PER_YEAR = 12;
const MAXIMUM_AGE = 100;

interface FiaClientData {
  [key: string]: any; // Add index signature for dynamic property access
  premium: number;
  birthday: string;
  first_term: number;
  second_term?: number;
  withdrawal_type: string;
  withdrawal_amount: number;
  withdrawal_from_year: number;
  withdrawal_to_year: number;
  frequency: number;
  ptp_w_cap_rate: number;
  ptp_w_participation_rate_500: number;
  ptp_w_participation_rate_marc5: number;
  ptp_w_participation_rate_tca: number;
  fixed_interest_account: number;
  glwb?: boolean;
  glwb_activation_age?: number;
  joint_indicator?: boolean;
}

interface FiaConstants {
  premium_bonus: number;
  premium_bonus_recapture: { [year: string]: number };
  free_total_wd: number;
  fixed_rate: number;
  index_account_cap_part: {
    ptp_w_cap_rate: number;
    ptp_w_part_rate_500: number;
    ptp_w_part_rate_marc5: number;
    ptp_w_part_rate_tca: number;
  };
  surrender_charges: { [year: string]: number };
  free_wd: { [year: string]: number };
}

interface GLWBConstants {
  benefit_base_bonus: number;
  rider_charge: number;
  rollup: number;
  rollup_period: number;
}

// Mock S&P 500 data - in production, this would come from a database or external API
const mockSP500Returns = [
  1.12, 1.08, 1.15, 1.05, 1.18, 1.02, 1.22, 1.07, 1.13, 1.09,
  1.11, 1.06, 1.19, 1.04, 1.16, 1.03, 1.21, 1.08, 1.14, 1.10
];

class FiaIllustrationCalculator {
  // Remove the definite assignment assertions and keep the initialized versions
  private clientAge: number = 0;
  private premium: number = 0;
  private durationMonths: number = 0;
  private withdrawalType: string = '';
  private withdrawalAmount: number = 0;
  private withdrawalFromYear: number = 0;
  private withdrawalToYear: number = 0;
  private frequency: number = 0;
  private ptpWCapRate: number = 0;
  private fixedAccount: number = 0;
  private glwb: boolean = false;
  private glwbActivationAge: number = 0;
  private jointIndicator: boolean = false;
  
  // Keep the additional properties that were only declared once
  private withdrawalFromMonth: number = 0;
  private withdrawalToMonth: number = 0;
  private withdrawalIntervalMonths: number = 0;
  private ptpWPartRate500: number = 0;
  private ptpWPartRateMarc5: number = 0;
  private ptpWPartRateTca: number = 0;
  private constants: FiaConstants;
  private glwbConstants: GLWBConstants;
  private sp500Returns: number[];

  constructor(clientData: FiaClientData, fiaConstants: FiaConstants, glwbConstants: GLWBConstants) {
    this.constants = fiaConstants;
    this.glwbConstants = glwbConstants;
    this.sp500Returns = mockSP500Returns;
    this.prepareCalculationParameters(clientData);
  }

  private prepareCalculationParameters(clientData: FiaClientData): void {
    // Calculate client age
    const today = new Date();
    const birthday = new Date(clientData.birthday);
    this.clientAge = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
      this.clientAge--;
    }

    // Client parameters
    this.premium = clientData.premium;
    this.withdrawalType = clientData.withdrawal_type;
    this.withdrawalAmount = clientData.withdrawal_amount;
    this.withdrawalFromMonth = (clientData.withdrawal_from_year - 1) * MONTHS_PER_YEAR;
    this.withdrawalToMonth = (clientData.withdrawal_to_year * MONTHS_PER_YEAR) - 1;
    this.frequency = clientData.frequency;  // This should now be 12 to match Python
    this.withdrawalIntervalMonths = MONTHS_PER_YEAR / this.frequency;  // 12/12 = 1 month intervals
    
    // Convert allocation percentages from whole numbers to decimals
    this.ptpWCapRate = clientData.ptp_w_cap_rate / 100;
    this.ptpWPartRate500 = clientData.ptp_w_participation_rate_500 / 100;
    this.ptpWPartRateMarc5 = clientData.ptp_w_participation_rate_marc5 / 100;
    this.ptpWPartRateTca = clientData.ptp_w_participation_rate_tca / 100;
    this.fixedAccount = clientData.fixed_interest_account / 100;

    // Duration calculation - fixed 10 years for illustration
    this.durationMonths = 10 * MONTHS_PER_YEAR + 1;
  }

  private shouldWithdraw(monthIndex: number): boolean {
    return (
      this.withdrawalType !== 'none' &&
      monthIndex >= this.withdrawalFromMonth &&
      monthIndex <= this.withdrawalToMonth &&
      (monthIndex % this.withdrawalIntervalMonths) === 0  // Fixed: removed -1 to align with Python logic
    );
  }

  private calculatePeriodWithdrawal(currentAccountValue: number, prevYearAccountValue: number): number {
    if (this.withdrawalType === 'fixed') {
      return this.withdrawalAmount / this.frequency;
    } else {
      return prevYearAccountValue * (this.withdrawalAmount / 100) / this.frequency;
    }
  }

  private calculateMonthlyValues(): { accumulatedValues: number[], withdrawals: number[] } {
    const accumulatedValues: number[] = new Array(this.durationMonths).fill(0);
    const withdrawals: number[] = new Array(this.durationMonths).fill(0);
    
    // Separate allocation buckets
    const ptpWCapRate: number[] = new Array(this.durationMonths).fill(0);
    const ptpWPartRate500: number[] = new Array(this.durationMonths).fill(0);
    const ptpWPartRateMarc5: number[] = new Array(this.durationMonths).fill(0);
    const ptpWPartRateTca: number[] = new Array(this.durationMonths).fill(0);
    const fixedAccount: number[] = new Array(this.durationMonths).fill(0);

    // Initialize first month with premium bonus
    const premiumWithBonus = this.premium * (1 + this.constants.premium_bonus);
    accumulatedValues[0] = premiumWithBonus;
    let prevYearAccountValue = accumulatedValues[0];
    let totalWithdrawalsForBonus = 0;

    // Allocate initial premium to different buckets
    ptpWCapRate[0] = premiumWithBonus * this.ptpWCapRate;
    ptpWPartRate500[0] = premiumWithBonus * this.ptpWPartRate500;
    ptpWPartRateMarc5[0] = premiumWithBonus * this.ptpWPartRateMarc5;
    ptpWPartRateTca[0] = premiumWithBonus * this.ptpWPartRateTca;
    fixedAccount[0] = premiumWithBonus * this.fixedAccount;

    // Calculate subsequent months
    for (let i = 1; i < this.durationMonths; i++) {
      const currentYear = Math.floor(i / MONTHS_PER_YEAR) + 1;
      const prevYear = Math.floor((i - 1) / MONTHS_PER_YEAR) + 1;
      
      // Reset yearly tracking at year boundary
      if (currentYear !== prevYear) {
        prevYearAccountValue = accumulatedValues[i - 1];
      }

      const lastMonthAccountValue = accumulatedValues[i - 1];
      let wdFromEquity = 0;
      let withdrawalsWRecapture = 0;

      // Calculate withdrawal if in withdrawal period
      if (this.shouldWithdraw(i)) {
        const withdrawalAmount = this.calculatePeriodWithdrawal(
          accumulatedValues[i - 1], 
          prevYearAccountValue
        );
        const curWithdrawal = Math.min(withdrawalAmount, Math.max(0, accumulatedValues[i - 1]));
        withdrawals[i] = curWithdrawal;
        totalWithdrawalsForBonus += curWithdrawal;

        // Calculate premium bonus recapture
        const wdForPremiumBonusOnly = Math.max(
          0, 
          curWithdrawal - Math.max(0, totalWithdrawalsForBonus - this.premium)
        );
        const premiumBonusRecaptureAmnt = (
          (this.constants.premium_bonus_recapture[currentYear.toString()] || 0) * 
          this.constants.premium_bonus *
          wdForPremiumBonusOnly * 
          (1 + lastMonthAccountValue / premiumWithBonus)
        );
        withdrawalsWRecapture = curWithdrawal + premiumBonusRecaptureAmnt;
        
        wdFromEquity = Math.max(
          0,
          (fixedAccount[i - 1] * Math.pow(1 + this.constants.fixed_rate, 1 / MONTHS_PER_YEAR) - withdrawalsWRecapture) * -1
        );
      }

      // Fixed account grows monthly
      fixedAccount[i] = Math.max(
        0, 
        fixedAccount[i - 1] * Math.pow(1 + this.constants.fixed_rate, 1 / MONTHS_PER_YEAR) - withdrawalsWRecapture
      );

      // For index accounts, only apply returns at year end
      const isYearEnd = i % MONTHS_PER_YEAR === 0;
      const wdEquityToPremiumBonus = lastMonthAccountValue !== 0 ? wdFromEquity / lastMonthAccountValue : 0;
      
      if (isYearEnd && i > 0) {
        // Apply annual index returns only at year end
        const yearIndex = Math.floor(i / MONTHS_PER_YEAR) - 1;
        const annualReturn = this.sp500Returns[yearIndex % this.sp500Returns.length] || 1.0;
        
        // Apply returns with caps and participation rates (more conservative approach)
        const capReturn = Math.min(annualReturn - 1, this.constants.index_account_cap_part.ptp_w_cap_rate);
        const partReturn500 = (annualReturn - 1) * this.constants.index_account_cap_part.ptp_w_part_rate_500;
        const partReturnMarc5 = (annualReturn - 1) * this.constants.index_account_cap_part.ptp_w_part_rate_marc5;
        const partReturnTca = (annualReturn - 1) * this.constants.index_account_cap_part.ptp_w_part_rate_tca;
        
        ptpWCapRate[i] = ptpWCapRate[i - 1] * (1 + Math.max(0, capReturn)) - ptpWCapRate[i - 1] * wdEquityToPremiumBonus;
        ptpWPartRate500[i] = ptpWPartRate500[i - 1] * (1 + Math.max(0, partReturn500)) - ptpWPartRate500[i - 1] * wdEquityToPremiumBonus;
        ptpWPartRateMarc5[i] = ptpWPartRateMarc5[i - 1] * (1 + Math.max(0, partReturnMarc5)) - ptpWPartRateMarc5[i - 1] * wdEquityToPremiumBonus;
        ptpWPartRateTca[i] = ptpWPartRateTca[i - 1] * (1 + Math.max(0, partReturnTca)) - ptpWPartRateTca[i - 1] * wdEquityToPremiumBonus;
      } else {
        // No returns applied mid-year, just carry forward with withdrawals
        ptpWCapRate[i] = ptpWCapRate[i - 1] - ptpWCapRate[i - 1] * wdEquityToPremiumBonus;
        ptpWPartRate500[i] = ptpWPartRate500[i - 1] - ptpWPartRate500[i - 1] * wdEquityToPremiumBonus;
        ptpWPartRateMarc5[i] = ptpWPartRateMarc5[i - 1] - ptpWPartRateMarc5[i - 1] * wdEquityToPremiumBonus;
        ptpWPartRateTca[i] = ptpWPartRateTca[i - 1] - ptpWPartRateTca[i - 1] * wdEquityToPremiumBonus;
      }

      // Total accumulated value is sum of all buckets
      accumulatedValues[i] = ptpWCapRate[i] + ptpWPartRate500[i] + ptpWPartRateMarc5[i] + ptpWPartRateTca[i] + fixedAccount[i];
    }

    return { accumulatedValues, withdrawals };
  }

  private aggregateToYearly(monthlyValues: number[], aggregationType: 'sum' | 'last' = 'sum'): number[] {
    const yearlyValues: number[] = [];
    
    for (let year = 0; year < Math.ceil(this.durationMonths / MONTHS_PER_YEAR); year++) {
      const startMonth = year * MONTHS_PER_YEAR;
      const endMonth = Math.min((year + 1) * MONTHS_PER_YEAR, this.durationMonths);
      
      if (aggregationType === 'sum') {
        const sum = monthlyValues.slice(startMonth, endMonth).reduce((acc, val) => acc + val, 0);
        yearlyValues.push(sum);
      } else { // 'last'
        yearlyValues.push(monthlyValues[endMonth - 1] || 0);
      }
    }
    
    return yearlyValues;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  }

  public calculate(): any {
    try {
      console.log('Starting FIA calculation with data:', {
        clientAge: this.clientAge,
        premium: this.premium,
        allocations: {
          ptpWCapRate: this.ptpWCapRate,
          ptpWPartRate500: this.ptpWPartRate500,
          ptpWPartRateMarc5: this.ptpWPartRateMarc5,
          ptpWPartRateTca: this.ptpWPartRateTca,
          fixedAccount: this.fixedAccount
        }
      });

      // Calculate monthly values
      const { accumulatedValues, withdrawals } = this.calculateMonthlyValues();
      
      // Aggregate to yearly values (take value at end of each year)
      const yearlyWithdrawals = this.aggregateToYearly(withdrawals, 'sum');
      const yearlyAccountValues = this.aggregateToYearly(accumulatedValues, 'last');
      
      // Calculate surrender values
      const yearlySurrenderValues: number[] = [];
      for (let year = 0; year < yearlyAccountValues.length; year++) {
        const surrenderCharge = this.constants.surrender_charges[(year + 1).toString()] || 0;
        const surrenderValue = Math.max(0, yearlyAccountValues[year] * (1 - surrenderCharge));
        yearlySurrenderValues.push(surrenderValue);
      }

      // Create result arrays matching Python structure exactly
      const data: (string | number)[][] = [];

      for (let i = 0; i < yearlyAccountValues.length; i++) {
        const age = this.clientAge + i;
        const year = i;
        const premium = i === 0 ? this.premium : 0;
        const withdrawal = yearlyWithdrawals[i] || 0;
        const accumulationValue = yearlyAccountValues[i] || 0;
        const surrenderValue = yearlySurrenderValues[i] || 0;
        // Calculate credited interest more conservatively
        const interest = i > 0 ? 
          Math.max(0, accumulationValue - (yearlyAccountValues[i-1] || 0) + withdrawal) : 
          accumulationValue - this.premium; // First year interest is growth from premium
        const deathBenefit = accumulationValue;
        
        data.push([
          age,
          year,
          this.formatCurrency(premium),
          this.formatCurrency(interest),
          this.formatCurrency(withdrawal),
          this.formatCurrency(accumulationValue),
          this.formatCurrency(surrenderValue),
          this.formatCurrency(deathBenefit)
        ]);
      }

      const result = {
        illustration_calc_data: {
          data: data,
          durations: `${Math.ceil(this.durationMonths / MONTHS_PER_YEAR)} Years`,
          ages: data.map(row => row[0]),
          years: data.map(row => row[1]),
          credited_interest: data.map(row => row[3]),
          premiums: data.map(row => row[2]),
          withdrawals: data.map(row => row[4]),
          accumulated_values: data.map(row => row[5]),
          surrender_values: data.map(row => row[6]),
          death_benefits: data.map(row => row[7])
        },
        accumulation_value_at_maturity: [this.formatCurrency(yearlyAccountValues[yearlyAccountValues.length - 1])],
        complete_surrender_values: yearlySurrenderValues.map(sv => this.formatCurrency(sv)),
        premium_bonus: (this.constants.premium_bonus * 100).toFixed(2) + '%',
        fixed_rate: (this.constants.fixed_rate * 100).toFixed(2) + '%',
        term_1_surrender_rates: Object.keys(this.constants.surrender_charges)
          .map(year => (this.constants.surrender_charges[year] * 100).toFixed(2) + '%'),
        age: this.clientAge,
        index_allocations: {
          ptp_w_cap_rate: (this.ptpWCapRate * 100).toFixed(2) + '%',
          ptp_w_participation_rate_500: (this.ptpWPartRate500 * 100).toFixed(2) + '%',
          ptp_w_participation_rate_marc5: (this.ptpWPartRateMarc5 * 100).toFixed(2) + '%',
          ptp_w_participation_rate_tca: (this.ptpWPartRateTca * 100).toFixed(2) + '%',
          fixed_interest_account: (this.fixedAccount * 100).toFixed(2) + '%'
        }
      };

      console.log('FIA calculation completed successfully:', {
        dataRows: result.illustration_calc_data.data.length,
        duration: result.illustration_calc_data.durations,
        clientAge: result.age
      });

      return result;
    } catch (error) {
      console.error('Error in FIA calculation:', error);
      throw new Error(`FIA calculation failed: ${'error'}`);
    }
  }
}

// Default FIA constants (would typically come from database)
const defaultFiaConstants: FiaConstants = {
  premium_bonus: 0.10, // 10% premium bonus
  premium_bonus_recapture: {
    '1': 0.10, '2': 0.09, '3': 0.08, '4': 0.07, '5': 0.06,
    '6': 0.05, '7': 0.04, '8': 0.03, '9': 0.02, '10': 0.01
  },
  free_total_wd: 0.10, // 10% free withdrawal
  fixed_rate: 0.03, // 3% fixed rate
  index_account_cap_part: {
    ptp_w_cap_rate: 0.06, // 6% cap
    ptp_w_part_rate_500: 0.85, // 85% participation
    ptp_w_part_rate_marc5: 0.80, // 80% participation
    ptp_w_part_rate_tca: 0.75 // 75% participation
  },
  surrender_charges: {
    '1': 0.09, '2': 0.08, '3': 0.07, '4': 0.06, '5': 0.05,
    '6': 0.04, '7': 0.03, '8': 0.02, '9': 0.01, '10': 0.00
  },
  free_wd: {
    '1': 0.10, '2': 0.10, '3': 0.10, '4': 0.10, '5': 0.10,
    '6': 0.10, '7': 0.10, '8': 0.10, '9': 0.10, '10': 0.10
  }
};

const defaultGlwbConstants: GLWBConstants = {
  benefit_base_bonus: 0.05, // 5% benefit base bonus
  rider_charge: 0.0095, // 0.95% rider charge
  rollup: 0.05, // 5% rollup
  rollup_period: 10 // 10 years
};

export const calculateFiaIllustration = async (req: Request, res: Response) => {
  try {
    console.log('FIA calculation request received:', req.body);
    
    const clientData: FiaClientData = req.body;
    
    // Validate required fields
    // In the calculateFiaIllustration function, replace the validation loop:
    const requiredFields: (keyof FiaClientData)[] = [
    'premium', 'birthday', 'first_term', 'withdrawal_type', 
    'withdrawal_amount', 'withdrawal_from_year', 'withdrawal_to_year', 'frequency'
  ];
  
  for (const field of requiredFields) {
    if (clientData[field] === undefined || clientData[field] === null) {
      return res.status(400).json({
        error: `Missing required field: ${field}`
      });
    }
  }
    
    // Validate allocation percentages sum to 100%
    const totalAllocation = 
      clientData.ptp_w_cap_rate + 
      clientData.ptp_w_participation_rate_500 + 
      clientData.ptp_w_participation_rate_marc5 + 
      clientData.ptp_w_participation_rate_tca + 
      clientData.fixed_interest_account;
    
    if (Math.abs(totalAllocation - 100) > 0.01) {
      return res.status(400).json({
        error: `Allocation percentages must sum to 100%. Current total: ${totalAllocation.toFixed(2)}%`
      });
    }
    
    const calculator = new FiaIllustrationCalculator(
      clientData,
      defaultFiaConstants,
      defaultGlwbConstants
    );
    
    const result = calculator.calculate();
    
    res.json(result);
  } catch (error) {
    console.error('FIA calculation error:', error);
    res.status(500).json({
      error: 'Internal server error during FIA calculation',
      details: ''
    });
  }
};