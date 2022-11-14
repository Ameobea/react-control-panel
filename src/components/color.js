import React from 'react';
import SimpleColorPicker from 'simple-color-picker';

import { withSettingState } from './context';
import Value from './value';

const arrayToRgb = arr => {
  const [r, g, b] = arr.map(x => Math.round(x * 255));
  return `rgb(${r},${g},${b})`;
};

const colorFormatters = {
  rgb: colorPicker => {
    const { r, g, b } = colorPicker.getRGB();
    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
  },
  hex: colorPicker => colorPicker.getHexString(),
  array: colorPicker => {
    const { r, g, b } = colorPicker.getRGB();
    return [r, g, b].map(x => (x / 255).toFixed(2));
  },
};

// Normalizes all input color strings to hex number
const colorParsers = {
  rgb: color => {
    const [r, g, b] = color
      .replace('rgb(', '')
      .replace(' ', '')
      .replace(')', '')
      .split(',')
      .map(x => parseInt(x, 10));
    return (r << 16) + (g << 8) + b;
  },
  hex: color => parseInt(color.replace('#', ''), 16),
  array: color => {
    const [r, g, b] = color.map(x => Math.round(x * 255));
    return (r << 16) + (g << 8) + b;
  },
};

class Color extends React.Component {
  colorpickerContainer = React.createRef();
  state = { colorHovered: false, pickerHovered: false };

  lastColor = null;

  formatColor = () => colorFormatters[this.props.format](this.picker);

  componentDidMount() {
    this.picker = new SimpleColorPicker({
      el: this.colorpickerContainer.current,
      color: this.props.value,
      background: this.props.theme.background1,
      width: 125,
      height: 100,
    });

    this.picker.onChange(() => {
      const formattedNewColor = this.formatColor();
      if (formattedNewColor !== this.props.value) {
        this.lastColor = formattedNewColor;
        this.props.onChange(formattedNewColor);
      }
    });
  }

  componentDidUpdate() {
    if (this.picker && this.props.value !== this.lastColor) {
      console.log('parsing');
      const parsedColor = colorParsers[this.props.format](this.props.value);
      this.picker.setColor(parsedColor);
    }
  }

  getStyles = () => ({
    colorDisplay: {
      position: 'relative',
      display: 'inline-block',
      width: '12.5%',
      height: 20,
      backgroundColor:
        this.props.format === 'array' ? arrayToRgb(this.props.value) : this.props.value,
    },
    picker: {
      position: 'absolute',
      top: '20%',
      paddingTop: 20,
      left: '38%',
      bottom: '20%',
      right: '10%',
      height: 100,
      width: 100,
      zIndex: 8,
      display: this.state.colorHovered || this.state.pickerHovered ? undefined : 'none',
      cursor: 'default',
    },
  });

  render = () => {
    const styles = this.getStyles();

    return (
      <React.Fragment>
        <span
          style={styles.colorDisplay}
          onMouseEnter={() => this.setState({ colorHovered: true })}
          onMouseLeave={() => this.setState({ colorHovered: false })}
        />
        <div
          ref={this.colorpickerContainer}
          style={styles.picker}
          onMouseEnter={() => this.setState({ pickerHovered: true })}
          onMouseLeave={() => this.setState({ pickerHovered: false })}
        />
        <Value text={this.props.value} width='46%' />
      </React.Fragment>
    );
  };
}

export default withSettingState()(Color);
