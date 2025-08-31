import { Request, Response } from 'express';

// MYGA Calculation Constants (mimicking Python constants)
const MONTHS_PER_YEAR = 12;
const MAXIMUM_AGE = 100;

interface ClientData {
  birthday: string;
  premium: number;
  first_term: number;
  second_term: number;
  withdrawal_type: string;
  withdrawal_amount: number;
  withdrawal_from_year: number;
  withdrawal_to_year: number;
  frequency: number;
}

interface Constants {
  mgir: number;
  free_total_wd: number;
  surrender_charges: { [key: number]: number };
  free_wd: { [key: number]: number };
  year_rates: { [key: number]: number };
}

class MygaCalculationService {
  private clientData: ClientData;
  private constants: Constants;
  private clientAge!: number; // Definite assignment assertion
  private premium!: number;
  private firstTermYears!: number;
  private secondTermYears!: number;
  private durationMonths!: number;
  private monthlyMgir!: number;
  private monthlyYearRates!: { [key: number]: number };

  constructor(clientData: ClientData, constants: Constants) {
    this.clientData = clientData;
    this.constants = constants;
    this.prepareCalculationParameters();
  }

  private prepareCalculationParameters(): void {
    // Calculate client age
    const today = new Date();
    const birthday = new Date(this.clientData.birthday);
    this.clientAge = today.getFullYear() - birthday.getFullYear() - 
      ((today.getMonth() < birthday.getMonth() || 
        (today.getMonth() === birthday.getMonth() && today.getDate() < birthday.getDate())) ? 1 : 0) + 1;

    this.premium = this.clientData.premium;
    this.firstTermYears = this.clientData.first_term;
    this.secondTermYears = this.clientData.second_term;
    this.durationMonths = (MAXIMUM_AGE - this.clientAge + 1) * MONTHS_PER_YEAR;

    // Convert annual rates to monthly rates
    this.monthlyMgir = this.annualToMonthlyRate(this.constants.mgir);
    this.monthlyYearRates = {};
    Object.keys(this.constants.year_rates).forEach(key => {
      this.monthlyYearRates[parseInt(key)] = this.annualToMonthlyRate(this.constants.year_rates[parseInt(key)]);
    });
  }

  private annualToMonthlyRate(annualRate: number): number {
    return Math.pow(1 + annualRate, 1 / MONTHS_PER_YEAR) - 1;
  }

