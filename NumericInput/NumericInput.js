import React, { Component } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Button from '../Button';
import PropTypes from 'prop-types';
import { create, PREDEF_RES } from 'react-native-pixel-perfect';
import CurrencyInput from "react-native-currency-input";

let calcSize = create(PREDEF_RES.iphone7.px);

export default class NumericInput extends Component {
  constructor(props) {
    super(props);
    const noInitSent = props.initValue !== 0 && !props.initValue;
    const initialValue = noInitSent ? (props.value ? props.value : 0) : props.initValue;
    const formattedValue = props.decimalPlaces > 0 ? this.formatNumeric(initialValue) : initialValue.toString();
    this.state = {
      value: initialValue,
      lastValid: initialValue,
      stringValue: formattedValue,
    };
    this.ref = null;
  }

  componentDidUpdate() {
    const initSent = !(this.props.initValue !== 0 && !this.props.initValue);
    if (this.props.initValue !== this.state.value && initSent) {
      const formattedValue = this.props.decimalPlaces > 0 ? this.formatNumeric(this.props.initValue) : this.props.initValue.toString();
      this.setState({
        value: this.props.initValue,
        lastValid: this.props.initValue,
        stringValue: formattedValue
      });
    }
  }

  updateBaseResolution = (width, height) => {
    calcSize = create({ width, height });
  }

  inc = () => {
    let value = this.props.value && (typeof this.props.value === 'number') ? this.props.value : this.state.value;
    if (this.props.maxValue === null || (value + this.props.step < this.props.maxValue)) {
      value = (value + this.props.step).toFixed(this.props.decimalPlaces);
      value = this.props.valueType === 'real' ? parseFloat(value) : parseInt(value);
      this.setState({ value, stringValue: this.formatNumber(value) });
    } else if (this.props.maxValue !== null) {
      this.props.onLimitReached(true, 'Reached Maximum Value!');
      value = this.props.maxValue;
      this.setState({ value, stringValue: this.formatNumber(value) });
    }
    if (value !== this.props.value)
      this.props.onChange && this.props.onChange(Number(value));
  };

  dec = () => {
    let value = this.props.value && (typeof this.props.value === 'number') ? this.props.value : this.state.value;
    if (this.props.minValue === null || (value - this.props.step > this.props.minValue)) {
      value = (value - this.props.step).toFixed(this.props.decimalPlaces);
      value = this.props.valueType === 'real' ? parseFloat(value) : parseInt(value);
    } else if (this.props.minValue !== null) {
      this.props.onLimitReached(false, 'Reached Minimum Value!');
      value = this.props.minValue;
    }
    if (value !== this.props.value)
      this.props.onChange && this.props.onChange(Number(value));
    this.setState({ value, stringValue: this.formatNumber(value) });
  };

  isLegalValue = (value, mReal, mInt) => value === '' || (((this.props.valueType === 'real' && mReal(value)) || (this.props.valueType !== 'real' && mInt(value))) && (this.props.maxValue === null || (parseFloat(value) <= this.props.maxValue)) && (this.props.minValue === null || (parseFloat(value) >= this.props.minValue)));

  realMatch = (value) => value && value.match(/-?\d+(\.(\d+)?)?/) && value.match(/-?\d+(\.(\d+)?)?/)[0] === value.match(/-?\d+(\.(\d+)?)?/).input;

  intMatch = (value) => value && value.match(/-?\d+/) && value.match(/-?\d+/)[0] === value.match(/-?\d+/).input;

  format(value) {
    const newValue = parseFloat(value.replace(',', '.'));
    const numFormatted = newValue.toFixed(this.props.decimalPlaces);
    return numFormatted.replace('.', ',');
  }

  formatNumeric(value) {
    const numFormatted = value.toFixed(this.props.decimalPlaces);
    return numFormatted.replace('.', ',');
  }

