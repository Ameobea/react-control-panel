import React from 'react';

const ControlPanelContext = React.createContext({});
export default ControlPanelContext;

export const withTheme = (Comp) => ({ ...props }) => (
  <ControlPanelContext.Consumer>
    {({ theme }) => <Comp theme={theme} {...props} />}
  </ControlPanelContext.Consumer>
);

const getLabelStyles = (theme) => ({
  body: {
    left: 0,
    width: '36%',
    display: 'inline-block',
    height: 20,
    paddingRight: '2%',
    verticalAlign: 'top',
  },
  text: {
    color: theme.text1,
    display: 'inline-block',
    verticalAlign: 'sub',
  },
});

export const Label = withTheme(({ label, theme }) => {
  const styles = getLabelStyles(theme);

  return (
    <div style={styles.body} className="draggable">
      <span title={label} className="draggable" style={styles.text}>
        {label}
      </span>
    </div>
  );
});

export const Container = ({ label, LabelComponent, children }) => (
  <div className="container draggable">
    <Label label={LabelComponent ? <LabelComponent label={label} /> : label || ''} />
    {children}
  </div>
);

const WithSettingStateWrapper = React.memo(({ renderContainer, label, LabelComponent, children }) =>
  renderContainer ? (
    <Container LabelComponent={LabelComponent} label={label}>
      {children}
    </Container>
  ) : (
    children
  )
);

export const withSettingState = (mapPropsToStyles) => (Comp) => ({
  label,
  LabelComponent,
  ...props
}) => (
  <ControlPanelContext.Consumer>
    {({ state, theme, indicateChange }) => {
      const compProps = {
        value: state[label],
        onChange: (newVal) => indicateChange(label, newVal),
        theme,
        ...props,
      };
      if (mapPropsToStyles) {
        compProps.styles = mapPropsToStyles(compProps);
      }

      return (
        <WithSettingStateWrapper
          label={label}
          LabelComponent={LabelComponent}
          renderContainer={props.renderContainer === false ? false : true}
        >
          <Comp {...compProps} />
        </WithSettingStateWrapper>
      );
    }}
  </ControlPanelContext.Consumer>
);
