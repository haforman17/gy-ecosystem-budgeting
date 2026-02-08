/**
 * Generate forecast periods based on revenue streams and scenario assumptions
 */
export function generateForecastPeriods(revenueStreams, lineItems, assumptions, projectStartDate, years = 30) {
  const periods = [];
  const startYear = new Date(projectStartDate).getFullYear();

  // Base maintenance costs from line items
  const baseMaintenance = lineItems
    .filter((li) => li.category === "MAINTENANCE")
    .reduce((sum, li) => sum + (li.budget_amount || 0), 0);

  for (let year = 1; year <= years; year++) {
    const periodStart = `${startYear + year - 1}-01-01`;
    const periodEnd = `${startYear + year - 1}-12-31`;

    // Calculate revenue for this year
    let revenue = 0;
    let carbonCredits = 0;
    let bngHabitat = 0;
    let bngHedgerow = 0;
    let watercourse = 0;
    let nfm = 0;

    revenueStreams.forEach((rs) => {
      const genStartYear = new Date(rs.generation_start_date).getFullYear();
      const yearsFromStart = startYear + year - 1 - genStartYear;

      if (yearsFromStart >= 0) {
        const priceEscalation = Math.pow(1 + (assumptions.price_escalation_rate || 0.03), yearsFromStart);
        const volume = (rs.estimated_volume || 0) * (assumptions.establishment_success_rate || 0.95);
        const adjustedVolume = volume * Math.pow(1 - (assumptions.annual_mortality_rate || 0.01), yearsFromStart);

        let basePrice = rs.estimated_price_per_unit || 0;
        
        // Apply scenario price assumptions
        switch (rs.credit_type) {
          case "CARBON":
            basePrice = assumptions.carbon_price || basePrice;
            carbonCredits += adjustedVolume;
            break;
          case "BNG_HABITAT":
            basePrice = assumptions.bng_habitat_price || basePrice;
            bngHabitat += adjustedVolume;
            break;
          case "BNG_HEDGEROW":
            basePrice = assumptions.bng_hedgerow_price || basePrice;
            bngHedgerow += adjustedVolume;
            break;
          case "WATERCOURSE":
            basePrice = assumptions.watercourse_price || basePrice;
            watercourse += adjustedVolume;
            break;
          case "NFM":
            basePrice = assumptions.nfm_price || basePrice;
            nfm += adjustedVolume;
            break;
        }

        const adjustedPrice = basePrice * priceEscalation;
        revenue += adjustedVolume * adjustedPrice;
      }
    });

    // Calculate expenses for this year
    const isEstablishment = year <= 3;
    let expenses = 0;

    if (isEstablishment) {
      // Include establishment costs from line items
      expenses = lineItems
        .filter((li) => ["SITE_PREPARATION", "PLANTING", "FENCING", "SURVEYS", "EQUIPMENT"].includes(li.category))
        .reduce((sum, li) => sum + (li.budget_amount || 0), 0) / 3; // Spread over 3 years
    } else {
      // Ongoing maintenance with cost escalation
      const costEscalation = Math.pow(1 + (assumptions.maintenance_cost_increase || 0.02), year - 4);
      expenses = baseMaintenance * costEscalation;
    }

    // Add overhead
    const overhead = lineItems
      .filter((li) => li.category === "OVERHEAD")
      .reduce((sum, li) => sum + (li.budget_amount || 0), 0);
    expenses += overhead;

    periods.push({
      year,
      period_start: periodStart,
      period_end: periodEnd,
      projected_revenue: Math.round(revenue),
      projected_expenses: Math.round(expenses),
      projected_cash_flow: Math.round(revenue - expenses),
      carbon_credits_generated: Math.round(carbonCredits),
      bng_habitat_units_generated: Math.round(bngHabitat),
      bng_hedgerow_units_generated: Math.round(bngHedgerow),
      watercourse_units_generated: Math.round(watercourse),
      nfm_credits_generated: Math.round(nfm),
    });
  }

  return periods;
}

/**
 * Calculate NPV and IRR for a forecast
 */
export function calculateFinancialMetrics(forecastPeriods, discountRate = 0.05) {
  let npv = 0;
  const cashFlows = [0]; // Year 0 initial investment

  forecastPeriods.forEach((period, idx) => {
    const cf = period.projected_cash_flow || 0;
    cashFlows.push(cf);
    npv += cf / Math.pow(1 + discountRate, idx + 1);
  });

  // Simple IRR approximation using Newton's method
  let irr = 0.1; // Initial guess
  for (let i = 0; i < 20; i++) {
    let npvAtIrr = 0;
    let derivative = 0;
    
    cashFlows.forEach((cf, idx) => {
      if (idx === 0) return;
      npvAtIrr += cf / Math.pow(1 + irr, idx);
      derivative -= (idx * cf) / Math.pow(1 + irr, idx + 1);
    });
    
    if (Math.abs(npvAtIrr) < 0.01) break;
    irr = irr - npvAtIrr / derivative;
  }

  const paybackPeriod = (() => {
    let cumulative = 0;
    for (let i = 0; i < forecastPeriods.length; i++) {
      cumulative += forecastPeriods[i].projected_cash_flow || 0;
      if (cumulative >= 0) return i + 1;
    }
    return null;
  })();

  return {
    npv: Math.round(npv),
    irr: isFinite(irr) && irr > -1 && irr < 10 ? irr : null,
    paybackPeriod,
  };
}