  formatNumber = (value) => {
    if (isNaN(value)) return `0${this.props.decimalSeparator}00`;
    const roundedValue = (Math.round(value * Math.pow(10, this.props.decimalPlaces)) / Math.pow(10, this.props.decimalPlaces)).toFixed(this.props.decimalPlaces);
    let [integerPart, decimalPart] = roundedValue.split('.');
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, this.props.thousandSeparator);
    return `${integerPart}${this.props.decimalSeparator}${decimalPart}`;
  };

  addDecimalSeparator(str) {
    return str.length < 2 ? str : str.slice(0, -2) + ',' + str.slice(-2);
  }

  onChange = (input) => {
    if (isNaN(input.replace(',', '.'))) {
      input = "0,00";
    }
    let cleanedInput = input.replace(/[^0-9]/g, '');
    let newValue = this.addDecimalSeparator(cleanedInput);
    newValue = this.format(newValue);
    this.setState({ stringValue: newValue });
    this.setState({ value: parseFloat(newValue.replace(',', '.')) });
    this.props.onChange(parseFloat(newValue.replace(',', '.')));
  };

  onBlur = () => {};

  onFocus = () => {
    this.setState({ lastValid: this.state.value });
    this.props.onFocus && this.props.onFocus();
  };

  render() {
    const editable = this.props.editable;
    const sepratorWidth = (typeof this.props.separatorWidth === 'undefined') ? this.props.sepratorWidth : this.props.separatorWidth;
    const borderColor = this.props.borderColor;
    const iconStyleInc = [style.icon, this.props.iconStyleInc];
    const iconStyleDec = [style.icon, this.props.iconStyleDec];
    const totalWidth = this.props.totalWidth;
    const totalHeight = this.props.totalHeight ? this.props.totalHeight : (totalWidth * 0.4);
    const inputWidth = this.props.type === 'up-down' ? (totalWidth * 0.6) : (totalWidth * 0.4);
    const borderRadiusTotal = totalHeight * 0.18;
    const fontSize = totalHeight * 0.38;
    const textColor = this.props.textColor;
    const maxReached = this.state.value === this.props.maxValue;
    const minReached = this.state.value === this.props.minValue;
    const inputContainerStyle = this.props.type === 'up-down' ?
      [style.inputContainerUpDown, { width: totalWidth, height: totalHeight, borderColor: borderColor }, this.props.rounded ? { borderRadius: borderRadiusTotal } : {}, this.props.containerStyle] :
      [style.inputContainerPlusMinus, { width: totalWidth, height: totalHeight, borderColor: borderColor }, this.props.rounded ? { borderRadius: borderRadiusTotal } : {}, this.props.containerStyle];
    const inputStyle = this.props.type === 'up-down' ?
      [style.inputUpDown, { width: inputWidth, height: totalHeight, fontSize: fontSize, color: textColor, borderRightWidth: 2, borderRightColor: borderColor }, this.props.inputStyle] :
      [style.inputPlusMinus, { width: inputWidth, height: totalHeight, fontSize: fontSize, color: textColor, borderRightWidth: sepratorWidth, borderLeftWidth: sepratorWidth, borderLeftColor: borderColor, borderRightColor: borderColor }, this.props.inputStyle];
    const upDownStyle = [{ alignItems: 'center', width: totalWidth - inputWidth, backgroundColor: this.props.upDownButtonsBackgroundColor, borderRightWidth: 1, borderRightColor: borderColor }, this.props.rounded ? { borderTopRightRadius: borderRadiusTotal, borderBottomRightRadius: borderRadiusTotal } : {}];
    const rightButtonStyle = [
      {
        position: 'absolute',
        zIndex: -1,
        right: 0,
        height: totalHeight - 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0,
        backgroundColor: this.props.rightButtonBackgroundColor,
        width: (totalWidth - inputWidth) / 2
      },
      this.props.rounded ?
        { borderTopRightRadius: borderRadiusTotal, borderBottomRightRadius: borderRadiusTotal } :
        {}
    ];
    const leftButtonStyle = [
      {
        position: 'absolute',
        zIndex: -1,
        left: 0,
        height: totalHeight - 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: this.props.leftButtonBackgroundColor,
        width: (totalWidth - inputWidth) / 2,
        borderWidth: 0
      },
      this.props.rounded ?
        { borderTopLeftRadius: borderRadiusTotal, borderBottomLeftRadius: borderRadiusTotal } :
        {}
    ];
    const containerStyle = { justifyContent: 'center', alignItems: 'center' };
    const inputContainerStyleView = this.props.disabled ?
      inputContainerStyle :
      [inputContainerStyle, { shadowColor: this.props.shadowColor || '#000', shadowOpacity: this.props.shadowOpacity || 0.8, shadowRadius: this.props.shadowRadius || 2, shadowOffset: this.props.shadowOffset || { width: 0, height: 1 } }];

    return (
      <View style={containerStyle}>
        <View style={inputContainerStyleView}>
          {
            this.props.type === 'up-down' ?
              <Button key={'left'} containerStyle={leftButtonStyle} disabled={minReached} type={'decrement'} iconComponent={Icon} iconName="remove" onPress={this.dec} iconColor={this.props.iconColorDec} iconSize={calcSize(25)} iconStyle={iconStyleDec} /> : null
          }
          <TextInput
            style={inputStyle}
            ref={(ref) => this.ref = ref}
            underlineColorAndroid="transparent"
            value={editable ? this.state.stringValue : this.formatNumber(this.state.value)}
            onChangeText={editable ? this.onChange : () => {}}
            editable={editable}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            keyboardType="numeric"
          />
          {
            this.props.type === 'up-down' ?
              <Button key={'right'} containerStyle={rightButtonStyle} disabled={maxReached} type={'increment'} iconComponent={Icon} iconName="add" onPress={this.inc} iconColor={this.props.iconColorInc} iconSize={calcSize(25)} iconStyle={iconStyleInc} /> :
              <View style={upDownStyle}>
                <Button disabled={minReached} type={'decrement'} iconComponent={Icon} iconName="remove" onPress={this.dec} iconColor={this.props.iconColorDec} iconSize={calcSize(25)} iconStyle={iconStyleDec} />
                <Button disabled={maxReached} type={'increment'} iconComponent={Icon} iconName="add" onPress={this.inc} iconColor={this.props.iconColorInc} iconSize={calcSize(25)} iconStyle={iconStyleInc} />
              </View>
          }
        </View>
      </View>
    );
  }
}

