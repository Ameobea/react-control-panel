import React, { useEffect } from 'react';
import isstring from 'is-string';
import PropTypes from 'prop-types';

import themes from './themes';
import Title from './components/title';
import ControlPanelContext from './components/context';
import Button from './components/button';
import Checkbox from './components/checkbox';
import Multibox from './components/multibox';
import Select from './components/select';
import Text from './components/text';
import Color from './components/color';
import Range from './components/range';
import Interval from './components/interval';
import Custom from './components/custom';
import { createPolyProxy } from './util';
import './components/styles/base.css';
import './components/styles/color.css';

export { default as Button } from './components/button';
export { default as Checkbox } from './components/checkbox';
export { default as Multibox } from './components/multibox';
export { default as Select } from './components/select';
export { default as Text } from './components/text';
export { default as Color } from './components/color';
export { default as Range } from './components/range';
export { InnerRange } from './components/range';
export { default as Interval } from './components/interval';
export { default as Custom } from './components/custom';
export { default as themes } from './themes';
export { default as Value } from './components/value';
export { Container, withSettingState, withTheme, Label } from './components/context';

const settingTypeMapping = {
  range: Range,
  text: Text,
  checkbox: Checkbox,
  color: Color,
  button: Button,
  select: Select,
  multibox: Multibox,
  interval: Interval,
  custom: Custom,
};

const VALID_POSITIONS = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];

/**
 *
 * @param {string | { left?: number, right?: number, bottom?: number, top?: number }} position
 */
const parsePositionPropToOffsets = position => {
  if (typeof position === 'object') {
    return position;
  }

  if (!position) {
    return {};
  }

  return {
    ...(position.includes('top') ? { top: 8 } : {}),
    ...(position.includes('left') ? { left: 8 } : {}),
    ...(position.includes('right') ? { right: 8 } : {}),
    ...(position.includes('bottom') ? { bottom: 8 } : {}),
  };
};

const maybeSnapToGrid = (pos, snapToGrid) => {
  if (!snapToGrid || typeof snapToGrid !== 'number') {
    return pos;
  }

  const snap = (v, grid) => Math.round(v / grid) * grid;
  for (const key in pos) {
    pos[key] = snap(pos[key], snapToGrid);
  }
  return pos;
};

const DragHelper = ({ handleMouseDrag, handleMouseUp }) => {
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseDrag);

    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseDrag);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return null;
};

class ControlPanel extends React.Component {
  constructor(props) {
    super(props);

    const position = parsePositionPropToOffsets(props.position);
    this.state = { data: props.initialState || props.state || {}, position };
    this.derivedSettings = [];

    if (!this.props.settings) {
      return;
    }

    const { derivedInitialState } = this.computeDerivedSettings(this.props.settings);
    this.state.data = { ...this.state.data, ...derivedInitialState };
  }

  lastSettings = null;
  computeDerivedSettings(settings = []) {
    if (this.lastSettings === settings) {
      return { derivedSettings: this.derivedSettings };
    }
    this.lastSettings = settings;

    const { derivedSettings, derivedInitialState } = settings.reduce(
      ({ derivedInitialState, derivedSettings }, { type, label, ...props }) => {
        const SettingComponent = settingTypeMapping[type];

        if (!SettingComponent) {
          return { derivedInitialState, derivedSettings };
        }
        return {
          derivedInitialState:
            'initial' in props
              ? { ...derivedInitialState, [label]: props.initial }
              : derivedInitialState,
          derivedSettings: [...derivedSettings, { SettingComponent, label, props }],
        };
      },
      { derivedInitialState: {}, derivedSettings: [] }
    );
    this.derivedSettings = derivedSettings;
    return { derivedSettings, derivedInitialState };
  }

  componentDidMount() {
    if (!this.props.contextCb) {
      return;
    }

    this.pendingProxySetValues = new Map();
    this.proxyIsSetting = false;

    // `setState` is async, and if we set multiple values while the previous `setState` is
    // happening we can get stale values merged into the state.
    //
    // This prevents that by holding values while `setState` is running until it finishes and then
    // setting them all at once when it does.
    const setStateCb = () => {
      if (this.pendingProxySetValues.size === 0) {
        this.proxyIsSetting = false;
        return;
      }

      const toMerge = Object.fromEntries([...this.pendingProxySetValues.entries()]);
      this.pendingProxySetValues.clear();
      this.setState({ data: { ...this.state.data, ...toMerge } }, setStateCb);
    };

    const handler = {
      get: (_state, prop) => this.state.data[prop],
      set: (_state, prop, val) => {
        if (this.proxyIsSetting) {
          this.pendingProxySetValues.set(prop, val);
          return true;
        }
        this.proxyIsSetting = true;

        this.setState({ data: { ...this.state.data, [prop]: val } }, setStateCb);
        return true;
      },
    };

    const setData = data => this.setState({ data: { ...this.state.data, ...data } });
    this.props.contextCb(createPolyProxy(this.state.data, handler, setData));
  }

