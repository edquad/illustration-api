import fs from "fs";
import path from "path";
import connection from "../configs/snowflake.js";
import statesSQL from "../models/states-SQL.json" assert { type: "json" };


export interface AnnuityFactorResult {
  monthly_factor_per_1000: string;
  guaranteed_monthly_annuity_income: string;
  current_monthly_annuity_income: string;
}

export interface ClientData {
  birthday: string; // ISO date string
  premium: number;
  first_term: number;
  second_term: number;
  withdrawal_type: "none" | "percentage";
  withdrawal_amount: number;
  withdrawal_from_year: number;
  withdrawal_to_year: number;
}

export interface Constants {
  mgir: number;
  free_wd: number;
  surrender_charges: Record<string, number>;
  year_rates: Record<string, number>;
}

export interface IllustrationCalcResult {
  data: Array<
    [number, number, string, string, string, string, string, string, string]
  >;
  durations: number;
  account_values: string[];
  accumulation_value_at_maturity: [string, string];
  complete_surrender_values: string[];
  mgir: string;
  term_1_rate: string;
  term_1_surrender_rates: string[];
  age: number;
}

export async function calculateAnnuityFactor(
  account_values: [string, string],
  annuitization_rate: number,
  gender: "Male" | "Female",
  certain_year = 10,
  maturity_age = 100,
  p0: unknown
): Promise<AnnuityFactorResult> {
  // Load the mortality table CSV
  const csvPath = path.join(__dirname, "./mortality_2013.csv");
  console.log("csvPath", csvPath);
  console.log("annuitization_rate", annuitization_rate);
  console.log("certain_year", certain_year);
  console.log("maturity_age", maturity_age);
  const csvData = fs.readFileSync(csvPath, "utf-8");
  const lines = csvData.trim().split("\n");
  const headers = lines[0].split(",");

  // Normalize headers for case-insensitive matching
  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());
  const genderIdx = normalizedHeaders.indexOf(gender.toLowerCase());

  if (genderIdx === -1) {
    throw new Error(
      `Gender column '${gender}' not found in CSV headers: ${headers.join(
        ", "
      )}`
    );
  }

  // Filter for rows where age >= maturity_age and get the mortality column
  const mortality: number[] = lines
    .slice(1)
    .map((line) => line.split(","))
    .filter((cols) => parseInt(cols[0], 10) >= maturity_age)
    .map((cols) => parseFloat(cols[genderIdx]));

  // Set mortality to 0 for certain_year period
  for (let i = 0; i < Math.min(certain_year, mortality.length); i++) {
    mortality[i] = 0;
  }

  const length = mortality.length;
  const q = 1 / (1 + annuitization_rate);
  const discount = Array.from({ length }, (_, i) => Math.pow(q, i));

  // Survivorship: cumulative product of (1 - mortality)
  const survivorship: number[] = [];
  let prod = 1;
  for (let i = 0; i < length; i++) {
    prod *= 1 - mortality[i];
    survivorship.push(prod);
  }

  // Present value of annuity factor
  const pv = discount.reduce((sum, d, i) => sum + d * survivorship[i], 0);
  const monthly_factor_per_1000 = 1000 / pv / 12;

  const guaranteed_monthly_annuity_income =
    (parseFloat(account_values[0].replace(/,/g, "")) / 1000) *
    monthly_factor_per_1000;
  const current_monthly_annuity_income =
    (parseFloat(account_values[1].replace(/,/g, "")) / 1000) *
    monthly_factor_per_1000;
  console.log(
    "onthly_facto",
    monthly_factor_per_1000.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
  return {
    monthly_factor_per_1000: monthly_factor_per_1000.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    guaranteed_monthly_annuity_income:
      guaranteed_monthly_annuity_income.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    current_monthly_annuity_income:
      current_monthly_annuity_income.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
  };
}

