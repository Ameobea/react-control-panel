import React from 'react';

import { withSettingState } from './context';

const UnwrappedMultibox = ({ names = [], count = 2, value, onChange, styles }) => {
  const checkboxValues = value || new Array(count).fill(false);

  return (
    <div style={styles.main}>
      <span style={styles.innerWrapper}>
        {checkboxValues.map((checked, i) => (
          <React.Fragment key={i}>
            <span
              style={styles.getContentStyle(i, checked)}
              onClick={() => {
                const newValue = [...checkboxValues];
                newValue[i] = !checked;
                onChange(newValue);
              }}
            />
            {names[i] ? <span style={styles.label}>{names[i]}</span> : null}
          </React.Fragment>
        ))}
      </span>
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

export default withSettingState(mapPropsToStyles)(UnwrappedMultibox);
