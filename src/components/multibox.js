import React from 'react';
import PropTypes from 'prop-types';

import { withSettingState } from './context';

const UnwrappedMultibox = ({ names = [], count = 2, value, onChange, styles }) => {
  const HydratedCheckbox = (checked, i) => (
    <React.Fragment key={i}>
      <span
        style={styles.getContentStyle(i, checked)}
        onClick={() => {
          // dirty mutation below
          value[i] = !checked;
          onChange(value);
        }}
      />
      <input type='checkbox' defaultChecked={checked} style={styles.checkbox} />
      {names[i] ? <span style={styles.label}>{names[i]}</span> : null}
    </React.Fragment>
  );

  const checkboxValues = value || new Array(count).map((_v, i) => value[i] || false);

  return (
    <div style={styles.main}>
      <span style={styles.innerWrapper}>{checkboxValues.map(HydratedCheckbox)}</span>
    </div>
  );
};

const mapPropsToStyles = ({ theme, colors = [] }) => ({
  main: {
    position: 'relative',
    width: '60%',
    display: 'inline-block',
    paddingBottom: 7,
  },
  innerWrapper: { display: 'inline-block' },
  checkbox: {
    display: 'none',
    cursor: 'pointer',
  },
  label: {
    backgroundColor: theme.background2,
    paddingRight: 7,
    verticalAlign: 'middle',
    padding: 2,
    marginRight: 8,
    color: theme.text2,
  },
  getContentStyle: (i, checked) => {
    const checkedStyle = {
      width: 10,
      height: 10,
      border: `solid 4px ${theme.background2}`,
      cursor: 'pointer',
      backgroundColor: checked ? colors[i] : theme.foreground1,
    };

    return {
      display: 'inline-block',
      width: 18,
      height: 18,
      padding: 0,
      verticalAlign: 'middle',
      marginRight: 8,
      marginTop: 2,
      marginBottom: 1,
      backgroundColor: theme.background2,
      borderRadius: 0,
      cursor: 'pointer',
      ...(checked ? checkedStyle : {}),
    };
  },
});

const Multibox = withSettingState(mapPropsToStyles)(UnwrappedMultibox);
Multibox.propTypes = {
  colors: PropTypes.array,
  names: PropTypes.arrayOf(PropTypes.string),
  count: PropTypes.number,
};

export default Multibox;
