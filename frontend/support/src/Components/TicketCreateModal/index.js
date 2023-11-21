import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import { Modal } from "react-responsive-modal";
import { merge, orderBy, last, uniqBy } from "lodash";
import { closeCreateTicketModal, createTicket, updateTicket } from "../../store/actions/tickets";
import { all_permissions } from "../../store/actions/plans";
import { showNotification } from "../../store/actions/notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactSelect, { createFilter, components } from "react-select";
import CreatableSelect from "react-select/creatable";
import ReactAvatar from "react-avatar";
import { capitalize, WEBMAIL_PROVIDER_DOMAINS } from "../../utilities";
import TicketComments from "../TicketComments";
import {
  TicketsModuleMainContent,
  ViewTicketsModuleModalInner,
  ViewTicketsModuleModalInnerHeader,
  OptionContainer,
  OptionImageContainer,
  OptionTextContainer,
  Group,
  Icon
} from "./style";
import {
  Button,
  InputWrapper,
  InputLabel,
  Input,
  RequiredStar,
  SelectStyles,
  TextArea
} from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";
import hover from "./hover.mp3";
import config from "../../config";
const audio = new Audio(hover);
const Gateway = config.apiGateway.find((gateway) => gateway.name === "support");

const handleHeaderClick = (id) => {
  const node = document.querySelector(`#${id}`).parentElement
    .nextElementSibling;
  const classes = node.classList;
  if (classes.contains("collapsed")) {
    node.classList.remove("collapsed");
  } else {
    node.classList.add("collapsed");
  }
};

const Option = (props) => {
  return (
    <components.Option {...props}>
      <OptionContainer>
        <OptionImageContainer><ReactAvatar size={25} src={`${Gateway.endpoint}/users/get-user-avatar/${props.data.value.cognito_id}`} name={props.data.label} round /></OptionImageContainer>
        <OptionTextContainer>{props.data.label}</OptionTextContainer>
      </OptionContainer>
    </components.Option>
  );
};

const LazyOption = ({ children, ...props }) => {
  const { onMouseMove, onMouseOver, ...rest } = props.innerProps;
  const newProps = Object.assign(props, { innerProps: rest });
  return (
    <components.Option {...newProps} >
      {children}
    </components.Option>
  );
};

const CustomGroupHeading = (props) => {
  return (
    <Group className="group-heading-wrapper" onClick={() => handleHeaderClick(props.id)}>
      <components.GroupHeading {...props}>
        {props.children} ({props.data.options.length})
          <Icon>
            <FontAwesomeIcon icon={["fas", "chevron-down"]} />
          </Icon>
      </components.GroupHeading>
    </Group>
  );
};

class TicketCreateModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    closeCreateTicketModal: PropTypes.func.isRequired,
    createTicket: PropTypes.func.isRequired,
    updateTicket: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { defaults, customer_support, wholesale, retail, groups, teams, agents } = props;
    const ticket_statuses = [
      { label: "New", value: "new" },
      { label: "Open", value: "open" },
      { label: "Pending", value: "pending" },
      { label: "Solved", value: "solved" },
      { label: "Closed", value: "closed" }
    ];
    const permission_statuses = [
      { label: "Pending", value: "pending" },
      { label: "Approved", value: "approved" },
      { label: "Declined", value: "declined" }
    ];
    const request_types = [
      { label: "Other", value: "other_request_type" },
      { label: "Money", value: "money" },
      { label: "Domain Approval", value: "domain_approval" },
      { label: "Account Update", value: "account_update" },
      { label: "Professional Portal Assistance", value: "professional_portal_assistance" },
      { label: "Medical", value: "medical" },
      { label: "Food", value: "food" },
      { label: "Transportation", value: "transportation" },
      { label: "Permission", value: "permission" },
      { label: "New Relationship", value: "new_relationship" },
      { label: "Course Passed", value: "course_passed" }
    ];
    const cs_users = customer_support.cs_users.map((cs) => {
      return { value: cs, label: `${cs.first_name} ${cs.last_name}` };
    });
    const all_users = customer_support.users.map((u) => {
      return { value: u, label: `${u.first_name} ${u.last_name}` };
    });
    const partners = orderBy(customer_support.partners, "name").map((partner) => {
      return { value: partner.account_id, label: `${partner.first_name} ${partner.last_name} (${partner.name})` };
    });
    const clients = customer_support.accounts.map((a) => {
      return { value: a.account_id, label: `${a.first_name} ${a.last_name}` };
    });
    const wholesalers = wholesale.list.map((a) => {
      return { value: a.cognito_id, label: `${a.first_name} ${a.last_name}` };
    });
    const retailers = retail.list.map((a) => {
      return { value: a.cognito_id, label: `${a.first_name} ${a.last_name}` };
    });
    const agent_users = agents.list.map((a) => {
      return { value: a.cognito_id, label: `${a.first_name} ${a.last_name}` };
    });
    const group_items = groups.list.map((a) => {
      return { value: a.cognito_id, label: `${a.first_name} ${a.last_name}` };
    });
    const team_users = teams.list.map((a) => {
      return { value: a.cognito_id, label: `${a.first_name} ${a.last_name}` };
    });

    const account_types = {
      "Partners": partners,
      "Clients": clients,
      "Wholesale": wholesalers,
      "Retail": retailers,
      "Agent": agent_users,
      "Group": group_items,
      "Team": team_users
    };
    const all_accounts = Object.keys(account_types).sort().map((type) => {
      const option_items = account_types[type].map((a) => {
        return { value: a.value, label: a.label };
      });
      return { options: option_items, label: type };
    });
    const all_domains = customer_support.partners.map((p) => {
      const domain = p.email.split("@")[1];
      return { value: domain, label: domain };
    });
    const current_assignee = cs_users.find((cs) => cs.value.cognito_id === defaults.assignee);
    const current_user = [...all_users, ...cs_users].find((a) => a.value.cognito_id === defaults.cognito_id);
    const current_partner = customer_support.partners.find((a) => a.cognito_id === defaults.cognito_id);
    const current_account = [...partners, ...clients, ...wholesalers, ...retailers, ...agent_users, ...group_items, ...team_users].find((a) => a.value === defaults.account_id);
    let domain_approved = null;
    if (current_partner && WEBMAIL_PROVIDER_DOMAINS.includes(current_partner.email.split("@")[1]) && current_partner.domain_approved) {
      domain_approved = { value: "domain_cleared", label: "Cleared" };
    } else if (current_partner && !WEBMAIL_PROVIDER_DOMAINS.includes(current_partner.email.split("@")[1]) && current_partner.domain_approved) {
      domain_approved = { value: "domain_approved", label: "Approved" };
    } else if (current_partner && !current_partner.domain_approved && current_partner.email.split("@")[1]) {
      domain_approved = { value: "domain_declined", label: "Declined" };
    }
    const ticket = { ...defaults };
    this.state = {
      loaderShow: false,
      loaderMessage: "",
      updates: {},
      ticket,
      partners,
      cs_users,
      all_users,
      all_accounts,
      current_account,
      current_user,
      assignee: current_assignee,
      tags: ticket.tags || [],
      priority: ticket.priority ? { label: capitalize(ticket.priority), value: ticket.priority } : null,
      priorities: [
        { label: "Urgent", value: "urgent" },
        { label: "High", value: "high" },
        { label: "Normal", value: "normal" },
        { label: "Low", value: "low" }
      ],
      permission_statuses,
      ticket_statuses,
      request_types,
      updating_comments: false,
      all_domains: uniqBy(all_domains, "value"),
      domain: current_partner ? { value: current_partner.email.split("@")[1], label: current_partner.email.split("@")[1] } : null,
      domain_approved
    };
  }

  componentDidMount() {
    const { updating, viewing} = this.props;
    if (updating || viewing) {
      setTimeout(() => {
        const objDiv = document.getElementById("comment_feed");
        objDiv.scrollTop = objDiv.scrollHeight;
      }, 1000);
    }
  }

  componentDidUpdate(prevProps) {
    const { updating, showNotification, user } = this.props;
    const { ticket } = this.state;
    if (updating) {
      if (this.props.defaults.comments.length > prevProps.defaults.comments.length) {
        const new_comments = this.props.defaults.comments.length - prevProps.defaults.comments.length;
        if (last(this.props.defaults.comments).cognito_id !== user.cognito_id) {
          this.setState({ ticket: { ...ticket, comments: this.props.defaults.comments } }, () => {
            audio.play();
            const objDiv = document.getElementById("comment_feed");
            objDiv.scrollTop = objDiv.scrollHeight;
            showNotification("info", (new_comments === 1) ? "New Comment" : "New Comments", (new_comments === 1) ? `New comment on ticket #${this.props.defaults.id}` : `${new_comments} new comments on ticket #${this.props.defaults.id}`);
          });
        }
      }
    }
  }

  update = (key, value) => {
    const { ticket, updates } = this.state;
    const newState = merge(ticket, { [key]: value });
    let updated = merge(updates, { [key]: value });
    if (updated[key] && (!value.length || !value) && typeof value !== "boolean") delete updated[key];
    this.setState({ ticket: newState, updates: updated });
  };

  updateTags = (tags) => {
    const { updates } = this.state;
    this.setState({ tags, updates: { ...updates, tags} });
  };

  createRecord = async () => {
    const { updates, ticket } = this.state;
    const { createTicket, closeCreateTicketModal, showNotification } = this.props;
    if (this.isComplete(ticket.request_type)) {
      this.setState({ loaderShow: true, loaderMessage: "Updating..." });
      const created = await createTicket(updates);
      if (created.success) {
        this.setState({ loaderShow: false, loaderMessage: "" });
        showNotification("success", "Ticket Created", "Ticket was successfully created.");
        closeCreateTicketModal();
      } else {
        this.setState({ loaderShow: false, loaderMessage: "" });
        showNotification("error", "Update failed", created.message);
      }
    } else {
      showNotification("error", "Required Fields", "You must fill in all required fields.");
    }
  };

  updateRecord = async () => {
    const { updates, ticket } = this.state;
    const { updateTicket, closeCreateTicketModal, showNotification, defaults } = this.props;
    if (this.isComplete(ticket.request_type)) {
      this.setState({ loaderShow: true, loaderMessage: "Updating..." });
      const updated = await updateTicket(defaults.id, updates);
      if (updated.success) {
        this.setState({ loaderShow: false, loaderMessage: "" });
        showNotification("success", "Ticket Updated", "Ticket was successfully updated.");
        closeCreateTicketModal();
      } else {
        this.setState({ loaderShow: false, loaderMessage: "" });
        showNotification("error", "Update failed", updated.message);
      }
    } else {
      showNotification("error", "Required Fields", "You must fill in all required fields.");
    }
  };

  isComplete = (request_type) => {
    const { ticket } = this.state;
    const {
      title,
      priority,
      account_id,
      cognito_id,
      status,
      request_amount,
      permission,
      permission_status,
      decline_reason,
      domain,
      domain_approved,
      body
    } = ticket;
    let required = [title, priority, account_id, cognito_id, request_type, status, body];
    switch(request_type) {
      case "other_request_type":
        break;
      case "money":
        required.push(request_amount);
        break;
      case "domain_approval":
        required.push(domain, domain_approved);
        break;
      case "account_update":
        break;
      case "professional_portal_assistance":
        break;
      case "medical":
        break;
      case "food":
        break;
      case "transportation":
        break;
      case "permission":
        required.push(permission, permission_status);
        if (permission_status && permission_status === "declined") required.push(decline_reason);
        break;
      case "new_relationship":
        break;
      default:
        break;
    }
    return required.every((e) => e);
  };

  addComment = async (input_comment) => {
    const { updateTicket, defaults } = this.props;
    const { ticket } = this.state;
    this.setState({ updating_comments: true });
    const updated = await updateTicket(defaults.id, { comment: { "body": input_comment } });
    this.setState({ updating_comments: false, ticket: { ...ticket, comments: updated.payload.comments } }, () => {
      const objDiv = document.getElementById("comment_feed");
      objDiv.scrollTop = objDiv.scrollHeight;
    });
  };

  updateSelectInput = (value, actionOptions) => {
    switch (actionOptions.action) {
      case "remove-value":
        let difference = this.state[actionOptions.name].filter((state) => state !== actionOptions.removedValue.value);
        this.setState({ [actionOptions.name]: difference });
        this.updateTags(difference);
        break;
      case "select-option":
        this.setState({ [actionOptions.name]: value.map((e) => e.value) });
        this.updateTags(value.map((e) => e.value));
        break;
      case "create-option":
        const new_option = value[value.length - 1];
        this.setState({ [actionOptions.name]: [...this.state[actionOptions.name], new_option.value] });
        this.updateTags([...this.state[actionOptions.name], new_option.value]);
        break;
      case "clear":
        this.setState({ [actionOptions.name]: [] });
        this.updateTags([]);
        break;
      default:
        break;
    }
  };

  render() {
    const { is_open, closeCreateTicketModal, updating, viewing, defaults } = this.props;
    const {
      loaderShow,
      loaderMessage,
      ticket,
      all_accounts,
      partners,
      cs_users,
      assignee,
      all_users,
      current_user,
      current_account,
      priorities,
      priority,
      tags,
      permission_statuses,
      ticket_statuses,
      request_types,
      updating_comments,
      all_domains,
      domain,
      domain_approved
    } = this.state;
    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "1000px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={is_open} onClose={() => closeCreateTicketModal()} center>
        <ViewTicketsModuleModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} gutter={20}>
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <TicketsModuleMainContent xs={12} sm={12} md={(updating || viewing) ? 7 : 12} lg={(updating || viewing) ? 7 : 12} xl={(updating || viewing) ? 7 : 12}>
            <Row>
              {!updating && !viewing
                ? <ViewTicketsModuleModalInnerHeader span={12}>New Ticket</ViewTicketsModuleModalInnerHeader>
                : <ViewTicketsModuleModalInnerHeader span={12}>{updating ? "Updating" : "Viewing"} Ticket</ViewTicketsModuleModalInnerHeader>
              }
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Title:</InputLabel>
                  <Input readOnly={false} type="text" value={ticket.title} onChange={(event) => this.update("title", event.target.value)}/>
                </InputWrapper>
              </Col>

              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Request Type</InputLabel>
                  <ReactSelect
                    styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent",
                        zIndex: 99999
                      }),
                      multiValue: (base) => ({
                        ...base,
                        borderRadius: "15px",
                        padding: "2px 10px"
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 99999
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 99999
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
                    isClearable
                    name="request_type"
                    placeholder="Choose a request type from the list..."
                    clearValue={() => this.update("request_type", null)}
                    onChange={(aa) => this.update("request_type", aa ? aa.value : null)}
                    value={ticket.request_type ? { label: capitalize(ticket.request_type === "other_request_type" ? "Other" : ticket.request_type.replaceAll("_", " ")), value: ticket.request_type } : null}
                    options={request_types}
                    isDisabled={updating || viewing}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                </InputWrapper>
              </Col>

              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Account</InputLabel>
                  <ReactSelect
                    components={{ Option: LazyOption, GroupHeading: CustomGroupHeading }}
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
                    isClearable
                    name="current_account"
                    placeholder="Choose an account from the list..."
                    clearValue={() => this.setState({ current_account: null })}
                    onChange={(aa) => {
                      this.setState({ current_account: aa })
                      this.update("account_id", aa ? aa.value : null)
                    }}
                    value={current_account}
                    options={(ticket.request_type === "domain_approval") ? partners : all_accounts}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                </InputWrapper>
              </Col>

              {current_account
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> User</InputLabel>
                      <ReactSelect
                        components={{ Option: LazyOption }}
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
                        isClearable
                        name="current_user"
                        placeholder="Choose a user from the list..."
                        clearValue={() => this.setState({ current_user: null })}
                        onChange={(aa) => {
                          this.setState({ current_user: aa })
                          this.update("cognito_id", aa ? aa.value.cognito_id : null)
                        }}
                        value={current_user}
                        options={all_users.filter((u) => u.value.accounts ? u.value.accounts.split(", ").includes(current_account.value) : all_users)}
                        className="select-menu"
                        classNamePrefix="ht"
                      />
                    </InputWrapper>
                  </Col>
                )
                : null
              }

              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Priority</InputLabel>
                  <ReactSelect
                    styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent",
                        zIndex: 999
                      }),
                      multiValue: (base) => ({
                        ...base,
                        borderRadius: "15px",
                        padding: "2px 10px"
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 999
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 999
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
                    isClearable
                    name="priority"
                    placeholder="Choose a priority the list..."
                    clearValue={() => this.setState({ priority: null })}
                    onChange={(aa) => {
                      this.setState({ priority: aa })
                      this.update("priority", aa ? aa.value : null)
                    }}
                    value={priority}
                    options={priorities}
                    isDisabled={viewing}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                </InputWrapper>
              </Col>

              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}>Tags</InputLabel>
                  <CreatableSelect
                    styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent",
                        zIndex: 988
                      }),
                      multiValue: (base) => ({
                        ...base,
                        borderRadius: "15px",
                        padding: "2px 10px"
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 988
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 988
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
                    isMulti
                    name="tags"
                    placeholder="Choose from the list or type a new tag...(select all that apply)"
                    backspaceRemovesValue={true}
                    onChange={this.updateSelectInput}
                    defaultValue={tags.map((s) => {
                      return { value: s, label: capitalize(s) };
                    })}
                    options={(defaults.tags || []).filter((e) => e).map((s) => {
                      return { value: s, label: capitalize(s) };
                    })}
                    isDisabled={viewing}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                </InputWrapper>
              </Col>

              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}>Assignee</InputLabel>
                  <ReactSelect
                    styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent",
                        zIndex: 99999
                      }),
                      multiValue: (base) => ({
                        ...base,
                        borderRadius: "15px",
                        padding: "2px 10px"
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 99999
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 99999
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
                    components={{ Option }}
                    isSearchable
                    isClearable
                    name="assignee"
                    placeholder="Choose a user from the list..."
                    clearValue={() => this.setState({ assignee: null })}
                    onChange={(aa) => {
                      this.setState({ assignee: aa })
                      this.update("assignee", aa ? aa.value.cognito_id : null)
                    }}
                    value={assignee}
                    options={cs_users}
                    isDisabled={viewing}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                </InputWrapper>
              </Col>

              {ticket.request_type === "money"
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Amount:</InputLabel>
                      <Input readOnly={false} type="number" inputMode="decimal" value={ticket.request_amount} onChange={(event) => this.update("request_amount", event.target.value)}/>
                    </InputWrapper>
                  </Col>
                )
                : null
              }

              {ticket.request_type === "permission"
                ? (
                  <>
                    <Col span={12}>
                      <InputWrapper>
                        <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Permission</InputLabel>
                        <ReactSelect
                          styles={{
                            container: (base, state) => ({
                              ...base,
                              opacity: state.isDisabled ? ".5" : "1",
                              backgroundColor: "transparent",
                              zIndex: 9999
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
                          isClearable
                          name="permission"
                          placeholder="Choose a permission from the list..."
                          clearValue={() => this.update("permission", null)}
                          onChange={(aa) => this.update("permission", aa ? aa.value : null)}
                          value={ticket.permission ? { value: ticket.permission, label: capitalize(ticket.permission.replaceAll("-", " "))} : null}
                          options={all_permissions}
                          isDisabled={defaults.permission_status === "approved"}
                          className="select-menu"
                          classNamePrefix="ht"
                        />
                      </InputWrapper>
                    </Col>

                    <Col span={12}>
                      <InputWrapper>
                        <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Permission Status</InputLabel>
                        <ReactSelect
                          styles={{
                            container: (base, state) => ({
                              ...base,
                              opacity: state.isDisabled ? ".5" : "1",
                              backgroundColor: "transparent",
                              zIndex: 999
                            }),
                            multiValue: (base) => ({
                              ...base,
                              borderRadius: "15px",
                              padding: "2px 10px"
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 999
                            }),
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 999
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
                          isClearable
                          name="permission_status"
                          placeholder="Choose a permission status from the list..."
                          clearValue={() => this.update("permission_status", null)}
                          onChange={(aa) => {
                            this.update("permission_status", aa ? aa.value : null);
                            if (aa && (aa.value === "approved")) this.update("status", "solved");
                            if (aa && (aa.value === "pending")) this.update("status", "open");
                            if (aa && (aa.value === "declined")) this.update("status", "solved");
                          }}
                          value={ticket.permission_status ? { value: ticket.permission_status, label: capitalize(ticket.permission_status)} : null}
                          options={permission_statuses}
                          isDisabled={defaults.permission_status === "approved"}
                          className="select-menu"
                          classNamePrefix="ht"
                        />
                      </InputWrapper>
                    </Col>

                    {ticket.permission_status === "declined"
                      ? (
                        <Col span={12}>
                          <InputWrapper>
                            <InputLabel><RequiredStar>*</RequiredStar> Decline Reason:</InputLabel>
                            <TextArea rows={10} readOnly={false} onChange={(event) => this.update("decline_reason", event.target.value)} value={ticket.decline_reason} />
                          </InputWrapper>
                        </Col>
                      )
                      : null
                    }
                  </>
                )
                : null
              }

              {ticket.request_type === "domain_approval"
                ? (
                    <>
                      <Col span={12}>
                        <InputWrapper>
                          <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Domain</InputLabel>
                          <ReactSelect
                            styles={{
                              container: (base, state) => ({
                                ...base,
                                opacity: state.isDisabled ? ".5" : "1",
                                backgroundColor: "transparent",
                                zIndex: 9999
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
                            isClearable
                            name="domain"
                            placeholder="Choose a domain from the list..."
                            clearValue={() => this.update("domain", null)}
                            onChange={(aa) => {
                              this.setState({ domain: aa })
                              this.update("domain", aa ? aa.value : null);
                            }}
                            value={domain}
                            options={all_domains}
                            isDisabled={defaults.domain_approved}
                            className="select-menu"
                            classNamePrefix="ht"
                          />
                        </InputWrapper>
                      </Col>

                      <Col span={12}>
                        <InputWrapper>
                          <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Domain Approved</InputLabel>
                          <ReactSelect
                            styles={{
                              container: (base, state) => ({
                                ...base,
                                opacity: state.isDisabled ? ".5" : "1",
                                backgroundColor: "transparent",
                                zIndex: 999
                              }),
                              multiValue: (base) => ({
                                ...base,
                                borderRadius: "15px",
                                padding: "2px 10px"
                              }),
                              menu: (base) => ({
                                ...base,
                                zIndex: 999
                              }),
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 999
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
                            isClearable
                            name="domain_approved"
                            placeholder="Choose a domain approval status from the list..."
                            clearValue={() => this.update("domain_approved", false)}
                            onChange={(aa) => {
                              this.setState({ domain_approved: aa })
                              this.update("domain_approved", aa ? aa.value : false);
                              if (aa && ["domain_approved", "domain_cleared"].includes(aa.value)) this.update("status", "solved");
                              if (aa && !aa.value === "domain_declined") this.update("status", "closed");
                            }}
                            value={domain_approved}
                            options={[
                              { label: "Approved", value: "domain_approved" },
                              { label: "Declined", value: "domain_declined" },
                              { label: "Cleared", value: "domain_cleared" },
                            ]}
                            isDisabled={defaults.domain_approved}
                            className="select-menu"
                            classNamePrefix="ht"
                          />
                        </InputWrapper>
                      </Col>
                    </>
                  )
                : null
              }
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Body:</InputLabel>
                  <TextArea rows={5} readOnly={false} type="text" defaultValue={ticket.body} onChange={(event) => this.update("body", event.target.value)}/>
                </InputWrapper>
              </Col>

              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Notes:</InputLabel>
                  <TextArea rows={10} readOnly={false} onChange={(event) => this.update("notes", event.target.value)} value={ticket.notes} />
                </InputWrapper>
              </Col>

              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Ticket Status</InputLabel>
                  <ReactSelect
                    styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent",
                        zIndex: 999
                      }),
                      multiValue: (base) => ({
                        ...base,
                        borderRadius: "15px",
                        padding: "2px 10px"
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 999
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 999
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
                    isClearable
                    name="status"
                    placeholder="Choose a ticket status from the list..."
                    clearValue={() => this.update("status", null)}
                    onChange={(aa) => this.update("status", aa ? aa.value : null)}
                    value={ticket.status ? { value: ticket.status, label: capitalize(ticket.status)} : null}
                    options={ticket_statuses}
                    isDisabled={defaults.status === "solved"}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                </InputWrapper>
              </Col>

              <Col span={12}>
                {!updating && !viewing
                  ? <Button disabled={false} type="button" onClick={() => this.createRecord()} outline green rounded nomargin>Create Ticket</Button>
                  : null
                }
                {updating
                  ? <Button disabled={false} type="button" onClick={() => this.updateRecord()} outline green rounded nomargin>Update Ticket</Button>
                  : null
                }
                <Button type="button" onClick={() => closeCreateTicketModal()} outline danger rounded>{(!updating && !viewing) ? "Cancel" : "Close"}</Button>
              </Col>
            </Row>
          </TicketsModuleMainContent>
          {updating || viewing
            ? (
              <TicketsModuleMainContent xs={12} sm={12} md={5} lg={5} xl={5}>
                <TicketComments updating_comments={updating_comments} addComment={this.addComment} comments={ticket.comments} />
              </TicketsModuleMainContent>
            )
            : null
          }
        </ViewTicketsModuleModalInner>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session,
  customer_support: state.customer_support,
  tickets: state.tickets,
  wholesale: state.wholesale,
  retail: state.retail,
  agents: state.agents,
  groups: state.groups,
  teams: state.teams
});
const dispatchToProps = (dispatch) => ({
  closeCreateTicketModal: () => dispatch(closeCreateTicketModal()),
  createTicket: (data) => dispatch(createTicket(data)),
  updateTicket: (ID, update_data) => dispatch(updateTicket(ID, update_data)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
});
export default connect(mapStateToProps, dispatchToProps)(TicketCreateModal);