  getState() {
    return this.props.state ? this.props.state : this.state.data;
  }

  indicateChange = (label, newVal) => {
    const newState = { ...this.state.data, ...this.getState(), [label]: newVal };
    this.props.onChange(label, newVal, newState);
    if (!this.props.state) {
      this.setState({ data: newState });
    }
  };

  handleMouseDown = evt => {
    if ((evt.target.className || '').includes('draggable') && evt.button === 0) {
      this.setState({
        dragging: true,
        mouseDownCoords: { x: evt.pageX, y: evt.pageY },
        mouseDownPos: { ...this.state.position },
      });
    }
  };

  handleMouseDrag = evt => {
    if (this.state.dragging) {
      const diffX = evt.pageX - this.state.mouseDownCoords.x;
      const diffY = evt.pageY - this.state.mouseDownCoords.y;

      const position =
        (!this.props.position || typeof this.props.position === 'string'
          ? this.props.position
          : Object.keys(this.props.position).join('_')) || '';
      const offset =
        !position || position.includes('left')
          ? { left: this.state.mouseDownPos.left + diffX }
          : { right: this.state.mouseDownPos.right - diffX };

      const newPosition = { ...this.state.position, ...offset };
      if (this.state.mouseDownPos.top !== undefined) {
        newPosition.top = this.state.mouseDownPos.top + diffY;
      } else if (this.state.mouseDownPos.bottom !== undefined) {
        newPosition.bottom = this.state.mouseDownPos.bottom - diffY;
      }

      if (this.props.onDrag) {
        this.props.onDrag(newPosition);
      }

      this.setState({ position: maybeSnapToGrid(newPosition, this.props.dragSnapPx) });
    }
  };

  handleMouseUp = () => {
    // `setTimeout` here in order to avoid re-rendering the component and potentially discarding
    // new data from child settings that were changed as a result of this.
    setTimeout(() => {
      if (this.state.dragging) {
        this.setState({ dragging: false });
      }
    });
  };

  render() {
    const {
      width,
      theme: suppliedTheme,
      position = '',
      title,
      children,
      style,
      settings,
      className,
      draggable,
    } = this.props;

    const theme = isstring(suppliedTheme) ? themes[suppliedTheme] || themes['dark'] : suppliedTheme;
    const state = this.getState();
    const combinedStyle = {
      display: 'inline-block',
      background: theme.background1,
      width,
      padding: 14,
      paddingBottom: 8,
      opacity: 0.95,
      position:
        VALID_POSITIONS.includes(position) || typeof position !== 'string' ? 'absolute' : undefined,
      ...(this.state.position || {}),
      cursor: draggable ? 'move' : undefined,
      ...style,
    };

    const { derivedSettings } = this.computeDerivedSettings(settings);

    return (
      <div
        className={`control-panel draggable${className ? ' ' + className : ''}`}
        onMouseDown={draggable ? this.handleMouseDown : undefined}
        style={combinedStyle}
      >
        {draggable ? (
          <DragHelper handleMouseDrag={this.handleMouseDrag} handleMouseUp={this.handleMouseUp} />
        ) : null}
        <ControlPanelContext.Provider
          value={{
            state,
            theme,
            indicateChange: this.indicateChange,
          }}
        >
          {title ? <Title title={title} /> : null}
          {children}
          {derivedSettings.map(({ SettingComponent, label, props }) => (
            <SettingComponent key={label} label={label} {...props} value={state[label]} />
          ))}
        </ControlPanelContext.Provider>
      </div>
    );
  }
}

ControlPanel.propTypes = {
  initialState: PropTypes.object,
  onChange: PropTypes.func,
  theme: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  title: PropTypes.string,
  width: PropTypes.number,
  position: PropTypes.oneOfType([
    PropTypes.oneOf(VALID_POSITIONS),
    PropTypes.string,
    PropTypes.object,
  ]),
  style: PropTypes.object,
  settings: PropTypes.arrayOf(PropTypes.object),
  state: PropTypes.object,
  contextCb: PropTypes.func,
  draggable: PropTypes.bool,
  onDrag: PropTypes.func,
  className: PropTypes.string,
};

ControlPanel.defaultProps = {
  width: 300,
  theme: 'dark',
  onChange: () => {},
  style: {},
  className: null,
};

export default ControlPanel;
