import React from 'react';

import { validateLogStep, validateLogMinMax } from './error';

export const isNumeric = v => {
  if (typeof v === 'number') return !Number.isNaN(v);
  if (typeof v === 'string') return v.trim() !== '' && !Number.isNaN(Number(v));
  return false;
};

export const getLogScalerFunctions = (logmin, logmax, logsign) => ({
  scaleValue: x =>
    logsign * Math.exp(Math.log(logmin) + ((Math.log(logmax) - Math.log(logmin)) * x) / 100),
  scaleValueInverse: y =>
    ((Math.log(y * logsign) - Math.log(logmin)) * 100) / (Math.log(logmax) - Math.log(logmin)),
});

export const numericOrDefault = (val, defaultVal) => (isNumeric(val) ? val : defaultVal);
// lazy version
export const numericOrDefaultElse = (val, getDefaultVal) =>
  isNumeric(val) ? val : getDefaultVal();

export const createNormalDisplayOptsGetter =
  transformVal =>
  ({ min, max, step, value }) => {
    const newMin = numericOrDefault(min, 0);
    const newMax = numericOrDefault(max, 100);
    const transformedVal = transformVal(newMin, newMax, value);

    return {
      min: newMin,
      max: newMax,
      step: numericOrDefault(step, (newMax - newMin) / 100),
      sliderVal: transformedVal,
      logVal: transformedVal,
      scaleValue: x => x,
    };
  };

export const withScalerFunctions = logOptsGetter => args => {
  const { min, max, step } = args;
  validateLogMinMax(min, max);
  validateLogStep(step);

  const logsign = min > 0 ? 1 : -1;
  const logmin = Math.abs(min);
  const logmax = Math.abs(max);

  return logOptsGetter({ ...args, ...getLogScalerFunctions(logmin, logmax, logsign) });
};

export const compose =
  (...functions) =>
  arg =>
    functions.reduceRight((acc, fun) => fun(acc), arg);

export const clamp = (x, min, max) => Math.min(Math.max(x, min), max);

// Adapted from https://usehooks.com/useMemoCompare
export function useMemoCompare(next, compare) {
  const previousRef = React.useRef();
  const previous = previousRef.current;
  const isEqual = compare(previous, next);
  React.useEffect(() => {
    if (!isEqual) {
      previousRef.current = next;
    }
  });
  return isEqual ? previous : next;
}
