import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Modal } from "react-responsive-modal";
import { closeQuizAttestation, openQuiz } from "../../store/actions/class-marker";
import { updateUser } from "../../store/actions/user";
import { updatePartner } from "../../store/actions/partners";
import LoaderOverlay from "../../Components/LoaderOverlay";
import { getCEConfigs } from "../../store/actions/ce-management";
import { limitInput } from "../../utilities";
import moment from "moment";
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
import ReactSelect from "react-select";
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
  SignatureContainer,
  SignatureContainerPadding,
  SignatureContainerInner,
  SignatureText,
  SignatureDate,
  ModalNote,
  ModalNotePadding,
  ModalNoteInner
} from "./style";
import { orderBy } from "lodash";

class PartnerAttestationModal extends Component {

  constructor(props) {
    super(props);
    const { ce_config } = this.props;
    const records = ce_config.list;
    this.state = {
      attested: false,
      intro_statement: false,
      saving: false,
      records
    };
  }

  submitAttestation = async () => {
    const { address, address2, city, state, zip, resident_state_license_number, npn } = this.state;
    const { updateUser, updatePartner, openQuiz, class_marker } = this.props;
    if (this.isComplete()) {
      this.setState({ saving: true });
      await updateUser({ address, address2, city, state: state.label, zip });
      await updatePartner({ resident_state_license_number, npn });
      openQuiz(class_marker.focus, state.value);
    }
  };

  isComplete = () => {
    const { state, attested, intro_statement, address, city, zip, resident_state_license_number, npn } = this.state;
    return state && attested && address && city && zip && resident_state_license_number && npn && (state.value.introduction_statement_link ? intro_statement : true);
  };

  async componentDidMount() {
    const { getCEConfigs, ce_config, user } = this.props;
    if (!ce_config.requested && !ce_config.isFetching) await getCEConfigs();
    const records = ce_config.list;
    const current_state = user.state;
    const US_STATE = US_STATES.find((state) => state.name === current_state);
    const config_record = records.find((c) => (c.state && c.status === "active") && (c.state === US_STATE.name));
    const is_active = US_STATE && config_record;
    this.setState({
      records,
      state: is_active ? { value: { ...US_STATE, ...config_record }, label: config_record.state } : null,
      attested: false,
      intro_statement: false,
      address: is_active ? user.address : "",
      address2: is_active ? user.address2 : "",
      city: is_active ? user.city : "",
      zip: is_active ? user.zip : "",
      resident_state_license_number: user.partner_data.resident_state_license_number,
      npn: user.partner_data.npn,
      saving: false
    });
  }

  getStudentAttestation = (text, user) => {
    return text.replace(/{{([^}]+)}}/g, function (match, string) {
      var fallback = "";
      var stringArr = string.split("|");
      var value = stringArr[0].trim();

      if (stringArr[1]) { fallback = stringArr[1].match(/(?!fallback:\s?)(["'].*?["'])/)[0].replace(/["']/g, "").trim(); }
      return user[value] ? user[value] : fallback;
    });
  };

