import React from 'react';

import { withSettingState } from './context';

const getOptions = options => {
  const keyVals = Array.isArray(options) ? options.map(opt => [opt, opt]) : Object.entries(options);
  return keyVals.map(([val, key]) => (
    <option key={key} value={key}>
      {val}
    </option>
  ));
};

const Select = ({ options, theme, value, onChange, styles }) => {
  const selectRef = React.useRef(null);
  // Blur the select when the value changes to prevent keypresses from being
  // interpreted as changing the value.
  React.useEffect(() => {
    selectRef.current.blur();
  }, [value]);

  return (
    <>
      <span style={styles.traingleUp} />
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
    lineHeight: 20,
    position: 'absolute',
    right: '2.5%',
    zIndex: 1,
    cursor: 'auto',
  };

  return {
    select: {
      display: 'inlineBlock',
      position: 'absolute',
      width: '62%',
      paddingLeft: '1.5%',
      height: 20,
      border: 'none',
      borderRadius: 0,
      outline: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      OAppearance: 'none',
      fontFamily: 'inherit',
      backgroundColor: theme.background2,
      color: theme.text2,
    },
    traingleUp: {
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
