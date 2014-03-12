/**
 * @file Define the parameters for the activity's central function (as defined
 * in `model.js`.
 */
define({
  /**
   * This parameter is not configurable from the application UI, but it is
   * defined here for consistency with the other visualization parameters.
   */
  pointCount: {
    dflt: 11
  },
  autonomousTaxes: {
    label: 'Autonomous Taxes',
    dflt: 0,
    min: -200,
    max: 600,
    step: 100
  },
  rate: {
    label: 'Marginal Tax Rate',
    dflt: 0.2,
    min: 0,
    max: 1,
    step: 0.1
  },
  incChange: {
    label: 'Income Change',
    dflt: 1000,
    min: 500,
    max: 2000,
    step: 100
  }
});
