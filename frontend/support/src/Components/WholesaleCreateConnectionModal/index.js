import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Modal } from "react-responsive-modal";
import { isMobile } from "react-device-detect";
import { closeCreateWholesaleConnectionModal, createWholesaleConnection, updateWholesaleConnection } from "../../store/actions/wholesale";
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
    const { defaults = {}, wholesale, retail } = props;
    const current_wholesaler = wholesale.list.find((w) => w.config_id === defaults.config_id) || false;
    const current_retailer = retail.list.find((r) => r.cognito_id === defaults.cognito_id) || false;
    this.state = {
      current_wholesaler: current_wholesaler ? { value: current_wholesaler, label: current_wholesaler.name } : null,
      current_retailer: current_retailer ? { value: current_retailer, label: current_retailer.name } : null,
      status: defaults.status,
      config_id: defaults.config_id,
      creating_connection: false,
      updating_connection: false
    };
  }

  createWholesaleConnection = async () => {
    const { createWholesaleConnection } = this.props;
    const { current_retailer, config_id, status } = this.state;
    this.setState({ creating_connection: true });
    await createWholesaleConnection({ config_id, cognito_id: (current_retailer ? current_retailer.value.cognito_id : null), status });
    this.setState({ creating_connection: false });
  };
  updateWholesaleConnection = async () => {
    const { updateWholesaleConnection, defaults } = this.props;
    const { current_retailer, config_id, status } = this.state;
    this.setState({ updating_connection: true });
    await updateWholesaleConnection(defaults.id, { config_id, cognito_id: (current_retailer ? current_retailer.value.cognito_id : null), status });
    this.setState({ updating_connection: false });
  };

  render() {
    const {
      is_open,
      closeCreateWholesaleConnectionModal,
      updating,
      viewing,
      wholesale,
      retail
    } = this.props;
    const {
      current_wholesaler,
      current_retailer,
      status,
      creating_connection,
      updating_connection
    } = this.state;
    let all_retailers = [];
    const all_wholesalers = wholesale.list.map((w) => {
      return { value: w, label: w.name };
    });
    if (current_wholesaler) {
      all_retailers = retail.list.map((retailer) => {
        if (!retailer.approved_wholesalers.includes(current_wholesaler.value.config_id) && !retailer.pending_wholesalers.includes(current_wholesaler.value.config_id)) return { value: retailer, label: retailer.name };
        return false;
      }).filter((e) => e);
    }

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "675px", width: "100%", borderRadius: "5px", marginTop: isMobile ? "95px" : "50px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} showCloseIcon={!(creating_connection || updating_connection)} closeOnOverlayClick={!(creating_connection || updating_connection)} open={is_open} onClose={() => closeCreateWholesaleConnectionModal()} center>
        <ModalMain>
          <ModalContent>
            <ModalHeader span={12}>{updating ? "Updating" : (viewing ? "Viewing" : "New")} Wholesale Connection</ModalHeader>
            <ModalContentSection span={12}>
              <InputWrapper>
                <InputLabel><RequiredStar>*</RequiredStar> Wholesale Account</InputLabel>
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
                  name="current_wholesaler"
                  placeholder="Choose a wholesale account from the list..."
                  clearValue={() => this.setState({ current_wholesaler: null })}
                  onChange={(aa) => {
                    this.setState({ current_wholesaler: aa ? aa : null, config_id: aa ? aa.value.config_id : null })
                  }}
                  value={current_wholesaler || null}
                  options={all_wholesalers}
                  className="select-menu"
                  classNamePrefix="ht"
                  isDisabled={viewing}
                />
              </InputWrapper>
            </ModalContentSection>
            {current_wholesaler
              ? (
                <ModalContentSection span={12}>
                  <InputWrapper>
                    <InputLabel><RequiredStar>*</RequiredStar> Retail Account</InputLabel>
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
                      name="current_retailer"
                      placeholder="Choose a retail account from the list..."
                      clearValue={() => this.setState({ current_retailer: null })}
                      onChange={(aa) => this.setState({ current_retailer: aa ? aa : null })}
                      value={current_retailer || null}
                      options={all_retailers}
                      className="select-menu"
                      classNamePrefix="ht"
                      isDisabled={viewing}
                    />
                  </InputWrapper>
                </ModalContentSection>
              )
              : null
            }
            {current_wholesaler && current_retailer
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
                ? <Button disabled={creating_connection || (!current_wholesaler || !status || !current_retailer)} green rounded outline onClick={() => this.createWholesaleConnection()}>{creating_connection ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Create"}</Button>
                : null
              }
              {updating
                ? <Button disabled={updating_connection || (!current_wholesaler || !status || !current_retailer)} blue rounded outline onClick={() => this.updateWholesaleConnection()}>{updating_connection ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Update"}</Button>
                : null
              }
              <Button danger rounded outline onClick={() => closeCreateWholesaleConnectionModal()}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </ModalMain>
      </Modal>
    );
  }
}
const mapStateToProps = (state) => ({
  user: state.user,
  wholesale: state.wholesale,
  retail: state.retail
});
const dispatchToProps = (dispatch) => ({
  createWholesaleConnection: (updates) => dispatch(createWholesaleConnection(updates)),
  updateWholesaleConnection: (id, updates) => dispatch(updateWholesaleConnection(id, updates)),
  closeCreateWholesaleConnectionModal: () => dispatch(closeCreateWholesaleConnectionModal())
});
export default connect(mapStateToProps, dispatchToProps)(MessageCreateModal);
