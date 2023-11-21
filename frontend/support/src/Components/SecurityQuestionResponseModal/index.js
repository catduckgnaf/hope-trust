import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { Modal } from "react-responsive-modal";
import ReactSelect, { createFilter, components } from "react-select";
import ReactAvatar from "react-avatar";
import { closeSecurityQuestionResponseModal, getUserSecurityQuestionResponse } from "../../store/actions/security-questions";
import {
  SecurityQuestionMainContent,
  ViewSecurityQuestionModalInner,
  ViewSecurityQuestionModalInnerLogo,
  ViewSecurityQuestionModalInnerLogoImg,
  ViewSecurityQuestionModalInnerHeader,
  OptionContainer,
  OptionImageContainer,
  OptionTextContainer
} from "./style";
import {
  Button,
  InputWrapper,
  InputLabel,
  TextArea,
  Input,
  SelectStyles
} from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";
import { numbersLettersUnderscoresHyphens, capitalize } from "../../utilities";

const Option = (props) => {
  return (
    <components.Option {...props}>
      <OptionContainer>
        <OptionImageContainer><ReactAvatar size={25} src={`https://${process.env.REACT_APP_STAGE || "development"}-api.hopecareplan.com/support/users/get-user-avatar/${props.data.value}`} name={props.data.label} round /></OptionImageContainer>
        <OptionTextContainer>{props.data.label}</OptionTextContainer>
      </OptionContainer>
    </components.Option>
  );
};

class SecurityQuestionCreateModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    closeSecurityQuestionResponseModal: PropTypes.func.isRequired,
    createSecurityQuestion: PropTypes.func.isRequired,
    updateSecurityQuestionRecord: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { defaults = {}, customer_support } = this.props;
    const users = customer_support.users.filter((u) => defaults.respondents.includes(u.cognito_id)).map((u) => {
      return { label: capitalize(u.name), value: u.cognito_id };
    });
    this.state = {
      loaderShow: false,
      loaderMessage: "",
      users,
      respondent: null,
      answer: ""
    };
  }

  getResponse = async (respondent) => {
    const { defaults, getUserSecurityQuestionResponse } = this.props;
    this.setState({ loaderShow: true, loaderMessage: "Fetching Response..." });
    const response = await getUserSecurityQuestionResponse(defaults.id, respondent.value);
    if (response.success) this.setState({ respondent, answer: response.payload.answer });
    this.setState({ loaderShow: false });
  };

  render() {
    const { viewing_response, closeSecurityQuestionResponseModal, defaults, viewing } = this.props;
    const { loaderShow, loaderMessage, users, respondent, answer } = this.state;

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "650px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={viewing_response} onClose={() => closeSecurityQuestionResponseModal()} center>
        <ViewSecurityQuestionModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewSecurityQuestionModalInnerLogo span={12}>
              <ViewSecurityQuestionModalInnerLogoImg alt="HopeTrust Security Question Logo" src={icons.colorLogoOnly} />
            </ViewSecurityQuestionModalInnerLogo>
          </Col>
          <SecurityQuestionMainContent span={12}>
            <Row>
              <ViewSecurityQuestionModalInnerHeader span={12}>Viewing Security Question Response</ViewSecurityQuestionModalInnerHeader>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Respondent</InputLabel>
                  <ReactSelect
                    components={{ Option }}
                    filterOption={createFilter({ ignoreAccents: false })}
                    styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent"
                      }),
                      multiValue: (base) => ({
                        ...base,
                        borderRadius: "15px",
                        padding: "2px 10px"
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontWeight: 300,
                        fontSize: "13px",
                        lineHeight: "13px"
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
                    isSearchable
                    name="new_member"
                    placeholder="Choose a user from the list..."
                    onChange={(select_account) => select_account ? this.getResponse(select_account) : null}
                    value={respondent}
                    options={users}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Question:</InputLabel>
                  <Input readOnly={viewing} type="text" value={defaults.question} />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Response: ({255 - answer.length} characters remaining)</InputLabel>
                  <TextArea disabled={viewing} value={answer} maxLength={255} onKeyPress={numbersLettersUnderscoresHyphens} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 255)} rows={4} placeholder="Add a response..."></TextArea>
                </InputWrapper>
              </Col>

              <Col span={12}>
                <Button type="button" onClick={() => closeSecurityQuestionResponseModal()} outline danger rounded>Close</Button>
              </Col>
            </Row>
          </SecurityQuestionMainContent>
        </ViewSecurityQuestionModalInner>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session,
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({
  closeSecurityQuestionResponseModal: () => dispatch(closeSecurityQuestionResponseModal()),
  getUserSecurityQuestionResponse: (question_id, cognito_id) => dispatch(getUserSecurityQuestionResponse(question_id, cognito_id))
});
export default connect(mapStateToProps, dispatchToProps)(SecurityQuestionCreateModal);
