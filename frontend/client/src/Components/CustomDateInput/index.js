import React, { Component } from "react";
import {
    CustomDate
} from "./style";

class CustomDateInput extends Component {
  render() {
    const {
      onClick,
      onBlur,
      placeholder,
      value,
      disabled,
      flat = false
    } = this.props;

    return <CustomDate flat={flat ? 1 : 0} placeholder={placeholder} value={value} onClick={onClick} onChange={() => console.log("Date input updated")} onBlur={onBlur} disabled={disabled} />;
  }
}

export default CustomDateInput;