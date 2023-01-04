import React from 'react';
import isnumeric from 'is-numeric';

import { withSettingState } from './context';
import { withErrorHandler, throwLogRangeError, validateStepParams } from '../error';
import {
  numericOrDefault,
  numericOrDefaultElse,
  createNormalDisplayOptsGetter,
  withScalerFunctions,
  clamp,
} from '../util';
import Value from './value';
import { EditableValue } from './EditableValue';
import './styles/interval.css';

const getLogDisplayOpts = withScalerFunctions(
  ({ min, max, step, value, scaleValue, scaleValueInverse }) => {
    // Scale the values down from their logarithmic represenations into the range used by the slider
    const sliderVals = [
      scaleValueInverse(numericOrDefaultElse(value[0], () => min + (max - min) * 0.25)),
      scaleValueInverse(numericOrDefaultElse(value[1], () => min + (max - min) * 0.75)),
    ];

    const scaledMax = scaleValue(max);
    if (scaleValue(sliderVals[0]) * scaledMax <= 0 || scaleValue(sliderVals[1]) * scaledMax <= 0) {
      throwLogRangeError(`[${sliderVals[0]},${sliderVals[1]}]`);
    }

    return {
      min: 0,
      max: 100,
      step: 1,
      sliderVal: sliderVals,
      logVal: value,
      scaleValue,
    };
  }
);

const getNormalDisplayOpts = createNormalDisplayOptsGetter((min, max, value) => [
  numericOrDefault(value[0], (min + max) * 0.25),
  numericOrDefault(value[1], (min + max) * 0.75),
]);

class Range extends React.Component {
  input = React.createRef();
  state = {
    activeIndex: -1,
    value: null,
    min: null,
    max: null,
    step: null,
    isEditingLeft: false,
    isEditingRight: false,
  };

  /**
   * Gets mouse position in page coords relative to the container
   */
  mouseX = ev => ev.pageX - this.input.current.getBoundingClientRect().left;

  calculateFraction = (evt, value, min, max) => ({
    fraction: clamp(this.mouseX(evt) / this.input.current.offsetWidth, 0, 1),
    lofrac: (clamp(value[0], min, max) - min) / (max - min),
    hifrac: (clamp(value[1], min, max) - min) / (max - min),
  });

  setValue = (oldValue, newValue, activeIndex, clampToExtremes) => {
    if (activeIndex === -1) {
      return;
    }

    // Make sure it doesn't overrun the slider or pass the other side
    const clampTo =
      activeIndex === 0
        ? [clampToExtremes ? this.props.min : -Infinity, oldValue[1]]
        : [oldValue[0], clampToExtremes ? this.props.max : Infinity];
    oldValue[activeIndex] = clamp(newValue, clampTo[0], clampTo[1]);
    this.props.onChange(oldValue);
  };

  componentDidMount() {
    const mouseHandlerWrapper = fn => evt => {
      if (!this.state.dragging) {
        return;
      }

      const { value, min, max, step, scaleValue } = this.computedScaleInfo;
      const { fraction, hifrac, lofrac } = this.calculateFraction(evt, value, min, max);

      // Clip against the other bound:
      const clippedFraction =
        this.state.activeIndex === 0 ? Math.min(hifrac, fraction) : Math.max(lofrac, fraction);

      // Compute and quantize the new value:
      const newValue = scaleValue(min + Math.round(((max - min) * clippedFraction) / step) * step);

      this.setValue(value, newValue, this.state.activeIndex, true);

      fn && fn();
    };

    // Install event listeners on the document for mouse movement and release
    document.addEventListener('mousemove', mouseHandlerWrapper());
    document.addEventListener(
      'mouseup',
      mouseHandlerWrapper(() => this.setState({ dragging: false, activeIndex: -1 }))
    );
  }

  setIsEditingLeft = isEditingLeft => this.setState({ isEditingLeft });

  setIsEditingRight = isEditingRight => this.setState({ isEditingRight });

  render() {
    const { scale, steps, theme, ...props } = this.props;

    const { min, max, step, sliderVal, logVal, scaleValue } = (
      scale === 'log' ? getLogDisplayOpts : getNormalDisplayOpts
    )(props);
    validateStepParams(props.step, steps);

    // These values need to be available for the global mouse event listeners, so we set them
    // as a class property.  This doesn't trigger re-renderings since we're not using `setState`.
    this.computedScaleInfo = {
      value: logVal,
      min,
      max,
      step: isnumeric(steps) ? (max - min) / steps : step,
      scaleValue,
    };

    return (
      <>
        <span
          className='control-panel-interval'
          style={{ backgroundColor: theme.background2 }}
          ref={this.input}
          onMouseDown={evt => {
            this.setState({ dragging: true });

            // Figure out which side is being clicked and adjust the active index accodingly
            const { fraction, hifrac, lofrac } = this.calculateFraction(evt, sliderVal, min, max);

            // This is just for making decisions, so perturb it ever so slightly just in case the
            // bounds are numerically equal.
            const lodiff = Math.abs(lofrac - Math.abs(max - min) * 1e-15 - fraction);
            const hidiff = Math.abs(hifrac + Math.abs(max - min) * 1e-15 - fraction);

            // Determine which one is closer
            this.setState({ activeIndex: lodiff < hidiff ? 0 : 1 });
          }}
        >
          <span
            className='control-panel-interval-handle'
            style={{
              left: clamp(((sliderVal[0] - min) / (max - min)) * 100, 0, 100) + '%',
              right: clamp(100 - ((sliderVal[1] - min) / (max - min)) * 100, 0, 100) + '%',
              backgroundColor: theme.foreground1,
            }}
          />
        </span>
        {this.state.isEditingLeft ? (
          <EditableValue
            left={true}
            initialValue={logVal[0]}
            onSubmit={newValue => {
              let parsedValue = parseFloat(newValue);
              if (isNaN(parsedValue)) {
                this.setIsEditingLeft(false);
                return;
              }

              const oldValue = this.computedScaleInfo.value;
              parsedValue = Math.min(parsedValue, oldValue[1]);

              this.setValue(oldValue, parsedValue, 0, false);
              this.setIsEditingLeft(false);
            }}
            theme={theme}
            width='11%'
          />
        ) : (
          <Value
            text={logVal[0]}
            width='11%'
            left={true}
            onDoubleClick={() => this.setIsEditingLeft(true)}
          />
        )}

        {this.state.isEditingRight ? (
          <EditableValue
            initialValue={logVal[1]}
            onSubmit={newValue => {
              let parsedValue = parseFloat(newValue);
              if (isNaN(parsedValue)) {
                this.setIsEditingRight(false);
                return;
              }

              const oldValue = this.computedScaleInfo.value;
              parsedValue = Math.max(parsedValue, oldValue[0]);

              this.setValue(oldValue, parsedValue, 1, false);
              this.setIsEditingRight(false);
            }}
            theme={theme}
            width='11%'
          />
        ) : (
          <Value text={logVal[1]} width='11%' onDoubleClick={() => this.setIsEditingRight(true)} />
        )}
      </>
    );
  }
}

export default withErrorHandler(withSettingState()(Range));
