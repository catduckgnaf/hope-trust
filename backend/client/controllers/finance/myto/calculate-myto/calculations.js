const number_of_iterations = 2000;
const step_size = 125000;
const confidence_standard_deviation = 1.33;
const default_annual_management_percentage = 1.5;
const default_portfolio_risk_management_percentage = 33;
const max_years_of_life = 100;
const tracker_place = 10;

const calc = () => {
  const alpha = Math.random();
  const beta = Math.random();
  return [
    Math.sqrt(-2 * Math.log(alpha)) * Math.sin(2 * Math.PI * beta),
    Math.sqrt(-2 * Math.log(alpha)) * Math.cos(2 * Math.PI * beta)
  ];
};

// Calculate a Muller Transform
const randByBoxMullerTransform = () => {
  let vals = calc();
  return vals[1];
};

// Produce random normal number from mean and standard deviation
const gaussianRandom = (mean, std) => {
  if (mean === "undefined" || std === "undefined") return "Gaussian random needs 2 arguments (mean, standard deviation)";
  return randByBoxMullerTransform() * std + mean;
};


// Calculate the Average of an Array
const average = (data) => {
  let sum = data.reduce((sum, value) => sum + value, 0);
  let avg = sum / data.length;
  return avg;
};

// Calculate the Standard Deviation of an Array
const stDev = (values) => {
  let avg = average(values);
  let squareDiffs = values.map((value) => {
    let diff = value - avg;
    let sqrDiff = diff * diff;
    return sqrDiff;
  });
  let avgSquareDiff = average(squareDiffs);
  let stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
};

// Format Large Numbers
const readableNum = (x) => {
  for (let i = 0; i <= 3; i++) {
    x = Math.round(x / 10000) * 10000;
    return x.toLocaleString();
  }
};

const concierge_levels = {
  1: 250,
  2: 650,
  3: 1000
};

// Retrieve the value of all checked radios - Level of con?
const retrieveInput = (config) => {
  let {
    beneficiary_age,
    income_items,
    budget_items,
    grantor_asset_items,
    benefit_items,
    concierge_services,
    annual_management_costs = default_annual_management_percentage,
    portfolio_risk_weighting = default_portfolio_risk_management_percentage,
    desired_life_of_fund
  } = config;
  let cons = [
    { value: 0.2, active: false, level: "Low" },
    { value: 0.28, active: true, level: "Medium" },
    { value: 0.35, active: false, level: "High" }
  ];
  let conservativity = cons.find((con) => con.active);
  let total_benefits_value = benefit_items.reduce((a, b) => a + b.value, 0); // monthly
  let total_grantor_assets_value = grantor_asset_items.reduce((a, b) => a + b.trust_assets, 0); // monthly
  let total_expense_value = budget_items.reduce((a, b) => a + b.value, 0); // monthly

  // parse out input parameters as numerical values
  let initial_principle = 0; // can be added to a variable
  let income = income_items.map((item) => {
    return [item.monthly_income, item.term[0], item.term[1], (item.inflation || false)];
  });
  let budget = budget_items.map((item) => {
    return [-item.value, item.term[0], item.term[1], (item.inflation || false)];
  });
  let benefit = benefit_items.map((item) => {
    return [item.value, item.term[0], item.term[1], true];
  });

  if (concierge_services) { // if concierge services is active, add concierge services into total expense draw, AND push into age based income as a new expense record.
    total_expense_value += concierge_levels[concierge_services];
    budget.push(
      [-(concierge_levels[concierge_services]), beneficiary_age, (desired_life_of_fund + beneficiary_age), true] // [negative value of expense, start age, end age, inflated (boolean)]
    );
  }

  let age_based_income_no_benefit = [...income, ...budget];
  let age_based_income = [...income, ...budget, ...benefit];

  return [
    total_expense_value, // initial yearly allowance with optional a $1,000 buffer
    beneficiary_age, // current age of beneficiary
    (annual_management_costs / 100), // annual management percentage divided by 100
    (portfolio_risk_weighting / 100), // risk weighting divided by 100
    conservativity.value, // probability of having a bad year in the stock market
    initial_principle, // initial principal
    (desired_life_of_fund || (100 - beneficiary_age)), // desired lifetime of fund
    total_benefits_value, // total other income, including social security benefits (monthly, it seems)
    total_grantor_assets_value, // current assets owned
    /*
     * Note from Tomislav: need to add something to this returned object which is an array of 4-tuples, i.e.
     * [income/expense, start age, end age, inflation-adjusted?]; this value would then get passed on to the calculator
     * functions below and would potentially replace the "total_benefits_value" just above; I have placed a
     * placeholder called "age_based_income_cost" here
     */
    age_based_income,
    age_based_income_no_benefit
  ];
};

