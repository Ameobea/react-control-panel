import React, { useCallback, useState } from 'react';

import { withSettingState } from './context';
import Value from './value';
import { EditableValue } from './EditableValue';
import getDynamicCss from './styles/range';
import { withErrorHandler, throwLogRangeError, validateStepParams } from '../error';
import {
  isNumeric,
  withScalerFunctions,
  numericOrDefault,
  numericOrDefaultElse,
  createNormalDisplayOptsGetter,
} from '../util';

// Range styling depends only on two theme colors, so style nodes are injected once per distinct
// theme and shared by all instances rather than once per mounted component.
const injectedRangeThemes = new Map();
const getRangeClassName = theme => {
  const key = `${theme.background2}|${theme.foreground1}`;
  let className = injectedRangeThemes.get(key);
  if (!className) {
    className = `control-panel-range-${injectedRangeThemes.size}`;
    const styleTag = document.createElement('style');
    styleTag.textContent = getDynamicCss(theme, className);
    document.head.appendChild(styleTag);
    injectedRangeThemes.set(key, className);
  }
  return className;
};

const getLogDisplayOpts = withScalerFunctions(
  ({ min, max, value, scaleValue, scaleValueInverse }) => {
    // `value` is the logarithmic value that the user cares about.  We convert it into a value
    // from 1 to 100 in order to pass it to the slider.
    const sliderVal = scaleValueInverse(
      numericOrDefaultElse(value, () => scaleValue((min + max) / 2))
    );
    if (sliderVal * scaleValueInverse(max) < 0) {
      throwLogRangeError(sliderVal);
    }

    return { min: 0, max: 100, step: 1, logVal: value, sliderVal, scaleValue };
  }
);

const getNormalDisplayOpts = createNormalDisplayOptsGetter((min, max, value) =>
  numericOrDefault(value, (min + max) / 2)
);

export const InnerRange = ({ scale, steps, onChange, theme, ...props }) => {
  validateStepParams(props.step, steps);
  const [isEditing, setIsEditing] = useState(false);

  const { min, max, step, logVal, sliderVal, scaleValue } = (
    scale === 'log' ? getLogDisplayOpts : getNormalDisplayOpts
  )(props);
  // use `steps` if provided
  const processedStep = isNumeric(steps) ? (max - min) / steps : step;
  const handleChange = useCallback(
    e => {
      // We take the value from the slider (range 1 to 100) and scale it into its logarithmic
      // representation before passing it into the state.
      onChange(scaleValue(parseFloat(e.target.value)));
    },
    [scaleValue, onChange]
  );

  return (
    <>
      <input
        className={getRangeClassName(theme)}
        type='range'
        value={sliderVal}
        min={min}
        max={max}
        step={processedStep}
        onChange={handleChange}
      />
      {isEditing ? (
        <EditableValue
          initialValue={props.value}
          onSubmit={newValue => {
            const parsedValue = parseFloat(newValue);
            if (isNaN(parsedValue)) {
              setIsEditing(false);
              return;
            }

            onChange(parsedValue);
            setIsEditing(false);
          }}
          theme={theme}
          width='11%'
        />
      ) : (
        <Value text={logVal} width='11%' onDoubleClick={() => setIsEditing(true)} />
      )}
    </>
  );
};

export default withErrorHandler(withSettingState()(InnerRange));
