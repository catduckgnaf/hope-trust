import React, { Component } from "react";
import {
  SwitchWrap,
  Switch,
  SwitchCheck,
  SwitchSlider,
  SwitchLabel
} from "./style";

class ToggleSwitch extends Component {

  render() {
    const { value, float, checked, label, label2, onChange, id } = this.props;
    return (
      <SwitchWrap float={float}>
        {label
          ? <SwitchLabel>{label}</SwitchLabel>
          : null
        }
        <Switch>
          <SwitchCheck id={id} type="checkbox" checked={checked} value={value} onChange={onChange}/> <SwitchSlider />
        </Switch>
        {label2
          ? <SwitchLabel>{label2}</SwitchLabel>
          : null
        }
      </SwitchWrap>
    );
  }
}

export default ToggleSwitch;
