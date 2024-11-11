import React, { Component } from "react";

import { View, TextInput, StyleSheet, Text } from "react-native";

import Icon from "react-native-vector-icons/Ionicons";

import Button from "../Button";

import PropTypes from "prop-types";

import { create, PREDEF_RES } from "react-native-pixel-perfect";


let calcSize = create(PREDEF_RES.iphone7.px);

export default class NumericInput extends Component {
  constructor(props) {
    super(props);

    const noInitSent = props.initValue !== 0 && !props.initValue;

    const initialValue = noInitSent
      ? props.value
        ? props.value
        : 0
      : props.initValue;

    const formattedValue =
      props.decimalPlaces > 0
        ? this.formatNumeric(initialValue)
        : initialValue.toString();

    this.state = {
      value: initialValue,

      lastValid: initialValue,

      stringValue: formattedValue,
    };

    this.ref = null;
  }

  // this.props refers to the new props

  componentDidUpdate() {
    const initSent = !(this.props.initValue !== 0 && !this.props.initValue);

    // compare the new value (props.initValue) with the existing/old one (this.state.value)

    if (this.props.initValue !== this.state.value && initSent) {
      const formattedValue =
        this.props.decimalPlaces > 0
          ? this.formatNumeric(this.props.initValue)
          : this.props.initValue.toString();

      this.setState({
        value: this.props.initValue,

        lastValid: this.props.initValue,

        stringValue: formattedValue,
      });
    }
  }

  updateBaseResolution = (width, height) => {
    calcSize = create({ width, height });
  };

  inc = () => {
    let value =
      this.props.value && typeof this.props.value === "number"
        ? this.props.value
        : this.state.value;

    if (
      this.props.maxValue === null ||
      value + this.props.step < this.props.maxValue
    ) {

      value = (value + this.props.step).toFixed(this.props.decimalPlaces);

      value =
        this.props.valueType === "real" ? parseFloat(value) : parseInt(value);

      if (this.props.valueType === "real") {
        this.setState({ value, stringValue: this.formatNumber(value) });
      } else {
        this.setState({ value, stringValue: value.toString() });
      }
      
    } else if (this.props.maxValue !== null) {
      this.props.onLimitReached(true, "Reached Maximum Value!");

      value = this.props.maxValue;

      if (this.props.valueType === "real") {
        this.setState({ value, stringValue: this.formatNumber(value) });
      } else {
        this.setState({ value, stringValue: value.toString() });
      }
    }

    if (value !== this.props.value)
      this.props.onChange && this.props.onChange(Number(value));
  };

  dec = () => {
    let value =
      this.props.value && typeof this.props.value === "number"
        ? this.props.value
        : this.state.value;

    if (
      this.props.minValue === null ||
      value - this.props.step > this.props.minValue
    ) {
      value = (value - this.props.step).toFixed(this.props.decimalPlaces); // Arredonda para decimalPlaces

      value =
        this.props.valueType === "real" ? parseFloat(value) : parseInt(value);
    } else if (this.props.minValue !== null) {
      this.props.onLimitReached(false, "Reached Minimum Value!");

      value = this.props.minValue;
    }

    if (value !== this.props.value)
      this.props.onChange && this.props.onChange(Number(value));

    if (this.props.valueType === "real") {
      this.setState({ value, stringValue: this.formatNumber(value) });
    } else {
      this.setState({ value, stringValue: value.toString() });
    }
  };

  isLegalValue = (value, mReal, mInt) =>
    value === "" ||
    (((this.props.valueType === "real" && mReal(value)) ||
      (this.props.valueType !== "real" && mInt(value))) &&
      (this.props.maxValue === null ||
        parseFloat(value) <= this.props.maxValue) &&
      (this.props.minValue === null ||
        parseFloat(value) >= this.props.minValue));

  realMatch = (value) =>
    value &&
    value.match(/-?\d+(\.(\d+)?)?/) &&
    value.match(/-?\d+(\.(\d+)?)?/)[0] ===
      value.match(/-?\d+(\.(\d+)?)?/).input;