  public calculate(): any {
    try {
      console.log('Starting MYGA calculation with data:', {
        clientAge: this.clientAge,
        premium: this.premium,
        firstTermYears: this.firstTermYears,
        secondTermYears: this.secondTermYears
      });
  
      const ages: number[] = [];
      const years: number[] = [];
      const premiums: string[] = [];
      const creditedInterest: string[] = [];
      const withdrawals: string[] = [];
      const accumulationValues: string[] = [];
      const surrenderValues: string[] = [];
      const deathBenefits: string[] = [];
  
      let currentAccountValue = this.premium;
      let currentAge = this.clientAge;
      let currentYear = 1;
      let yearlyInterest = 0;
      let yearlyWithdrawals = 0;
  
      for (let month = 0; month < this.durationMonths; month++) {
        if (month % MONTHS_PER_YEAR === 0 && month > 0) {
          currentYear++;
          currentAge++;
          yearlyInterest = 0;
          yearlyWithdrawals = 0;
        }
  
        // Calculate interest rate for current period
        let interestRate = this.monthlyMgir;
        if (currentYear <= this.firstTermYears && this.monthlyYearRates[currentYear]) {
          interestRate = this.monthlyYearRates[currentYear];
        }
  
        // Apply interest
        const monthlyInterest = currentAccountValue * interestRate;
        currentAccountValue += monthlyInterest;
        yearlyInterest += monthlyInterest;
  
        // Handle withdrawals
        let monthlyWithdrawal = 0;
        if (this.clientData.withdrawal_type !== 'none' && 
            currentYear >= this.clientData.withdrawal_from_year && 
            currentYear <= this.clientData.withdrawal_to_year) {
          if (month % (MONTHS_PER_YEAR / this.clientData.frequency) === 0) {
            monthlyWithdrawal = this.clientData.withdrawal_amount / this.clientData.frequency;
            currentAccountValue -= monthlyWithdrawal;
            yearlyWithdrawals += monthlyWithdrawal;
          }
        }
  
        // Calculate free withdrawal remaining for this month
        const freeWdRate = this.constants.free_wd[currentYear] || 0;
        const monthlyFreeWd = freeWdRate / MONTHS_PER_YEAR;
        let freeWdRemaining = 0;
        
        if (currentYear > 1) {
          // Free withdrawal is based on previous year's account value
          const prevYearAccountValue = month >= MONTHS_PER_YEAR ? 
            parseFloat(accumulationValues[accumulationValues.length - 1]) : this.premium;
          freeWdRemaining = Math.max(0, monthlyFreeWd * prevYearAccountValue);
        }

        // Calculate surrender value (only charge on non-free portion)
        const surrenderCharge = this.constants.surrender_charges[currentYear] || 0;
        const nonFreeAmount = Math.max(0, currentAccountValue - freeWdRemaining);
        const surrenderChargeAmount = nonFreeAmount * surrenderCharge;
        const surrenderValue = currentAccountValue - surrenderChargeAmount;
  
        // Store yearly data (only at year end)
        if (month % MONTHS_PER_YEAR === MONTHS_PER_YEAR - 1 || month === this.durationMonths - 1) {
          ages.push(currentAge);
          years.push(currentYear);
          premiums.push(month === MONTHS_PER_YEAR - 1 ? this.premium.toFixed(2) : '0.00');
          creditedInterest.push(yearlyInterest.toFixed(2));
          withdrawals.push(yearlyWithdrawals.toFixed(2));
          accumulationValues.push(currentAccountValue.toFixed(2));
          surrenderValues.push(surrenderValue.toFixed(2));
          deathBenefits.push(currentAccountValue.toFixed(2));
        }
      }
  
      const result = {
        data: ages.map((age, index) => [
          age,                           // [0] Age
          years[index],                  // [1] Year
          premiums[index],               // [2] Initial Premium
          withdrawals[index],            // [3] Withdrawals (Guaranteed)
          accumulationValues[index],     // [4] Accumulation Value (Guaranteed)
          surrenderValues[index],        // [5] Surrender Value (Guaranteed)
          withdrawals[index],            // [6] Withdrawals (Non-Guaranteed)
          accumulationValues[index],     // [7] Accumulation Value (Non-Guaranteed)
          surrenderValues[index]         // [8] Surrender Value (Non-Guaranteed)
        ]),
        durations: Math.floor(this.durationMonths / MONTHS_PER_YEAR),
        account_values: accumulationValues,
        accumulation_value_at_maturity: [accumulationValues[accumulationValues.length - 1]],
        complete_surrender_values: surrenderValues,
        mgir: (this.constants.mgir * 100).toFixed(2) + '%',
        term_1_rate: (this.constants.mgir * 100).toFixed(2) + '%',
        term_1_surrender_rates: Object.keys(this.constants.surrender_charges)
          .slice(0, this.firstTermYears)
          .map(year => (this.constants.surrender_charges[parseInt(year)] * 100).toFixed(2) + '%'),
        age: this.clientAge
      };
  
      console.log('MYGA calculation completed successfully:', {
        dataRows: result.data.length,
        duration: result.durations,
        clientAge: result.age
      });
  
      return result;
    } catch (error) {
      console.error('Error in MYGA calculation:', error);
      throw new Error(`MYGA calculation failed: `);
    }
  }
}

// Default constants for MYGA calculations
const DEFAULT_CONSTANTS: Constants = {
  mgir: 0.045, // 4.5%
  free_total_wd: 0.10, // 10%
  surrender_charges: {
    1: 0.08, 2: 0.07, 3: 0.06, 4: 0.05, 5: 0.04,
    6: 0.03, 7: 0.02, 8: 0.01, 9: 0.00, 10: 0.00
  },
  free_wd: {
    1: 0.00, 2: 0.10, 3: 0.10, 4: 0.10, 5: 0.10,
    6: 0.10, 7: 0.10, 8: 0.10, 9: 0.10, 10: 0.10
  },
  year_rates: {
    1: 0.055, 2: 0.050, 3: 0.048, 4: 0.046, 5: 0.045
  }
};

export { MygaCalculationService, DEFAULT_CONSTANTS };
export type { ClientData, Constants };