  render() {
    const { closeQuizAttestation, user } = this.props;
    const {
      state,
      address,
      address2,
      city,
      zip,
      attested,
      intro_statement,
      resident_state_license_number,
      npn,
      saving,
      records
    } = this.state;
    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "675px", width: "100%", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={true} closeOnEsc={false} showCloseIcon={false} blockScroll closeOnOverlayClick={false} center>
        <ModalInner align="middle" justify="center" isloading={saving ? 1 : 0}>
          <LoaderOverlay show={saving} message="Validating..." />
          <ModalBody>
            <ModalTitle>Student Attestation</ModalTitle>
            <ModalForm>
              <ModalRow>
                <ModalCol xs={12} sm={12} md={6} lg={6} xl={6}>
                  <InputWrapper>
                    <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> What is your first name?</InputLabel>
                    <Input type="text" value={user.first_name} readOnly />
                  </InputWrapper>
                </ModalCol>
                <ModalCol xs={12} sm={12} md={6} lg={6} xl={6}>
                  <InputWrapper>
                    <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> What is your last name?</InputLabel>
                    <Input type="text" value={user.last_name} readOnly />
                  </InputWrapper>
                </ModalCol>
                <ModalCol span={12}>
                  <InputWrapper>
                    <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Email Address</InputLabel>
                    <Input type="text" value={user.email} readOnly />
                  </InputWrapper>
                </ModalCol>
                <ModalCol span={12}>
                  <InputWrapper>
                    <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Resident Address</InputLabel>
                    <Input type="text" value={address} onChange={(event) => this.setState({ address: event.target.value })} />
                  </InputWrapper>
                </ModalCol>
                <ModalCol span={12}>
                  <InputWrapper>
                    <InputLabel marginbottom={10}>Resident Address 2</InputLabel>
                    <Input type="text" value={address2} onChange={(event) => this.setState({ address2: event.target.value })} />
                  </InputWrapper>
                </ModalCol>
                <ModalCol xs={12} sm={12} md={6} lg={6} xl={6}>
                  <InputWrapper>
                    <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Resident City</InputLabel>
                    <Input type="text" value={city} onChange={(event) => this.setState({ city: event.target.value })} />
                  </InputWrapper>
                </ModalCol>
                <ModalCol xs={12} sm={12} md={6} lg={6} xl={6}>
                  <InputWrapper>
                    <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Resident Zip Code</InputLabel>
                    <Input type="text" value={zip} onChange={(event) => this.setState({ zip: event.target.value })} />
                  </InputWrapper>
                </ModalCol>
                <ModalCol span={12}>
                  <InputWrapper>
                    <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Resident State</InputLabel>
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
                      name="resident_state"
                      placeholder="Choose a US state..."
                      onChange={(state) => this.setState({ state })}
                      value={state}
                      options={orderBy(records, "state", "asc").map((s) => {
                        return { value: s, label: s.status === "inactive" ? `${s.state} (Pending State Approval)` : s.state, isDisabled: s.status === "inactive" };
                      })}
                    />
                  </InputWrapper>
                </ModalCol>
                {state
                  ? (
                    <ModalCol span={12}>
                      <ModalRow>
                        <ModalCol xs={12} sm={12} md={6} lg={6} xl={6}>
                          <InputWrapper>
                            <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Resident State License Number</InputLabel>
                            <Input type="text" value={resident_state_license_number} onKeyPress={(event) => limitInput(event, 100)} onChange={(event) => this.setState({ resident_state_license_number: event.target.value })} />
                          </InputWrapper>
                        </ModalCol>
                        <ModalCol xs={12} sm={12} md={6} lg={6} xl={6}>
                          <InputWrapper>
                            <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> National Producer Number (NPN)</InputLabel>
                            <Input type="number" min={0} pattern="\d*" step="1" inputMode="numeric" value={npn} onKeyPress={(event) => limitInput(event, 100)} onChange={(event) => this.setState({ npn: event.target.value })} />
                          </InputWrapper>
                        </ModalCol>
                      </ModalRow>
                      {state.value.proctor_required
                        ? (
                          <ModalNote>
                            <ModalNotePadding>
                              <ModalNoteInner>Note: {state.value.name} is currently allowing a virtual proctor. The use of tools such as Skype, Microsoft Teams, Zoom and other similar products will be allowed for remote proctoring.</ModalNoteInner>
                            </ModalNotePadding>
                          </ModalNote>
                        )
                        : null
                      }
                      {resident_state_license_number && npn
                        ? (
                          <ModalRow>
                            <ModalCol span={12}>
                              <ModalAttestationLanguage>
                                <AttestationSection>{this.getStudentAttestation(state.value.student_attestation, user)}</AttestationSection>
                                <AttestationSection margintop={20}><RequiredStar>*</RequiredStar><RequiredStar>*</RequiredStar> {state.value.student_attestation_note}</AttestationSection>
                                <SignatureContainer>
                                  <SignatureContainerPadding>
                                    <SignatureContainerInner>
                                      <SignatureText>{user.first_name} {user.last_name}</SignatureText>
                                      <SignatureDate>{moment().format("dddd, MMMM D, YYYY")}</SignatureDate>
                                    </SignatureContainerInner>
                                  </SignatureContainerPadding>
                                </SignatureContainer>
                              </ModalAttestationLanguage>
                            </ModalCol>
                            {state.value.introduction_statement_link
                              ? (
                                <ModalCol span={12}>
                                  <ModalConfirmationSection>
                                    <InputWrapper marginbottom={1}>
                                      <CheckBoxLabel>
                                        <CheckBoxInput
                                          defaultChecked={intro_statement}
                                          onChange={(event) => this.setState({ intro_statement: event.target.checked })}
                                          type="checkbox"
                                          id="intro_statement"
                                        /> <RequiredStar>*</RequiredStar> As a {state.label} resident, I have viewed the <a href={state.value.introduction_statement_link} target="_blank" rel="noopener noreferrer">CE Course Introduction Statement/Instructions</a></CheckBoxLabel>
                                    </InputWrapper>
                                  </ModalConfirmationSection>
                                </ModalCol>
                              )
                              : null
                            }
                            <ModalCol span={12}>
                              <ModalConfirmationSection>
                                <InputWrapper marginbottom={1}>
                                  <CheckBoxLabel>
                                    <CheckBoxInput
                                      defaultChecked={attested}
                                      onChange={(event) => this.setState({ attested: event.target.checked })}
                                      type="checkbox"
                                      id="attested"
                                    /> <RequiredStar>*</RequiredStar> By checking this box, I acknowledge this is serving as my digital signature.</CheckBoxLabel>
                                </InputWrapper>
                              </ModalConfirmationSection>
                            </ModalCol>
                          </ModalRow>
                        )
                        : null
                      }
                    </ModalCol>
                  )
                  : null
                }
                <ModalCol span={12}>
                  <ModalRow>
                    <ModalButtonContainer span={12}>
                      {this.isComplete()
                        ? <Button type="button" onClick={() => this.submitAttestation()} blue>I Agree</Button>
                        : <Button disabled type="button" blue>I Agree</Button>
                      }
                      <Button type="button" onClick={() => closeQuizAttestation()} danger>Cancel</Button>
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
  user: state.user,
  class_marker: state.class_marker,
  ce_config: state.ce_config
});
const dispatchToProps = (dispatch) => ({
  closeQuizAttestation: () => dispatch(closeQuizAttestation()),
  updateUser: (updates) => dispatch(updateUser(updates)),
  updatePartner: (updates) => dispatch(updatePartner(updates)),
  openQuiz: (quiz, state) => dispatch(openQuiz(quiz, state)),
  getCEConfigs: (override) => dispatch(getCEConfigs(override))
});
export default connect(mapStateToProps, dispatchToProps)(PartnerAttestationModal);