export function calculateIllustrationCalc(
  client_data: ClientData,
  constants: Constants,
  p0: unknown
): IllustrationCalcResult {
  // Calculate the age of the client
  const today = new Date();
  const birthday = new Date(client_data.birthday);
  let age = today.getFullYear() - birthday.getFullYear();
  if (
    today.getMonth() < birthday.getMonth() ||
    (today.getMonth() === birthday.getMonth() &&
      today.getDate() < birthday.getDate())
  ) {
    age--;
  }
  age += 1; // Adding 1 because we start at year 1

  // Unpack client data
  const premium = client_data.premium;
  const first_term = client_data.first_term;
  const second_term = client_data.second_term;
  const withdrawal_type = client_data.withdrawal_type;
  const withdrawal_amount = client_data.withdrawal_amount;
  const withdrawal_from_year = client_data.withdrawal_from_year - 1; // zero-based
  const withdrawal_to_year = client_data.withdrawal_to_year - 1; // zero-based

  // Set the duration for the calculation so that it ends at age 100
  const duration = 100 - age + 1;

  // Unpack constants
  const mgir = constants.mgir;
  const free_wd = constants.free_wd;
  const surrender_charges = constants.surrender_charges;
  const year_rates = constants.year_rates;

  // Get the free remaining withdrawal percentage
  let free_remaining_wd = 0.0;
  if (withdrawal_type === "percentage") {
    free_remaining_wd = free_wd - withdrawal_amount / 100;
  }

  // Create the guaranteed and non-guaranteed rates lists for each year
  const guaranteed_rates = [
    ...Array(first_term).fill(year_rates[String(first_term)]),
    ...Array(second_term).fill(year_rates[String(second_term)]),
    ...Array(duration - first_term - second_term).fill(mgir),
  ];
  const non_guaranteed_rates = [...guaranteed_rates];

  // Create the surrender charge list for each year
  const surrender_rate = [
    ...Array.from(
      { length: first_term },
      (_, i) => surrender_charges[String(i + 1)]
    ),
    ...Array.from(
      { length: second_term },
      (_, i) => surrender_charges[String(i + 1)]
    ),
    ...Array(duration - first_term - second_term).fill(0),
  ];

  // Preallocate lists for results
  const year = Array.from({ length: duration }, (_, i) => i + 1);
  const ages = year.map((y) => age + y - 1);
  const premiums = Array(duration).fill(0);
  const guaranteed_withdrawals = Array(duration).fill(0);
  const non_guaranteed_withdrawals = Array(duration).fill(0);
  const guaranteed_account_values = Array(duration).fill(0);
  const guaranteed_surrender_values = Array(duration).fill(0);
  const non_guaranteed_account_values = Array(duration).fill(0);
  const non_guaranteed_surrender_values = Array(duration).fill(0);

  // Set initial premium and calculate first year's values
  premiums[0] = premium;
  guaranteed_withdrawals[0] = 0;
  guaranteed_account_values[0] = premium * (1 + guaranteed_rates[0]);
  guaranteed_surrender_values[0] =
    guaranteed_account_values[0] -
    guaranteed_account_values[0] * surrender_rate[0];
  non_guaranteed_withdrawals[0] = 0;
  non_guaranteed_account_values[0] = premium * (1 + non_guaranteed_rates[0]);
  non_guaranteed_surrender_values[0] =
    non_guaranteed_account_values[0] -
    non_guaranteed_account_values[0] * surrender_rate[0];

  // Process subsequent years
  for (let i = 1; i < duration; i++) {
    // Calculate withdrawal when within the withdrawal period
    if (i >= withdrawal_from_year && i <= withdrawal_to_year) {
      guaranteed_withdrawals[i] =
        guaranteed_account_values[i - 1] * free_remaining_wd;
      non_guaranteed_withdrawals[i] =
        non_guaranteed_account_values[i - 1] * free_remaining_wd;
    }
    guaranteed_account_values[i] =
      (guaranteed_account_values[i - 1] - guaranteed_withdrawals[i]) *
      (1 + guaranteed_rates[i]);
    let cur_account_value = guaranteed_account_values[i];
    guaranteed_surrender_values[i] =
      cur_account_value -
      (cur_account_value -
        free_remaining_wd * guaranteed_account_values[i - 1]) *
        surrender_rate[i];

    non_guaranteed_account_values[i] =
      (non_guaranteed_account_values[i - 1] - non_guaranteed_withdrawals[i]) *
      (1 + non_guaranteed_rates[i]);
    cur_account_value = non_guaranteed_account_values[i];
    non_guaranteed_surrender_values[i] =
      cur_account_value -
      (cur_account_value -
        free_remaining_wd * non_guaranteed_account_values[i - 1]) *
        surrender_rate[i];
  }

  // Get unformatted account values
  const unformatted_guaranteed_account_values = guaranteed_account_values.map(
    (av) => av.toFixed(2)
  );

  // Round the needed values to 2 decimal places and format with commas
  const format = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const premiumsFmt = premiums.map(format);
  const guaranteed_withdrawalsFmt = guaranteed_withdrawals.map(format);
  const non_guaranteed_withdrawalsFmt = non_guaranteed_withdrawals.map(format);
  const guaranteed_account_valuesFmt = guaranteed_account_values.map(format);
  const guaranteed_surrender_valuesFmt =
    guaranteed_surrender_values.map(format);
  const non_guaranteed_account_valuesFmt =
    non_guaranteed_account_values.map(format);
  const non_guaranteed_surrender_valuesFmt =
    non_guaranteed_surrender_values.map(format);

  // Prepare a list of surrender values from year 0 for the svg
  const year_0_surrender_value = premium * (1 - surrender_rate[0]);
  const complete_surrender_values = [
    year_0_surrender_value.toFixed(2),
    ...non_guaranteed_surrender_valuesFmt,
  ];

  // Prepare for the pdf a list of the surrender rates for the first term as percentage
  const term_1_surrender_rates = Array.from(
    { length: first_term },
    (_, i) => `${(surrender_charges[String(i + 1)] * 100).toFixed(2)}%`
  );

  // Prepare data rows
  const data = ages.map(
    (a, i) =>
      [
        a,
        year[i],
        premiumsFmt[i],
        guaranteed_withdrawalsFmt[i],
        guaranteed_account_valuesFmt[i],
        guaranteed_surrender_valuesFmt[i],
        non_guaranteed_withdrawalsFmt[i],
        non_guaranteed_account_valuesFmt[i],
        non_guaranteed_surrender_valuesFmt[i],
      ] as [
        number,
        number,
        string,
        string,
        string,
        string,
        string,
        string,
        string
      ]
  );

  return {
    data,
    durations: duration,
    account_values: unformatted_guaranteed_account_values,
    accumulation_value_at_maturity: [
      guaranteed_account_valuesFmt[guaranteed_account_valuesFmt.length - 1],
      non_guaranteed_account_valuesFmt[
        non_guaranteed_account_valuesFmt.length - 1
      ],
    ],
    complete_surrender_values,
    mgir: (mgir * 100).toFixed(2),
    term_1_rate: (year_rates[String(first_term)] * 100).toFixed(2),
    term_1_surrender_rates,
    age,
  };
}