  intMatch = (value) =>
    value &&
    value.match(/-?\d+/) &&
    value.match(/-?\d+/)[0] === value.match(/-?\d+/).input;

  format(value) {
    const newValue = parseFloat(value.replace(",", "."));

    const numFormatted = newValue.toFixed(this.props.decimalPlaces);

    return numFormatted.replace(".", ",");
  }

  formatNumeric(value) {
    const numFormatted = value.toFixed(this.props.decimalPlaces);

    return numFormatted.replace(".", ",");
  }

  formatNumber = (value) => {
    // Se o valor não for um número, retorna '0.00' por padrão

    if (isNaN(value)) return `0${this.props.decimalSeparator}00`;

    // Arredonda o número para o número de casas decimais definido

    const roundedValue = (
      Math.round(value * Math.pow(10, this.props.decimalPlaces)) /
      Math.pow(10, this.props.decimalPlaces)
    ).toFixed(this.props.decimalPlaces);

    // Divide em parte inteira e decimal

    let [integerPart, decimalPart] = roundedValue.split(".");

    // Adiciona o separador de milhar

    integerPart = integerPart.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      this.props.thousandSeparator
    );

    // Retorna a string formatada

    return `${integerPart}${this.props.decimalSeparator}${decimalPart}`;
  };

  addDecimalSeparator(str) {
    return str.length < 2 ? str : str.slice(0, -2) + "," + str.slice(-2);
  }

  onChange = (input) => {
    if (isNaN(input.replace(",", "."))) {
      input = "0,00";
    } 

    let cleanedInput = input.replace(/[^0-9]/g, "");

    let newValue;

    if (this.props.valueType !== "real") {
      if (cleanedInput === '') {
        cleanedInput = 0;
      }
      newValue = parseInt(cleanedInput);
      this.setState({ stringValue: newValue.toString() });
      this.setState({ value: newValue });
      this.props.onChange(newValue);
      return;
    }

    newValue = this.addDecimalSeparator(cleanedInput);
    newValue = this.format(newValue);

    this.setState({ stringValue: newValue });

    this.setState({ value: parseFloat(newValue.replace(",", ".")) });

    this.props.onChange(parseFloat(newValue.replace(",", ".")));
  };

  onBlur = () => {};

  onFocus = () => {
    this.setState({ lastValid: this.state.value });

    this.props.onFocus && this.props.onFocus();
  };

  render() {
    const editable = this.props.editable;

    const sepratorWidth =
      typeof this.props.separatorWidth === "undefined"
        ? this.props.sepratorWidth
        : this.props.separatorWidth; //supporting old property name sepratorWidth

    const borderColor = this.props.borderColor;

    const iconStyleInc = [style.icon, this.props.iconStyleInc];

    const iconStyleDec = [style.icon, this.props.iconStyleDec];

    const totalWidth = this.props.totalWidth;

    const totalHeight = this.props.totalHeight
      ? this.props.totalHeight
      : totalWidth * 0.4;

    const inputWidth =
      this.props.type === "up-down" ? totalWidth * 0.6 : totalWidth * 0.4;

    const borderRadiusTotal = totalHeight * 0.18;

    const fontSize = totalHeight * 0.38;

    const textColor = this.props.textColor;

    const maxReached = this.state.value === this.props.maxValue;

    const minReached = this.state.value === this.props.minValue;

    const inputContainerStyle =
      this.props.type === "up-down"
        ? [
            style.inputContainerUpDown,
            {
              width: totalWidth,
              height: totalHeight,
              borderColor: borderColor,
            },
            this.props.rounded ? { borderRadius: borderRadiusTotal } : {},
            this.props.containerStyle,
          ]
        : [
            style.inputContainerPlusMinus,
            {
              width: totalWidth,
              height: totalHeight,
              borderColor: borderColor,
            },
            this.props.rounded ? { borderRadius: borderRadiusTotal } : {},
            this.props.containerStyle,
          ];

    const inputStyle =
      this.props.type === "up-down"
        ? [
            style.inputUpDown,
            {
              width: inputWidth,
              height: totalHeight,
              fontSize: fontSize,
              color: textColor,
              borderRightWidth: 2,
              borderRightColor: borderColor,
            },
            this.props.inputStyle,
          ]
        : [
            style.inputPlusMinus,
            {
              width: inputWidth,
              height: totalHeight,
              fontSize: fontSize,
              color: textColor,
              borderRightWidth: sepratorWidth,
              borderLeftWidth: sepratorWidth,
              borderLeftColor: borderColor,
              borderRightColor: borderColor,
            },
            this.props.inputStyle,
          ];

    const upDownStyle = [
      {
        alignItems: "center",
        width: totalWidth - inputWidth,
        backgroundColor: this.props.upDownButtonsBackgroundColor,
        borderRightWidth: 1,
        borderRightColor: borderColor,
      },
      this.props.rounded
        ? {
            borderTopRightRadius: borderRadiusTotal,
            borderBottomRightRadius: borderRadiusTotal,
          }
        : {},
    ];

    const rightButtonStyle = [
      {
        position: "absolute",

        zIndex: -1,

        right: 0,

        height: totalHeight - 2,

        justifyContent: "center",

        alignItems: "center",

        borderWidth: 0,

        backgroundColor: this.props.rightButtonBackgroundColor,

        width: (totalWidth - inputWidth) / 2,
      },

      this.props.rounded
        ? {
            borderTopRightRadius: borderRadiusTotal,

            borderBottomRightRadius: borderRadiusTotal,
          }
        : {},
    ];

    const leftButtonStyle = [
      {
        position: "absolute",

        zIndex: -1,

        left: 0,

        height: totalHeight - 2,

        justifyContent: "center",

        alignItems: "center",

        backgroundColor: this.props.leftButtonBackgroundColor,

        width: (totalWidth - inputWidth) / 2,

        borderWidth: 0,
      },

      this.props.rounded
        ? {
            borderTopLeftRadius: borderRadiusTotal,
            borderBottomLeftRadius: borderRadiusTotal,
          }
        : {},
    ];

    const inputWraperStyle = {
      alignSelf: "center",

      borderLeftColor: borderColor,

      borderLeftWidth: sepratorWidth,

      borderRightWidth: sepratorWidth,

      borderRightColor: borderColor,
    };

    if (this.props.type === "up-down")
      return (
        <View style={inputContainerStyle}>
          <TextInput
            {...this.props.extraTextInputProps}
            editable={editable}
            returnKeyType="done"
            underlineColorAndroid="rgba(0,0,0,0)"
            keyboardType="numeric"
            value={this.state.stringValue}
            onChangeText={this.onChange}
            style={inputStyle}
            ref={(ref) => (this.ref = ref)}
            onBlur={this.onBlur}
            onFocus={this.onFocus}
          />

          <View style={upDownStyle}>
            {this.props.renderedIcons && (
              <Button
                onPress={this.inc}
                style={{ flex: 1, width: "100%", alignItems: "center" }}
              >
                <Icon
                  name="ios-arrow-up"
                  size={fontSize}
                  style={[
                    ...iconStyleInc,
                    maxReached ? this.props.reachMaxIncIconStyle : {},
                    minReached ? this.props.reachMinIncIconStyle : {},
                  ]}
                />
              </Button>
            )}

            {this.props.renderedIcons && (
              <Button
                onPress={this.dec}
                style={{ flex: 1, width: "100%", alignItems: "center" }}
              >
                <Icon
                  name="ios-arrow-down"
                  size={fontSize}
                  style={[
                    ...iconStyleDec,
                    maxReached ? this.props.reachMaxDecIconStyle : {},
                    minReached ? this.props.reachMinDecIconStyle : {},
                  ]}
                />
              </Button>
            )}
          </View>
        </View>
      );
    else
      return (
        <View style={inputContainerStyle}>
          {this.props.renderedIcons && (
            <Button onPress={this.dec} style={leftButtonStyle}>
              <Icon
                name="md-remove"
                size={fontSize}
                style={[
                  ...iconStyleDec,
                  maxReached ? this.props.reachMaxDecIconStyle : {},
                  minReached ? this.props.reachMinDecIconStyle : {},
                ]}
              />
            </Button>
          )}

          <View style={[inputWraperStyle]}>
            <TextInput
              {...this.props.extraTextInputProps}
              editable={editable}
              returnKeyType="done"
              underlineColorAndroid="rgba(0,0,0,0)"
              keyboardType="numeric"
              value={this.state.stringValue}
              onChangeText={this.onChange}
              style={inputStyle}
              ref={(ref) => (this.ref = ref)}
              onBlur={this.onBlur}
              onFocus={this.onFocus}
            />
          </View>

          {this.props.renderedIcons && (
            <Button onPress={this.inc} style={rightButtonStyle}>
              <Icon
                name="md-add"
                size={fontSize}
                style={[
                  ...iconStyleInc,
                  maxReached ? this.props.reachMaxIncIconStyle : {},
                  minReached ? this.props.reachMinIncIconStyle : {},
                ]}
              />
            </Button>
          )}
        </View>
      );
  }
}

