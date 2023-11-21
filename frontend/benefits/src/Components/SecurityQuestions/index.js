import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { merge } from "lodash";
import { Row, Col } from "react-simple-flex-grid";
import { showNotification } from "../../store/actions/notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createSecurityQuestionResponse } from "../../store/actions/security-questions";
import {
  InputWrapper,
  SelectWrapper,
  InputLabel,
  Input,
  Select,
  RequiredStar,
  Button
} from "../../global-components";
import {
  RowHeader,
  RowBody,
  RowBodyPadding,
  RowContentSection,
  SettingsButtonContainer
} from "../../Pages/Settings/style";

const capitalize = (str, lower = false) =>
  ((lower ? str.toLowerCase() : str) || "").replace(/(?:^|\s|["'(/[{])+\S/g, (match) => match.toUpperCase());

class SecurityQuestions extends Component {

  static propTypes = {
    createSecurityQuestionResponse: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { security } = props;
    this.state = {
      securityQuestionInfo: {},
      questions: security.questions || [],
      responses: security.responses,
      is_loading: false
    };
  }


componentDidMount() {
  this.setupSecurityQuestions();
}

  setupSecurityQuestions = async () => {
    const { security, showNotification, location } = this.props;
    const { securityQuestionInfo, questions, responses } = this.state;

    if (responses && responses.length) {
      let securityQuestionInfoUpdated = {};
      responses.forEach((response, index) => {
        const match = questions.find((question) => question.id === response.question_id);
        securityQuestionInfoUpdated[`security_question_${index + 1}`] = match.question;
        securityQuestionInfoUpdated[`security_question_answer_id_${index + 1}`] = match.id;
        securityQuestionInfo[`security_question_answer_${index + 1}`] = response.answer;
      });
      const newState = merge(securityQuestionInfo, securityQuestionInfoUpdated );
      this.setState({ securityQuestionInfo: newState });
    } else {
      let random = questions.sort(() => .5 - Math.random()).slice(0,3);
      if (random.length >= 2) {
        this.setState({
          securityQuestionInfo: {
            security_question_1: random[0].question,
            security_question_2: random[1].question,
            security_question_3: random[2].question,
            security_question_answer_id_1: random[0].id,
            security_question_answer_id_2: random[1].id,
            security_question_answer_id_3: random[2].id
          }
        }, () => {
          if (!location.query.tab && !security.isFetching && !security.isFetchingResponses) showNotification("warning", "Security Questions", "To keep your account as secure as possible, you must complete your security questions.");
        });
      }
    }
  };

  setSecurityQuestion = (event) => {
    let updates = { [event.target.id]: event.target.value };
    if (event && !event.target.id.includes("answer")) {
      var optionElement = event.target.options[event.target.selectedIndex];
      const objectId = optionElement.getAttribute("id");
      const questionId = optionElement.getAttribute("data-questionId");
      updates[objectId] = questionId;
    }
    const newState = merge(this.state.securityQuestionInfo, updates);
    this.setState({ securityQuestionInfo: newState });
  };

  saveSecurityQuestions = async () => {
    const { createSecurityQuestionResponse, showNotification } = this.props;
    const { securityQuestionInfo } = this.state;
    let promises = [];
    if (securityQuestionInfo.security_question_1 &&
      securityQuestionInfo.security_question_answer_1 &&
      securityQuestionInfo.security_question_answer_id_1) {
      promises.push(createSecurityQuestionResponse(securityQuestionInfo.security_question_answer_1, securityQuestionInfo.security_question_answer_id_1));
    }
    if (securityQuestionInfo.security_question_2 &&
      securityQuestionInfo.security_question_answer_2 &&
      securityQuestionInfo.security_question_answer_id_2) {
      promises.push(createSecurityQuestionResponse(securityQuestionInfo.security_question_answer_2, securityQuestionInfo.security_question_answer_id_2));
    }
    if (securityQuestionInfo.security_question_3 &&
      securityQuestionInfo.security_question_answer_3 &&
      securityQuestionInfo.security_question_answer_id_3) {
      promises.push(createSecurityQuestionResponse(securityQuestionInfo.security_question_answer_3, securityQuestionInfo.security_question_answer_id_3));
    }
    this.setState({ is_loading: true });
    await Promise.all(promises);
    this.setState({ is_loading: false });
    showNotification("success", "", "Security questions updated");
  };

  render() {
    const { securityQuestionInfo, questions, is_loading } = this.state;
    const notAvailable = [securityQuestionInfo.security_question_1, securityQuestionInfo.security_question_2, securityQuestionInfo.security_question_3];
    const optionQuestions = {};
    questions.forEach((question) => {
      if (optionQuestions[question.category]) {
        optionQuestions[question.category].push({ question: question.question, id: question.id });
      } else {
        optionQuestions[question.category] = [{ question: question.question, id: question.id }];
      }
    });
    return (
      <RowBody id="security-questions">
        <RowHeader>
          <Row>
            <Col>Security</Col>
          </Row>
        </RowHeader>
        <RowBodyPadding paddingbottom={1}>
          <RowContentSection xs={12} sm={12} md={12} lg={12} xl={12}>
            <SelectWrapper>
              <InputLabel>Security Question 1</InputLabel>
              <Select
                id="security_question_1"
                value={securityQuestionInfo.security_question_1}
                onChange={this.setSecurityQuestion}>
                <option disabled value="">Choose a security question</option>
                {Object.keys(optionQuestions).map((group_key, groupIndex) => {
                  return (
                    <optgroup key={groupIndex} label={capitalize(group_key)}>
                      {optionQuestions[group_key].map((item, itemIndex) => {
                        return (
                          <option disabled={notAvailable.includes(item.question)} key={itemIndex} id="security_question_answer_id_1" data-questionid={item.id} value={item.question}>{item.question}</option>
                        );
                      })}
                    </optgroup>
                  );
                })}
              </Select>

            </SelectWrapper>
            <InputWrapper>
              <InputLabel><RequiredStar>*</RequiredStar> Answer</InputLabel>
              <Input
                id="security_question_answer_1"
                type="password"
                value={securityQuestionInfo.security_question_answer_1 || ""}
                onChange={this.setSecurityQuestion}
                onFocus={(event) => event.target.type = "text"}
                onBlur={(event) => event.target.type = "password"}
                placeholder="Type the answer to your question"
                autoComplete="off"
              />
            </InputWrapper>
            <SelectWrapper>
              <InputLabel>Security Question 2</InputLabel>
              <Select
                id="security_question_2"
                value={securityQuestionInfo.security_question_2}
                onChange={this.setSecurityQuestion}>
                <option disabled value="">Choose a security question</option>
                {Object.keys(optionQuestions).map((group_key, groupIndex) => {
                  return (
                    <optgroup key={groupIndex} label={capitalize(group_key)}>
                      {optionQuestions[group_key].map((item, itemIndex) => {
                        return (
                          <option disabled={notAvailable.includes(item.question)} key={itemIndex} id="security_question_answer_id_2" data-questionid={item.id} value={item.question}>{item.question}</option>
                        );
                      })}
                    </optgroup>
                  );
                })}
              </Select>

            </SelectWrapper>
            <InputWrapper>
              <InputLabel><RequiredStar>*</RequiredStar> Answer</InputLabel>
              <Input
                id="security_question_answer_2"
                type="password"
                value={securityQuestionInfo.security_question_answer_2 || ""}
                onChange={this.setSecurityQuestion}
                onFocus={(event) => event.target.type = "text"}
                onBlur={(event) => event.target.type = "password"}
                placeholder="Type the answer to your question"
                autoComplete="off"
              />
            </InputWrapper>
            <SelectWrapper>
              <InputLabel>Security Question 3</InputLabel>
              <Select
                id="security_question_3"
                value={securityQuestionInfo.security_question_3}
                onChange={this.setSecurityQuestion}>
                <option disabled value="">Choose a security question</option>
                {Object.keys(optionQuestions).map((group_key, groupIndex) => {
                  return (
                    <optgroup key={groupIndex} label={capitalize(group_key)}>
                      {optionQuestions[group_key].map((item, itemIndex) => {
                        return (
                          <option disabled={notAvailable.includes(item.question)} key={itemIndex} id="security_question_answer_id_3" data-questionid={item.id} value={item.question}>{item.question}</option>
                        );
                      })}
                    </optgroup>
                  );
                })}
              </Select>

            </SelectWrapper>
            <InputWrapper>
              <InputLabel><RequiredStar>*</RequiredStar> Answer</InputLabel>
              <Input
                id="security_question_answer_3"
                type="password"
                value={securityQuestionInfo.security_question_answer_3 || ""}
                onChange={this.setSecurityQuestion}
                onFocus={(event) => event.target.type = "text"}
                onBlur={(event) => event.target.type = "password"}
                placeholder="Type the answer to your question"
                autoComplete="off"
              />
            </InputWrapper>
          </RowContentSection>
          <RowContentSection span={12}>
            <SettingsButtonContainer paddingleft={1} span={12}>
              {securityQuestionInfo.security_question_answer_1 && securityQuestionInfo.security_question_answer_2 && securityQuestionInfo.security_question_answer_3
                ? <Button onClick={() => this.saveSecurityQuestions()} nomargin small green outline>{is_loading ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Save Security Questions"}</Button>
                : null
              }
            </SettingsButtonContainer>
          </RowContentSection>
        </RowBodyPadding>
      </RowBody>
    );
  }
}

const mapStateToProps = (state) => ({
  security: state.security,
  location: state.router.location
});
const dispatchToProps = (dispatch) => ({
  showNotification: (type, title, message) => dispatch(showNotification(type, title, message)),
  createSecurityQuestionResponse: (response, question_id) => dispatch(createSecurityQuestionResponse(response, question_id))
});
export default connect(mapStateToProps, dispatchToProps)(SecurityQuestions);
