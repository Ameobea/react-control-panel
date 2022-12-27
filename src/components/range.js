import React, { useMemo, useCallback, useRef, useState } from 'react';
import { ClientStyle as Style } from 'react-css-component';
import isnumeric from 'is-numeric';
import { v4 as uuid } from 'uuid';

import { withSettingState } from './context';
import Value from './value';
import { EditableValue } from './EditableValue';
import getDynamicCss from './styles/range';
import { withErrorHandler, throwLogRangeError, validateStepParams } from '../error';
import {
  withScalerFunctions,
  numericOrDefault,
  numericOrDefaultElse,
  createNormalDisplayOptsGetter,
} from '../util';

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
  const id = useRef(uuid());
  const css = useMemo(() => getDynamicCss(theme, id.current), [theme]);
  validateStepParams(props.step, steps);
  const [isEditing, setIsEditing] = useState(null);

  const { min, max, step, logVal, sliderVal, scaleValue } = (
    scale === 'log' ? getLogDisplayOpts : getNormalDisplayOpts
  )(props);
  // use `steps` if provided
  const processedStep = isnumeric(steps) ? (max - min) / steps : step;
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
      <Style css={css} />
      <input
        className={`control-panel-range-${id.current}`}
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