const style = StyleSheet.create({
  seprator: {
    backgroundColor: "grey",

    height: calcSize(80),
  },

  inputContainerUpDown: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    borderColor: "grey",

    borderWidth: 1,
  },

  inputContainerPlusMinus: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 1,
  },

  inputUpDown: {
    textAlign: "center",

    padding: 0,
  },

  inputPlusMinus: {
    textAlign: "center",

    padding: 0,
  },

  icon: {
    fontWeight: "900",

    backgroundColor: "rgba(0,0,0,0)",
  },

  upDown: {
    alignItems: "center",

    paddingRight: calcSize(15),
  },
});

NumericInput.propTypes = {
  iconSize: PropTypes.number,

  borderColor: PropTypes.string,

  iconStyleDec: PropTypes.any,

  iconStyleInc: PropTypes.any,

  totalWidth: PropTypes.number,

  totalHeight: PropTypes.number,

  sepratorWidth: PropTypes.number,

  type: PropTypes.oneOf(["up-down", "plus-minus"]),

  valueType: PropTypes.oneOf(["real", "integer"]),

  rounded: PropTypes.any,

  textColor: PropTypes.string,

  containerStyle: PropTypes.any,

  inputStyle: PropTypes.any,

  initValue: PropTypes.number,

  onChange: PropTypes.func.isRequired,

  onLimitReached: PropTypes.func,

  value: PropTypes.number,

  minValue: PropTypes.number,

  maxValue: PropTypes.number,

  step: PropTypes.number,

  upDownButtonsBackgroundColor: PropTypes.string,

  rightButtonBackgroundColor: PropTypes.string,

  leftButtonBackgroundColor: PropTypes.string,

  editable: PropTypes.bool,

  reachMaxIncIconStyle: PropTypes.any,

  reachMaxDecIconStyle: PropTypes.any,

  reachMinIncIconStyle: PropTypes.any,

  reachMinDecIconStyle: PropTypes.any,

  extraTextInputProps: PropTypes.any,

  decimalSeparator: PropTypes.string,

  thousandSeparator: PropTypes.string,

  decimalPlaces: PropTypes.number,

  renderedIcons: PropTypes.bool,
};

NumericInput.defaultProps = {
  iconSize: calcSize(30),

  borderColor: "#d4d4d4",

  iconStyleInc: {},

  iconStyleDec: {},

  totalWidth: calcSize(220),

  sepratorWidth: 1,

  type: "plus-minus",

  rounded: false,

  textColor: "black",

  containerStyle: {},

  inputStyle: {},

  initValue: null,

  valueType: "integer",

  value: null,

  minValue: null,

  maxValue: null,

  step: 1,

  upDownButtonsBackgroundColor: "white",

  rightButtonBackgroundColor: "white",

  leftButtonBackgroundColor: "white",

  editable: true,

  validateOnBlur: true,

  reachMaxIncIconStyle: {},

  reachMaxDecIconStyle: {},

  reachMinIncIconStyle: {},

  reachMinDecIconStyle: {},

  onLimitReached: (isMax, msg) => {},

  extraTextInputProps: {},

  decimalSeparator: ".",

  thousandSeparator: ",",

  decimalPlaces: 0,

  renderedIcons: true,
};
