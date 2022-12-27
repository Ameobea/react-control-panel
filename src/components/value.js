import React, { useMemo } from 'react';

import { withTheme } from './context';

export const buildValueStyles = (background2, text2, width, left) => ({
  body: {
    position: 'absolute',
    backgroundColor: background2,
    paddingLeft: '1.5%',
    height: 20,
    width: width,
    display: 'inline-block',
    overflow: 'hidden',
    right: !left ? 0 : undefined,
    cursor: 'auto',
  },
  text: {
    color: text2,
    display: 'inline-block',
    MozUserSelect: 'text',
    cursor: 'text',
    overflow: 'hidden',
    lineHeight: '20px',
    wordBreak: 'break-all',
    height: 20,
  },
});

const Value = ({ theme, text, width, left, onDoubleClick }) => {
  const styles = useMemo(
    () => buildValueStyles(theme.background2, theme.text2, width, left),
    [theme.background2, theme.text2, width, left]
  );

  return (
    <div style={styles.body} onDoubleClick={onDoubleClick}>
      <span style={styles.text}>{text}</span>
    </div>
  );
};

const EnhancedValue = withTheme(Value);

export default EnhancedValue;
