import React from 'react';
import PropTypes from 'prop-types';

import { withTheme, Container } from './context';

const getStyle = (theme, { focused, active, hover }) => {
  const hoverStyle = {
    color: theme.text2,
    backgroundColor: theme.background2hover,
  };

  const activeStyle = {
    color: theme.background2,
    backgroundColor: theme.text2,
  };

  return {
    position: 'absolute',
    textAlign: 'center',
    height: 20,
    width: '62%',
    border: 'none',
    cursor: 'pointer',
    right: 0,
    fontFamily: 'inherit',
    color: theme.text2,
    backgroundColor: theme.background2,
    outline: focused ? 'none' : undefined,
    ...(hover ? hoverStyle : {}),
    ...(active ? activeStyle : {}),
  };
};

const UnwrappedButton = ({ theme, action, label }) => {
  const [focused, setFocused] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const style = React.useMemo(
    () => getStyle(theme, { focused, active, hover }),
    [theme, focused, active, hover]
  );

  return (
    <Container>
      <button
        style={style}
        onClick={action}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onMouseDown={() => {
          setActive(true);
          if (onmousedown) {
            onmousedown();
          }
        }}
        onMouseUp={() => {
          setActive(false);
          if (onmouseup) {
            onmouseup();
          }
        }}
      >
        {label}
      </button>
    </Container>
  );
};

const Button = withTheme(UnwrappedButton);
Button.propTypes = {
  action: PropTypes.func,
  onmousedown: PropTypes.func,
  onmouseup: PropTypes.func,
  label: PropTypes.string.isRequired,
};

export default Button;