const style = StyleSheet.create({
  icon: { paddingHorizontal: calcSize(3) },
  inputContainerPlusMinus: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1 },
  inputContainerUpDown: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  inputPlusMinus: { textAlign: 'center', fontWeight: 'bold' },
  inputUpDown: { textAlign: 'center', fontWeight: 'bold' }
});

NumericInput.propTypes = {
  decimalPlaces: PropTypes.number,
  valueType: PropTypes.oneOf(['integer', 'real']),
  value: PropTypes.number,
  initValue: PropTypes.number,
  step: PropTypes.number,
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  editable: PropTypes.bool,
  iconStyleDec: PropTypes.any,
  iconStyleInc: PropTypes.any,
  type: PropTypes.oneOf(['up-down', 'plus-minus']),
  containerStyle: PropTypes.any,
  inputStyle: PropTypes.any,
  separatorWidth: PropTypes.number,
  borderColor: PropTypes.string,
  totalWidth: PropTypes.number,
  totalHeight: PropTypes.number,
  rounded: PropTypes.bool,
  textColor: PropTypes.string,
  upDownButtonsBackgroundColor: PropTypes.string,
  rightButtonBackgroundColor: PropTypes.string,
  leftButtonBackgroundColor: PropTypes.string,
  shadowColor: PropTypes.string,
  shadowOpacity: PropTypes.number,
  shadowRadius: PropTypes.number,
  shadowOffset: PropTypes.object,
  iconColorInc: PropTypes.string,
  iconColorDec: PropTypes.string,
  onChange: PropTypes.func,
  onLimitReached: PropTypes.func,
  decimalSeparator: PropTypes.string,
  thousandSeparator: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  sepratorWidth: PropTypes.number,
  disabled: PropTypes.bool
};

NumericInput.defaultProps = {
  decimalPlaces: 2,
  valueType: 'real',
  value: 0,
  initValue: 0,
  step: 1,
  minValue: null,
  maxValue: null,
  editable: true,
  decimalSeparator: ',',
  thousandSeparator: '.'
};