// Calculate fund lifetime statistics with initial principal known
// Section 3 - Simulation of Fundable Years Distribution
const calculate_lifetime_stats = (draw, age, mgmt, risk, conservativity, initial_principle, age_based_income_and_costs) => {
  let sRets = 0.1209;
  let sSD = 0.1976;
  let bRets = 0.0808;
  let bSD = 0.0856;
  let infMean = 0.0372;
  let infSD = 0.0278;
  // ^^^ Section 5 - Model and Parameter Estimation

  // initialize timing and result collection utilities
  let tracker = [0];

  // simulate 1250 iterations of calculating fund lifetime
  for (let j = 0; j < number_of_iterations; j++) {
    let totalCounter = 0;
    let curValue = initial_principle;
    let ageBased = age_based_income_and_costs.map((inner) => inner.slice());
    let drawCont = draw;

    // loop for up to 100 iterations (years of life) but break if fund value goes to 0 or below
    do {

      // draw a stock market return value and inflation value from normal distributions
      let stockReturnValue = gaussianRandom(sRets, sSD);
      let bondReturnValue = gaussianRandom(bRets, bSD);
      let inflation = gaussianRandom(infMean, infSD);

      // update fund value with stock market and bond returns
      // Section 4 - Annual Portfolio Value Change Calculation
      curValue = curValue * (1 + risk * stockReturnValue + (1 - risk) * bondReturnValue - mgmt);
      // reflect money withdrawal
      curValue = curValue - drawCont;
      // iterate through age based income and cost and update portfolio value based on those
      // also update incomes and costs based on inflation
      for (let k = 0; k < ageBased.length; k++) {
        const age_based_item = ageBased[k];
        if ((age + totalCounter) >= age_based_item[1] && (age + totalCounter) <= age_based_item[2]) curValue += (age_based_item[0] * 12);
        if (age_based_item[3]) age_based_item[0] = (1 + inflation) * age_based_item[0];  // check if not inflation-adjusted, and modify if not adjusted
      }

      // update next withdrawal to adjust for inflation
      drawCont = drawCont * (1 + inflation);
      totalCounter++;
      // add latest result to result tracker array
    } while (curValue >= 0 && totalCounter <= max_years_of_life);
    tracker[j] = totalCounter;
  }

  // calculate and return statistics for all 1250 above-performed trials
  let mean = Math.round(average(tracker) * 10) / 10;
  let standardDev = Math.round(stDev(tracker) * 100) / 100;
  tracker.sort((a, b) => a - b);
  let min = tracker[tracker_place]; // Configurable percentile - Section 2 - Estimating Required Portfolio Size
  let max = tracker[tracker.length - 1];
  return [mean, standardDev, min, max]; // mean, standard deviation, 5th percentile and maximum number of years
};

const calculate_needed_principal = (draw, age, mgmt, risk, conservativity, ageBased, desire) => {
  let minNecPrin = null;
  let riskMinPrin = null;
  let test = 0; //
  let currPrin = 0;
  let increment_amount = Math.max((draw * 12) / 2, step_size);
  while (true) {
    let hyp = calculate_lifetime_stats(
      0,
      age,
      mgmt,
      risk,
      conservativity,
      currPrin,
      ageBased
    );
    if (minNecPrin === null) {
      test = parseInt(hyp[0], 10) - confidence_standard_deviation * parseInt(hyp[1], 10);
      if (test >= desire) minNecPrin = currPrin; // Section 2:1 - Estimating Required Portfolio Size
    }
    if (riskMinPrin === null) {
      if (hyp[2] >= desire) riskMinPrin = currPrin; // Section 2:2 - Estimating Required Portfolio Size
    }
    if (minNecPrin !== null && riskMinPrin !== null) break;
    currPrin += increment_amount;
  }

  return [readableNum(minNecPrin), readableNum(riskMinPrin)]; //
};

const calculate_myto = (config) => {
  let results = {};
  results.without_benefits = {};
  let values = retrieveInput(config);

  let draw = values[0]; // initial yearly allowance with a $12,000 buffer
  let age = values[1]; // current age of beneficiary
  let mgmt = values[2]; // annual management percentage divided by 100
  let risk = values[3]; // risk weighting divided by 100
  let conservativity = values[4]; // probability of having a bad year in the stock market
  let initial_principle = values[5]; // initial principal
  let desired_life_of_fund = values[6]; // desired lifetime of fund
  let total_benefits_value = values[7]; // total other income, including social security benefits (monthly, it seems)
  let current_assets = values[8]; // current assets owned
  let age_based_income_and_costs = values[9]; // age-based incomes and costs
  let age_based_income_and_cost_negative = values[10]; // age-based incomes and costs

  // ^^^ Section 1 - Simulation Inputs

  // calculate required principal based on provided input values
  let draw_with_benefits = (draw - total_benefits_value);
  let hold = calculate_needed_principal(draw_with_benefits, age, mgmt, risk, conservativity, age_based_income_and_costs, desired_life_of_fund);

  // compute result statistics
  let total = parseInt(hold[0].replace(/[^0-9.]/g, ""), 10) + parseInt(hold[1].replace(/[^0-9.]/g, ""), 10);
  let final_average = total / 2;
  let assets_needed = final_average - current_assets;
  let current_available_assets = Math.floor(current_assets / config.children_total);
  let trust_funding_gap = final_average - current_available_assets;

  results.myto_config = {
    age,
    children_total: config.children_total,
    mgmt: config.annual_management_costs,
    risk: config.portfolio_risk_weighting,
    conservativity,
    desired_life_of_fund,
    total_benefits_value,
    total_available_assets: current_assets,
    initial_principle,
    current_available_assets
  };

  results.with_benefits = {
    draw_with_benefits,
    total,
    final_average,
    assets_needed,
    trust_funding_gap
  };

  // simplistic calculation of money needed if benefits were to disappear
  if (total_benefits_value > 0) {
    let draw_without_benefits = draw;
    let hold_without_benefits = calculate_needed_principal(
      draw_without_benefits,
      age,
      mgmt,
      risk,
      conservativity,
      age_based_income_and_cost_negative,
      desired_life_of_fund
    );
    let ntotal = parseInt(hold_without_benefits[0].replace(/[^0-9.]/g, ""), 10) + parseInt(hold_without_benefits[1].replace(/[^0-9.]/g, ""), 10);
    let nfinal_average = ntotal / 2;
    let nassets_needed = nfinal_average - current_assets;
    let trust_fund_gap_without_benefits = nfinal_average - current_available_assets;

    results.without_benefits = {
      draw_without_benefits,
      ntotal,
      nfinal_average,
      nassets_needed,
      trust_fund_gap_without_benefits
    };
  }
  return results;
};

module.exports = calculate_myto;