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
    <div style={styles.body} className='control-panel-draggable'>
      <span
        title={typeof label === 'string' ? label : undefined}
        className='control-panel-draggable'
        style={styles.text}
      >
        {label}
      </span>
    </div>
  );
});

export const Container = ({ label, LabelComponent, children }) => (
  <div className='control-panel-container control-panel-draggable'>
    <Label label={LabelComponent ? <LabelComponent label={label} /> : label || ''} />
    {children}
  </div>
);
const ContainerMemo = React.memo(Container);

const WithSettingStateInner = ({
  state,
  label,
  theme,
  mapPropsToStyles,
  indicateChange,
  LabelComponent,
  Comp,
  ...props
}) => {
  const onChange = React.useCallback(
    newVal => indicateChange(label, newVal),
    [label, indicateChange]
  );
  // Memoizing on shallow-equal props keeps the rendered element's identity stable, which lets
  // React bail out of re-rendering `Comp` when some *other* setting in the panel changed.
  const compProps = useMemoCompare(
    { value: state[label], onChange, theme, ...props },
    shallowEqualObjects
  );
  const styles = React.useMemo(
    () => (mapPropsToStyles ? mapPropsToStyles(compProps) : undefined),
    [mapPropsToStyles, compProps]
  );
  const children = React.useMemo(
    () => (styles ? <Comp {...compProps} styles={styles} /> : <Comp {...compProps} />),
    [Comp, compProps, styles]
  );

  const renderContainer = props.renderContainer === false ? false : true;
  if (renderContainer && typeof label === 'string') {
    return (
      <ContainerMemo LabelComponent={LabelComponent} label={label}>
        {children}
      </ContainerMemo>
    );
  }

  return children;
};

export const withSettingState = mapPropsToStyles => Comp => {
  const WithSettingState = props => (
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
  );

  return React.memo(WithSettingState);
};
