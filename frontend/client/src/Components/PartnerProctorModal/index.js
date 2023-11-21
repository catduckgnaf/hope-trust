import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Modal } from "react-responsive-modal";
import { closeProctorForm, updateQuizResponse } from "../../store/actions/class-marker";
import ReactSelect from "react-select";
import LoaderOverlay from "../../Components/LoaderOverlay";
import {
  Button,
  InputWrapper,
  InputLabel,
  SelectStyles,
  Input,
  CheckBoxLabel,
  CheckBoxInput,
  RequiredStar,
} from "../../global-components";
import { US_STATES } from "../../utilities";
import {
  ModalInner,
  ModalTitle,
  ModalButtonContainer,
  ModalConfirmationSection,
  ModalAttestationLanguage,
  AttestationSection,
  ModalRow,
  ModalCol,
  ModalForm,
  ModalBody,
  ModalNote,
  ModalNotePadding,
  ModalNoteInner
} from "./style";

class PartnerProctorModal extends Component {

  constructor(props) {
    super(props);
    const { class_marker, ce_config } = this.props;
    const records = ce_config.list;
    const config_record = records.find((c) => c.state === class_marker.focus.state.state);
    this.state = {
      config: config_record,
      first_name: "",
      last_name: "",
      email: "",
      state: null,
      attested: false,
      address: "",
      address2: "",
      city: "",
      zip: "",
      saving: false
    };
  }

  submitCertification = async () => {
    const { first_name, last_name, email, state, address, city, zip } = this.state;
    const { updateQuizResponse, closeProctorForm, class_marker } = this.props;
    const response = class_marker.responses.find((r) => r.quiz_id === class_marker.focus.quiz_id);
    if (response && this.isComplete()) {
      this.setState({ saving: true });
      await updateQuizResponse(response.id, {
        proctor_first_name: first_name,
        proctor_last_name: last_name,
        proctor_email: email,
        proctor_state: state.label,
        proctor_address: address,
        proctor_city: city,
        proctor_zip: zip
      });
      closeProctorForm();
    }
  };

  isComplete = () => {
    const { first_name, last_name, email, state, attested, address, city, zip } = this.state;
    return first_name && last_name && email && state && attested && address && city && zip;
  };

  getProctorLanguage = (text, user) => {
    return text.replace(/{{([^}]+)}}/g, function (match, string) {
      var fallback = "";
      var stringArr = string.split("|");
      var value = stringArr[0].trim();

      if (stringArr[1]) { fallback = stringArr[1].match(/(?!fallback:\s?)(["'].*?["'])/)[0].replace(/["']/g, "").trim(); }
      return user[value] ? user[value] : fallback;
    });
  };

