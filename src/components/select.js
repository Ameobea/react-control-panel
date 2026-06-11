import React from 'react';

import { withSettingState } from './context';

const getOptions = options => {
  const keyVals = Array.isArray(options) ? options.map(opt => [opt, opt]) : Object.entries(options);
  return keyVals.map(([label, optionValue]) => (
    <option key={optionValue} value={optionValue}>
      {label}
    </option>
  ));
};

const Select = ({ options, value, onChange, styles }) => {
  const selectRef = React.useRef(null);
  // Blur the select when the value changes to prevent keypresses from being
  // interpreted as changing the value.
  React.useEffect(() => {
    selectRef.current.blur();
  }, [value]);

  return (
    <>
      <span style={styles.triangleUp} />
      <span style={styles.triangleDown} />
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={styles.select}
        ref={selectRef}
      >
        {getOptions(options)}
      </select>
    </>
  );
};

const mapPropsToStyles = ({ theme }) => {
  const triangle = {
    borderRight: '3px solid transparent',
    borderLeft: '3px solid transparent',
    position: 'absolute',
    right: '2.5%',
    zIndex: 1,
    cursor: 'auto',
  };

  return {
    select: {
      position: 'absolute',
      width: '62%',
      paddingLeft: '1.5%',
      height: 20,
      border: 'none',
      borderRadius: 0,
      outline: 'none',
      appearance: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      fontFamily: 'inherit',
      backgroundColor: theme.background2,
      color: theme.text2,
    },
    triangleUp: {
      ...triangle,
      top: 11,
      borderTop: `5px solid ${theme.text2}`,
      borderBottom: '0px transparent',
    },
    triangleDown: {
      ...triangle,
      top: 4,
      borderBottom: `5px solid ${theme.text2}`,
      borderTop: '0px transparent',
    },
  };
};

export default withSettingState(mapPropsToStyles)(Select);
