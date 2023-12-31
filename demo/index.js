import React from 'react';
import ReactDOM from 'react-dom';

import ControlPanel, {
  Text,
  Button,
  Select,
  Checkbox,
  Multibox,
  Color,
  Range,
  Interval,
  Custom,
} from '../src/index';

const CustomInput = ({ value, onChange, theme }) => (
  <div style={{ display: 'flex', flexDirection: 'row' }}>
    <div style={{ color: 'orchid', paddingTop: 3, display: 'inline-block', width: '36%' }}>
      100% Custom Component
    </div>
    <div style={{ width: '60%', display: 'inline-block' }}>
      <input
        style={{
          color: theme.background1,
          marginTop: 8,
          backgroundColor: theme.foreground1,
          width: '100%',
          marginLeft: 6,
        }}
        value={value}
        onChange={evt => onChange(evt.target.value)}
      />
    </div>
  </div>
);

const initialState = {
  'range slider': 20,
  'stepped slider': 0.6,
  interval: [25, 50],
  text: 'my setting',
  checkbox: true,
  'color rgb': 'rgb(100, 200, 100',
  'color hex': '#30b2ba',
  selection: 'option 1',
  'multiple checkboxes': [true, true],
  'custom component': 1,
};

const DemoPanel = ({ theme, title, ...props }) => (
  <ControlPanel
    theme={theme}
    title={title}
    initialState={initialState}
    onChange={console.log}
    {...props}
  >
    {props.settings ? null : (
      <>
        <Range label='range slider' min={0} max={100} />
        <Range label='stepped slider' min={0} max={1} />
        <Interval label='interval' min={0} max={100} />
        <Text label='text' />
        <Checkbox label='checkbox' />
        <Color label='color rgb' format='rgb' />
        <Color label='color hex' format='hex' />
        <Button label='gimme an alert' action={() => alert('clicked')} />
        <Button label='disabled button' disabled />
        <Select label='selection' options={{ 'option 1': 1, 'option 2': 2 }} />
        <Multibox
          label='multiple checkboxes'
          colors={['rgb(100,120,230)', 'rgb(210,100,190)']}
          names={['box1', 'box2']}
          LabelComponent={({ label }) => <span style={{ color: 'red' }}>{label}</span>}
        />
        <Custom label='custom component' renderContainer={false} Comp={CustomInput} />
      </>
    )}
  </ControlPanel>
);

class App extends React.Component {
  state = { text: 'val from outer state', num: 10, checkbox: true };

  render = () => (
    <>
      <DemoPanel
        theme='light'
        title='Example Panel 1'
        style={{ marginRight: 11, display: 'inline-block' }}
      />
      <DemoPanel
        theme='dark'
        title='Example Panel 2'
        style={{ display: 'inline-block' }}
        position={{ top: 0, right: 20 }}
        draggable
      />
      <DemoPanel
        theme='dark'
        title='Example Panel 3'
        draggable
        position='bottom-right'
        settings={[
          { type: 'range', label: 'my range', min: 0, max: 100, initial: 20 },
          { type: 'range', label: 'log range', min: 0.1, max: 100, initial: 20, scale: 'log' },
          { type: 'text', label: 'my text', initial: 'my cool setting' },
          { type: 'checkbox', label: 'my checkbox', initial: true },
          { type: 'color', label: 'my color', format: 'rgb', initial: 'rgb(10,200,0)' },
          {
            type: 'button',
            label: 'disabled button',
            disabled: true,
            action: () => alert('this should never happen!'),
          },
          {
            type: 'button',
            label: 'gimme an alert',
            action: () => {
              alert('hello!');
            },
          },
          {
            type: 'select',
            label: 'select one',
            options: ['option 1', 'option 2'],
            initial: 'option 1',
          },
          { type: 'multibox', label: 'check many', count: 3, initial: [true, false, true] },
        ]}
        contextCb={console.warn}
      />
      <ControlPanel
        title='External State'
        state={this.state}
        onChange={(key, val) => console.log(this.state, key, val) || this.setState({ [key]: val })}
        position='bottom-left'
        style={{ display: 'inline-block' }}
        draggable
      >
        <Text label='text' />
        <Range label='num' min={0} max={100} step={10} />
        <Checkbox label='checkbox' />
      </ControlPanel>
    </>
  );
}

const root = document.getElementById('root');
ReactDOM.render(<App />, root);