  render() {
    const { user, defaults } = this.props;
    const { saving, config, attested, state, first_name, last_name, email, address, address2, city, zip } = this.state;
    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "675px", width: "100%", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={true} closeOnEsc={false} showCloseIcon={false} blockScroll closeOnOverlayClick={false} center>
        <ModalInner align="middle" justify="center" isloading={saving ? 1 : 0}>
          <LoaderOverlay show={saving} message="Saving..." />
          <ModalBody>
            <ModalTitle>Proctor Affidavit</ModalTitle>
            {config.virtual_proctor
              ? (
                <ModalNote>
                  <ModalNotePadding>
                    <ModalNoteInner>Note: {defaults.state.name} is currently allowing a virtual proctor. The use of tools such as Skype, Microsoft Teams, Zoom and other similar products will be allowed for remote proctoring.</ModalNoteInner>
                  </ModalNotePadding>
                </ModalNote>
              )
              : null
            }
            <ModalForm>
              <ModalRow>
                <ModalCol span={6}>
                  <InputWrapper>
                    <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> First Name</InputLabel>
                    <Input placeholder="John" type="text" value={first_name} onChange={(event) => this.setState({ first_name: event.target.value })} />
                  </InputWrapper>
                </ModalCol>
                <ModalCol span={6}>
                  <InputWrapper>
                    <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Last Name</InputLabel>
                    <Input placeholder="Smith" type="text" value={last_name} onChange={(event) => this.setState({ last_name: event.target.value })} />
                  </InputWrapper>
                </ModalCol>
                <ModalCol span={12}>
                  <InputWrapper>
                    <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Email Address</InputLabel>
                    <Input placeholder="john@domain.com" type="text" value={email} onChange={(event) => this.setState({ email: event.target.value })} />
                  </InputWrapper>
                </ModalCol>
                <ModalCol span={12}>
                  <InputWrapper>
                    <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Address</InputLabel>
                    <Input placeholder="123 Hope Street" type="text" value={address} onChange={(event) => this.setState({ address: event.target.value })} />
                  </InputWrapper>
                </ModalCol>
                <ModalCol span={12}>
                  <InputWrapper>
                    <InputLabel marginbottom={10}>Address 2</InputLabel>
                    <Input placeholder="Suite 101" type="text" value={address2} onChange={(event) => this.setState({ address2: event.target.value })} />
                  </InputWrapper>
                </ModalCol>
                <ModalCol span={6}>
                  <InputWrapper>
                    <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> City</InputLabel>
                    <Input placeholder="Chicago" type="text" value={city} onChange={(event) => this.setState({ city: event.target.value })} />
                  </InputWrapper>
                </ModalCol>
                <ModalCol span={6}>
                  <InputWrapper>
                    <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Zip Code</InputLabel>
                    <Input placeholder="09976" type="text" value={zip} onChange={(event) => this.setState({ zip: event.target.value })} />
                  </InputWrapper>
                </ModalCol>
                <ModalCol span={12}>
                  <InputWrapper>
                    <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> State</InputLabel>
                    <ReactSelect
                      styles={{
                        container: (base, state) => ({
                          ...base,
                          opacity: state.isDisabled ? ".5" : "1",
                          backgroundColor: "transparent",
                          zIndex: 992
                        }),
                        multiValue: (base) => ({
                          ...base,
                          borderRadius: "15px",
                          padding: "2px 10px"
                        }),
                        menu: (base) => ({
                          ...base,
                          zIndex: 992
                        }),
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 992
                        }),
                        placeholder: (base) => ({
                          ...base,
                          fontWeight: 300,
                          fontSize: "12px",
                          lineHeight: "13px",
                          opacity: "0.5"
                        }),
                        control: (base) => ({
                          ...base,
                          ...SelectStyles
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          fontSize: "13px",
                          paddingLeft: 0
                        })
                      }}
                      isClearable
                      isSearchable
                      name="state"
                      placeholder="Choose a US state..."
                      onChange={(state) => this.setState({ state })}
                      value={state}
                      options={US_STATES.map((state) => {
                        return { value: state, label: state.name };
                      })}
                    />
                  </InputWrapper>
                </ModalCol>
                {config
                  ? (
                    <ModalCol span={12}>
                      <ModalAttestationLanguage>
                        <AttestationSection>{this.getProctorLanguage(config.proctor_language, user)}</AttestationSection>
                      </ModalAttestationLanguage>
                    </ModalCol>
                  )
                  : null
                }
                {config
                  ? (
                    <ModalCol span={12}>
                      <ModalConfirmationSection>
                        <InputWrapper>
                          <CheckBoxLabel>
                            <CheckBoxInput
                              defaultChecked={attested}
                              onChange={(event) => this.setState({ attested: event.target.checked })}
                              type="checkbox"
                              id="attested"
                            /> <RequiredStar>*</RequiredStar> By checking this box and providing my information above, I acknowledge this is serving as my digital signature.</CheckBoxLabel>
                        </InputWrapper>
                      </ModalConfirmationSection>
                    </ModalCol>
                  )
                  : null
                }
                <ModalCol span={12}>
                  <ModalRow>
                    <ModalButtonContainer span={12}>
                      {this.isComplete()
                        ? <Button type="button" onClick={() => this.submitCertification()} blue>Certify</Button>
                        : <Button disabled type="button" blue>Certify</Button>
                      }
                    </ModalButtonContainer>
                  </ModalRow>
                </ModalCol>
              </ModalRow>
            </ModalForm>
          </ModalBody>
        </ModalInner>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  class_marker: state.class_marker,
  user: state.user,
  ce_config: state.ce_config
});
const dispatchToProps = (dispatch) => ({
  closeProctorForm: () => dispatch(closeProctorForm()),
  updateQuizResponse: (ID, updates) => dispatch(updateQuizResponse(ID, updates))
});
export default connect(mapStateToProps, dispatchToProps)(PartnerProctorModal);
