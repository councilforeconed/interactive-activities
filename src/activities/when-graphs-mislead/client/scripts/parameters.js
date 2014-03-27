/**
 * @file Define the parameters for the activity's chart.
 */
define({
  yLimitsUSD: {
    label: 'y-axis limits ($)',
    min: 0,
    max: 50000,
    step: 1000
  },
  yLimitsPct: {
    label: 'y-axis limits (% change)',
    min: 0,
    max: 1.2,
    step: 0.01
  },
  xLimits: {
    label: 'x-axis limits (year)',
    min: 1960,
    max: 2011,
    step: 1
  },
  yUnit: {
    label: 'y-axis unit',
    dflt: 'USD',
    values: {
      Pct: '% change in USD',
      USD: 'USD ($)'
    }
  }
});
