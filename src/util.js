import React from 'react';
import isnumeric from 'is-numeric';

import { validateLogStep, validateLogMinMax } from './error';

export const getLogScalerFunctions = (logmin, logmax, logsign) => ({
  scaleValue: x =>
    logsign * Math.exp(Math.log(logmin) + ((Math.log(logmax) - Math.log(logmin)) * x) / 100),
  scaleValueInverse: y =>
    ((Math.log(y * logsign) - Math.log(logmin)) * 100) / (Math.log(logmax) - Math.log(logmin)),
});

export const numericOrDefault = (val, defaultVal) => (isnumeric(val) ? val : defaultVal);
// lazy version
export const numericOrDefaultElse = (val, getDefaultVal) =>
  isnumeric(val) ? val : getDefaultVal();

export const createNormalDisplayOptsGetter =
  transformVal =>
  ({ min, max, step, value }) => {
    const newMin = numericOrDefault(min, 0);
    const newMax = numericOrDefault(max, 100);
    const transformedVal = transformVal(newMin, newMax, value);

    return {
      min: newMin,
      max: newMax,
      step: numericOrDefault(step, (max - min) / 100),
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

/**
 * Since apparently 15% of users worldwide don't have a browser that supports `Proxy`, we create
 * a partial polyfill that fits our needs.
 */
export const createPolyProxy = (target, handler, setState) => {
  if (typeof Proxy === 'function') {
    return new Proxy(target, handler);
  }

  const proxy = {};
  const props = Object.entries(target).reduce((acc, [key, val]) => {
    if (key in acc) {
      return acc;
    }

    return {
      ...acc,
      [key]: {
        enumerable: !!Object.getOwnPropertyDescriptor(target, key).enumerable,
        get: () => target[key],
        set: newVal => setState({ [key]: newVal }),
      },
    };
  }, {});
  Object.defineProperties(proxy, props);
  return proxy;
};

export const compose =
  (...functions) =>
  arg =>
    functions.reduceRight((acc, fun) => fun(acc), arg);

export const clamp = (x, min, max) => Math.min(Math.max(x, min), max);

/**
 * Taken from
 */
export function useMemoCompare(next, compare) {
  // Ref for storing previous value
  const previousRef = React.useRef();
  const previous = previousRef.current;
  // Pass previous and next value to compare function
  // to determine whether to consider them equal.
  const isEqual = compare(previous, next);
  // If not equal update previousRef to next value.
  // We only update if not equal so that this hook continues to return
  // the same old value if compare keeps returning true.
  React.useEffect(() => {
    if (!isEqual) {
      previousRef.current = next;
    }
  });
  // Finally, if equal then return the previous value
  return isEqual ? previous : next;
}
