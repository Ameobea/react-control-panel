import React, { useMemo, useState, useEffect } from 'react';
import { buildValueStyles } from './value';

export const EditableValue = ({ theme, initialValue, width, left, onSubmit }) => {
  const style = useMemo(() => {
    const baseStyles = buildValueStyles(theme.background2, theme.text2, width, left);
    return { ...baseStyles.body, ...baseStyles.text, height: 17 };
  }, [theme.background2, theme.text2, width, left]);
  const [value, setValue] = useState(initialValue);
  // Focus the input when it is mounted
  const inputRef = React.useRef(null);
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return (
    <input
      ref={inputRef}
      type='text'
      style={style}
      onKeyDown={evt => {
        if (evt.key === 'Enter') {
          onSubmit(value);
        } else if (evt.key === 'Escape') {
          onSubmit(initialValue);
        }
      }}
      onChange={evt => setValue(evt.target.value)}
      value={value}
    />
  );
};
