import React, { useRef } from 'react';
import { v4 as uuid } from 'uuid';

import { withSettingState } from './context';

const Checkbox = ({ theme, value: checked, onChange, styles }) => {
  const id = useRef(uuid());

  return (
    <>
      <input
        id={id.current}
        type='checkbox'
        checked={checked}
        style={styles.checkbox}
        onChange={() => onChange(!checked)}
      />
      <label htmlFor={id.current} style={styles.label} />
    </>
  );
};

const mapPropsToStyles = ({ theme, value: checked }) => {
  const labelCheckedStyle = {
    width: 10,
    height: 10,
    backgroundColor: theme.foreground1,
    border: `solid 4px ${theme.background2}`,
    cursor: 'pointer',
  };

  return {
    checkbox: {
      display: 'none',
      cursor: 'pointer',
    },
    label: {
      display: 'inline-block',
      width: 18,
      height: 18,
      padding: 0,
      verticalAlign: 'middle',
      marginRight: 8,
      marginTop: 2,
      backgroundColor: theme.background2,
      borderRadius: 0,
      cursor: 'pointer',
      ...(checked ? labelCheckedStyle : {}),
    },
  };
};

export default withSettingState(mapPropsToStyles)(Checkbox);
