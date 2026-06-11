import React from 'react';

export class InvalidParamsError extends Error {}

export const ErrMsg = ({ msg }) => <span style={{ color: 'red' }}>{msg}</span>;

class ErrorHandlerWrapper extends React.Component {
  state = { errMsg: null };

  componentDidCatch(err) {
    this.setState({ errMsg: err.message });
  }

  render() {
    if (this.state.errMsg) {
      return <ErrMsg msg={this.state.errMsg} />;
    }
    const { Comp, ...props } = this.props;
    return <Comp {...props} />;
  }
}

export const withErrorHandler = Comp => ({ ...props }) => (
  <ErrorHandlerWrapper Comp={Comp} {...props} />
);

const createValidator = (checkIfInvalid, createErrMsg) => (...args) => {
  if (!checkIfInvalid(...args)) {
    return;
  }

  throw new InvalidParamsError(createErrMsg(...args));
};

export const validateStepParams = createValidator(
  (step, steps) => !!step && !!steps,
  (step, steps) => `Cannot specify both step and steps. Got step = ${step}, steps = ${steps}`
);

// local copy of util.js `isNumeric` to avoid an error.js <-> util.js import cycle
const isNumericVal = v =>
  (typeof v === 'number' && !Number.isNaN(v)) ||
  (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v)));

export const validateLogStep = createValidator(
  isNumericVal,
  step => `Log may only use steps (integer number of steps), not a step value. Got step = ${step}`
);

export const validateLogMinMax = createValidator(
  (min, max) => min * max <= 0,
  (min, max) =>
    `Log range min/max must have the same sign and not equal zero. Got min = ${min}, max = ${max}`
);

export const throwLogRangeError = scaledVal => {
  throw new InvalidParamsError(
    `Log range initial value must have the same sign as min/max and must not equal zero. Got initial value = ${scaledVal}`
  );
};
