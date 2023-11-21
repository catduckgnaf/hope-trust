import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Modal } from "react-responsive-modal";
import { isMobile } from "react-device-detect";
import { closeCreateGroupConnectionModal, createGroupConnection, updateGroupConnection } from "../../store/actions/groups";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, RequiredStar, InputLabel, InputWrapper, Select, SelectWrapper, SelectStyles } from "../../global-components";
import ReactSelect, { createFilter, components } from "react-select";
import {
  ModalMain,
  ModalContent,
  ModalContentSection,
  ModalFooter,
  ModalHeader
} from "./style";

const LazyOption = ({ children, ...props }) => {
  const { onMouseMove, onMouseOver, ...rest } = props.innerProps;
  const newProps = Object.assign(props, { innerProps: rest });
  return (
    <components.Option {...newProps} >
      {children}
    </components.Option>
  );
};

class MessageCreateModal extends Component {

  constructor(props) {
    super(props);
    const { defaults = {}, groups, agents, teams } = props;
    const current_group = groups.list.find((g) => g.config_id === defaults.config_id) || false;
    const current_agent = agents.list.find((a) => a.cognito_id === defaults.cognito_id) || false;
    const current_team = teams.list.find((t) => t.cognito_id === defaults.cognito_id) || false;
    this.state = {
      current_group: current_group ? { value: current_group, label: current_group.name } : null,
      current_agent: current_agent ? { value: current_agent, label: `${current_agent.first_name} ${current_agent.last_name}` } : null,
      current_team: current_team ? { value: current_team, label: current_team.name } : null,
      status: defaults.status,
      config_id: defaults.config_id,
      creating_connection: false,
      updating_connection: false
    };
  }

  createGroupConnection = async () => {
    const { createGroupConnection } = this.props;
    const { current_agent, current_team, config_id, status } = this.state;
    this.setState({ creating_connection: true });
    await createGroupConnection({ config_id, cognito_id: (current_agent ? current_agent.value.cognito_id : current_team.value.cognito_id), status });
    this.setState({ creating_connection: false });
  };
  updateGroupConnection = async () => {
    const { updateGroupConnection, defaults } = this.props;
    const { current_agent, current_team, config_id, status } = this.state;
    this.setState({ updating_connection: true });
    await updateGroupConnection(defaults.id, { config_id, cognito_id: (current_agent ? current_agent.value.cognito_id : current_team.value.cognito_id), status });
    this.setState({ updating_connection: false });
  };

  render() {
    const {
      is_open,
      closeCreateGroupConnectionModal,
      updating,
      viewing,
      groups,
      agents,
      teams
    } = this.props;
    const {
      current_group,
      current_agent,
      current_team,
      status,
      creating_connection,
      updating_connection
    } = this.state;
    let all_agents = [];
    let all_teams = [];
    const all_groups = groups.list.map((group) => {
      return { value: group, label: group.name };
    });
    if (current_group) {
      all_agents = agents.list.map((agent) => {
        if (!agent.approved_groups.includes(current_group.value.config_id) && !agent.pending_groups.includes(current_group.value.config_id)) return { value: agent, label: `${agent.first_name} ${agent.last_name}` };
        return false;
      }).filter((e) => e);
      all_teams = teams.list.map((team) => {
        if (!team.approved_groups.includes(current_group.value.config_id) && !team.pending_groups.includes(current_group.value.config_id)) return { value: team, label: team.name };
        return false;
      }).filter((e) => e);
    }

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "675px", width: "100%", borderRadius: "5px", marginTop: isMobile ? "95px" : "50px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} showCloseIcon={!(creating_connection || updating_connection)} closeOnOverlayClick={!(creating_connection || updating_connection)} open={is_open} onClose={() => closeCreateGroupConnectionModal()} center>
        <ModalMain>
          <ModalContent>
            <ModalHeader span={12}>{updating ? "Updating" : (viewing ? "Viewing" : "New")} Group Connection</ModalHeader>
            <ModalContentSection span={12}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Group</InputLabel>
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
                  name="current_group"
                  placeholder="Choose a group from the list..."
                  clearValue={() => this.setState({ current_group: null })}
                  onChange={(aa) => {
                    this.setState({ current_group: aa ? aa : null, config_id: aa ? aa.value.config_id : null })
                  }}
                  value={current_group || null}
                  options={all_groups}
                  className="select-menu"
                  classNamePrefix="ht"
                  isDisabled={viewing}
                />
              </InputWrapper>
            </ModalContentSection>
            {current_group && !current_team
              ? (
                <ModalContentSection span={12}>
                  <InputWrapper>
                    <InputLabel><RequiredStar>*</RequiredStar> Agent</InputLabel>
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
                      name="current_agent"
                      placeholder="Choose an agent from the list..."
                      clearValue={() => this.setState({ current_agent: null })}
                      onChange={(aa) => this.setState({ current_agent: aa ? aa : null })}
                      value={current_agent || null}
                      options={all_agents}
                      className="select-menu"
                      classNamePrefix="ht"
                      isDisabled={viewing}
                    />
                  </InputWrapper>
                </ModalContentSection>
              )
              : null
            }
            {current_group && !current_agent
              ? (
                <ModalContentSection span={12}>
                  <InputWrapper>
                    <InputLabel><RequiredStar>*</RequiredStar> Team</InputLabel>
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
                      name="current_team"
                      placeholder="Choose a team from the list..."
                      clearValue={() => this.setState({ current_team: null })}
                      onChange={(aa) => this.setState({ current_team: aa ? aa : null })}
                      value={current_team || null}
                      options={all_teams}
                      className="select-menu"
                      classNamePrefix="ht"
                      isDisabled={viewing}
                    />
                  </InputWrapper>
                </ModalContentSection>
              )
              : null
            }
            {current_group && (current_agent || current_team)
              ? (
                <ModalContentSection span={12}>
                  <SelectWrapper>
                    <InputLabel><RequiredStar>*</RequiredStar> Status</InputLabel>
                    <Select
                      id="status"
                      value={status || ""}
                      onChange={(event) => this.setState({ [event.target.id]: event.target.value })}>
                      <option disabled value="">Choose a status</option>
                      <option value="active">Approved</option>
                      <option value="declined">Declined</option>
                      <option value="pending">Pending</option>
                    </Select>
                  </SelectWrapper>
                </ModalContentSection>
              )
              : null
            }
            <ModalFooter span={12}>
              {!updating && !viewing
                ? <Button disabled={creating_connection || (!current_group || !status || !(current_agent || current_team))} green rounded outline onClick={() => this.createGroupConnection()}>{creating_connection ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Create"}</Button>
                : null
              }
              {updating
                ? <Button disabled={updating_connection || (!current_group || !status || !(current_agent || current_team))} blue rounded outline onClick={() => this.updateGroupConnection()}>{updating_connection ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Update"}</Button>
                : null
              }
              <Button danger rounded outline onClick={() => closeCreateGroupConnectionModal()}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </ModalMain>
      </Modal>
    );
  }
}
const mapStateToProps = (state) => ({
  user: state.user,
  groups: state.groups,
  agents: state.agents,
  teams: state.teams
});
const dispatchToProps = (dispatch) => ({
  createGroupConnection: (updates) => dispatch(createGroupConnection(updates)),
  updateGroupConnection: (id, updates) => dispatch(updateGroupConnection(id, updates)),
  closeCreateGroupConnectionModal: () => dispatch(closeCreateGroupConnectionModal())
});
export default connect(mapStateToProps, dispatchToProps)(MessageCreateModal);
