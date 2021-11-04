import React from 'react';
import { shallowEqualObjects } from 'shallow-equal';

import { useMemoCompare } from '../util';

const ControlPanelContext = React.createContext({});
export default ControlPanelContext;

export const withTheme =
  Comp =>
  ({ ...props }) =>
    (
      <ControlPanelContext.Consumer>
        {({ theme }) => <Comp theme={theme} {...props} />}
      </ControlPanelContext.Consumer>
    );

const getLabelStyles = theme => ({
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
    <div style={styles.body} className='draggable'>
      <span title={label} className='draggable' style={styles.text}>
        {label}
      </span>
    </div>
  );
});

export const Container = ({ label, LabelComponent, children }) => (
  <div className='container draggable'>
    <Label label={LabelComponent ? <LabelComponent label={label} /> : label || ''} />
    {children}
  </div>
);

const WithSettingStateInner = React.memo(
  ({ state, label, theme, mapPropsToStyles, indicateChange, LabelComponent, Comp, ...props }) => {
    const onChange = React.useCallback(
      newVal => indicateChange(label, newVal),
      [label, indicateChange]
    );
    const compProps = {
      value: state[label],
      onChange,
      theme,
      ...props,
    };
    const memoizedCompProps = useMemoCompare(compProps, shallowEqualObjects);
    const styles = React.useMemo(
      () => (mapPropsToStyles ? mapPropsToStyles(memoizedCompProps) : undefined),
      [mapPropsToStyles, memoizedCompProps]
    );
    if (mapPropsToStyles) {
      compProps.styles = styles;
    }

    const children = <Comp {...compProps} />;

    const renderContainer = props.renderContainer === false ? false : true;
    if (renderContainer && typeof label === 'string') {
      return (
        <Container LabelComponent={LabelComponent} label={label}>
          {children}
        </Container>
      );
    }

    return children;
  }
);

export const withSettingState = mapPropsToStyles => Comp =>
  React.memo(props => (
    <ControlPanelContext.Consumer>
      {ctxProps => (
        <WithSettingStateInner
          {...ctxProps}
          Comp={Comp}
          {...props}
          mapPropsToStyles={mapPropsToStyles}
        />
      )}
    </ControlPanelContext.Consumer>
  ));