function calcMvaFactor(
  base_rate: number,
  shock: number,
  term_1: number,
  term = 10
): [number[], number[]] {
  const indices = Array.from({ length: term + 1 }, (_, i) => i);
  const exponents = indices.map((i) => Math.max(term_1 - i, 0));
  const decreased = exponents.map((e) =>
    Math.pow((1 + base_rate) / (1 + base_rate - shock), e)
  );
  const increased = exponents.map((e) =>
    Math.pow((1 + base_rate) / (1 + base_rate + shock), e)
  );
  return [decreased, increased];
}

export function generateSvgPlot(
  current_surrender_values: string[],
  term_1: number,
  term = 10
): string {
  // Parse surrender values
  const base_surrender_values = current_surrender_values
    .slice(0, term + 1)
    .map((v) => parseFloat(v.replace(/,/g, "")));
  const [decreased_factors, increased_factors] = calcMvaFactor(
    0.0483,
    0.01,
    term_1,
    term
  );
  const decreased_surrender_values = base_surrender_values.map(
    (v, i) => v * decreased_factors[i]
  );
  const increased_surrender_values = base_surrender_values.map(
    (v, i) => v * increased_factors[i]
  );
  const year = Array.from({ length: term + 1 }, (_, i) => i);

  // SVG dimensions
  const width = 750;
  const height = 400;
  const padding = 60;

  // Find y min/max for scaling
  const allY = [
    ...decreased_surrender_values,
    ...base_surrender_values,
    ...increased_surrender_values,
  ];
  const yMin = Math.min(...allY);
  const yMax = Math.max(...allY);

  // Scale functions
  const xScale = (i: number) => padding + (i / term) * (width - 2 * padding);
  const yScale = (v: number) =>
    height - padding - ((v - yMin) / (yMax - yMin)) * (height - 2 * padding);

  // Polyline points
  function points(arr: number[]) {
    return arr.map((v, i) => `${xScale(i)},${yScale(v)}`).join(" ");
  }

  // SVG string
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <g>
    <polyline fill="none" stroke="#e74c3c" stroke-width="2" points="${points(
      decreased_surrender_values
    )}" />
    <polyline fill="none" stroke="#3498db" stroke-width="2" points="${points(
      base_surrender_values
    )}" />
    <polyline fill="none" stroke="#27ae60" stroke-width="2" points="${points(
      increased_surrender_values
    )}" />
    <!-- Markers -->
    ${decreased_surrender_values
      .map(
        (v, i) =>
          `<circle cx="${xScale(i)}" cy="${yScale(v)}" r="4" fill="#e74c3c" />`
      )
      .join("")}
    ${base_surrender_values
      .map(
        (v, i) =>
          `<circle cx="${xScale(i)}" cy="${yScale(v)}" r="4" fill="#3498db" />`
      )
      .join("")}
    ${increased_surrender_values
      .map(
        (v, i) =>
          `<circle cx="${xScale(i)}" cy="${yScale(v)}" r="4" fill="#27ae60" />`
      )
      .join("")}
    <!-- X axis -->
    <line x1="${padding}" y1="${height - padding}" x2="${
    width - padding
  }" y2="${height - padding}" stroke="#333" />
    <!-- Y axis -->
    <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${
    height - padding
  }" stroke="#333" />
    <!-- X labels -->
    ${year
      .map(
        (i) =>
          `<text x="${xScale(i)}" y="${
            height - padding + 20
          }" font-size="14" text-anchor="middle">${i}</text>`
      )
      .join("")}
    <!-- Y labels -->
    ${[0, 0.25, 0.5, 0.75, 1]
      .map((f) => {
        const v = yMin + f * (yMax - yMin);
        return `<text x="${padding - 10}" y="${
          yScale(v) + 5
        }" font-size="14" text-anchor="end">${v.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}</text>`;
      })
      .join("")}
    <!-- Title -->
    <text x="${width / 2}" y="35" font-size="24" text-anchor="middle">MVA</text>
    <!-- Legend -->
    <rect x="${
      width - 200
    }" y="${padding}" width="12" height="12" fill="#e74c3c" /><text x="${
    width - 180
  }" y="${padding + 12}" font-size="14">Decreased</text>
    <rect x="${width - 200}" y="${
    padding + 20
  }" width="12" height="12" fill="#3498db" /><text x="${width - 180}" y="${
    padding + 32
  }" font-size="14">Base</text>
    <rect x="${width - 200}" y="${
    padding + 40
  }" width="12" height="12" fill="#27ae60" /><text x="${width - 180}" y="${
    padding + 52
  }" font-size="14">Increased</text>
  </g>
</svg>`;
}

// States interface
export interface State {
  state_code: string;
  state_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// States service functions
export async function getAllStates(): Promise<State[]> {
  return new Promise((resolve, reject) => {
    connection.use(async (clientConnection: any) => {
      clientConnection.execute({
        sqlText: statesSQL.getAllStates,
        binds: [],
        complete: (err: Error | null, stmt: any, rows: any[]) => {
          if (err) {
            console.error("Error in getAllStates:", err);
            reject(err);
          } else {
            console.log("Resolving with rows:", rows);
            resolve(rows || []);
          }
        },
      });
    });
  });
}

class IllustrationService {
  // ... existing methods ...

  // NEW: Compute illustration for client (matches Python calculate_illustration_calc)
  async computeIllustrationForClient(clientData: any): Promise<any> {
    try {
      // Mock constants (you'll need to implement actual constants management)
      const constants = {
        mgir: 0.03, // 3% minimum guaranteed interest rate
        free_wd: 0.1, // 10% free withdrawal
        surrender_charges: [
          0.09, 0.08, 0.07, 0.06, 0.05, 0.04, 0.03, 0.02, 0.01, 0.0,
        ],
        year_rates: [0.045, 0.04, 0.035], // Sample rates
      };

      // This is where you'll implement your Python calculation logic
      // For now, returning mock data in the exact same format as Python
      const mockCalculationResult = {
        data: [
          [
            65,
            1,
            "$100,000",
            "$0",
            "$103,000",
            "$93,700",
            "$0",
            "$104,500",
            "$95,050",
          ],
          [
            66,
            2,
            "$0",
            "$0",
            "$106,090",
            "$97,481",
            "$0",
            "$109,202",
            "$100,282",
          ],
          // ... more years of data
        ],
        durations: clientData.first_term * 12 + clientData.second_term * 12,
        account_values: ["103000", "106090", "109273"],
        accumulation_value_at_maturity: ["150000", "160000"],
        complete_surrender_values: ["93700", "97481", "101355"],
        mgir: "3.00%",
        term_1_rate: "4.50%",
        term_1_surrender_rates: ["9.00%", "8.00%", "7.00%"],
        age: this.calculateAge(clientData.birthday),
      };

      return mockCalculationResult;
    } catch (error) {
      console.error("Error computing illustration for client:", error);
      throw new Error(`Calculation failed: `);
    }
  }

  private calculateAge(birthday: string): number {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}

export default new IllustrationService();