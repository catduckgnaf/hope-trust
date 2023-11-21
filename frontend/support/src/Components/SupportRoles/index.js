import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactSelect, { components } from "react-select";
import ReactAvatar from "react-avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { updateCoreSettings } from "../../store/actions/customer-support";
import { showNotification } from "../../store/actions/notification";
import {
  InputWrapper,
  InputLabel,
  InputDescription,
  SelectStyles
} from "../../global-components";
import {
  SettingsButtonContainer,
} from "../../Pages/Settings/style";
import {
  Icon,
  OptionContainer,
  OptionImageContainer,
  OptionTextContainer,
  RoleInner,
  RoleInnerSection,
  RoleSection,
  SaveProfileButton,
  SupportRolesContainer
} from "./style";
import config from "../../config";

const Gateway = config.apiGateway.find((gateway) => gateway.name === "support");

const support_roles = {
  technical_support: {
    title: "Technical Support",
    description: "Technical issues, bugs, errors and exceptions will be reported to this role."
  },
  customer_support: {
    title: "Customer Support",
    description: "New unassigned tickets, ticket comments and approvals will be reported to this role."
  },
  commerce_support: {
    title: "Commerce Support",
    description: "Product purchases, subscription issues/requests and commerce related communications will be reported to this role."
  },
  system_support: {
    title: "System Support",
    description: "System-wide metrics, server issues and fatal errors will be reported to this role."
  },
  billing_support: {
    title: "Billing Support",
    description: "Billing issues, processor communications and invoices will be reported to this role."
  }
};

const Option = (props) => {
  return (
    <components.Option {...props}>
      <OptionContainer>
        <OptionImageContainer><ReactAvatar src={`${Gateway.endpoint}/users/get-user-avatar/${props.data.value.cognito_id}`} size={30} name={props.data.label} round /></OptionImageContainer>
        <OptionTextContainer>{props.data.label}</OptionTextContainer>
      </OptionContainer>
    </components.Option>
  );
};

const SupportRolesMain = (props) => {
  const dispatch = useDispatch();
  const [updatedRoles, updateRoles] = useState({});
  const customer_support_state = useSelector((state) => state.customer_support);
  const cs_users = customer_support_state.cs_users;
  const [is_loading, setLoading] = useState(false);
  
  const getRoleDefaults = () => {
    const technical_support = cs_users.find((csu) => csu.cognito_id === customer_support_state.core_settings.technical_support);
    const customer_support = cs_users.find((csu) => csu.cognito_id === customer_support_state.core_settings.customer_support);
    const commerce_support = cs_users.find((csu) => csu.cognito_id === customer_support_state.core_settings.commerce_support);
    const system_support = cs_users.find((csu) => csu.cognito_id === customer_support_state.core_settings.system_support);
    const billing_support = cs_users.find((csu) => csu.cognito_id === customer_support_state.core_settings.billing_support);
    return {
      technical_support: { value: technical_support, label: technical_support.name },
      customer_support: { value: customer_support, label: customer_support.name },
      commerce_support: { value: commerce_support, label: commerce_support.name },
      system_support: { value: system_support, label: system_support.name },
      billing_support: { value: billing_support, label: billing_support.name }
    };
  };

  const [roles, setRoles] = useState(getRoleDefaults());

  useEffect(() => {
    Object.keys(roles).forEach((role) => {
      if (roles[role].updated) updateRoles((prevRoles) => ({ ...prevRoles, [role]: roles[role].value.cognito_id }));
    });
  }, [roles]);

  const saveRoles = async () => {
    setLoading(true);
    dispatch(updateCoreSettings(updatedRoles))
      .then((updated) => {
        if (updated.success) dispatch(showNotification("success", "Roles Updated", "Support roles successfully updated."));
        setLoading(false);
        updateRoles({});
      })
      .catch((error) => dispatch(showNotification("error", "Update Failed", error.message)));
  };

  return (
    <SupportRolesContainer>
      {Object.keys(support_roles).map((key, index) => {
        return (
          <RoleInnerSection key={index} span={12}>
            <RoleInner>
              <RoleSection xs={4} sm={2} md={2} lg={2} xl={2} align="center">
                <ReactAvatar className="avatar" size={75} name={roles[key] ? roles[key].label : ""} src={roles[key] ? `${Gateway.endpoint}/users/get-user-avatar/${roles[key].value.cognito_id}` : null} alt={roles[key] ? roles[key].value.name : ""} round />
              </RoleSection>
              <RoleSection xs={8} sm={10} md={10} lg={10} xl={10}>
                <InputWrapper marginbottom={1}>
                  <InputLabel marginbottom={5}>{support_roles[key].title}</InputLabel>
                  <ReactSelect
                    styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent",
                        zIndex: 99999 - index
                      }),
                      multiValue: (base) => ({
                        ...base,
                        borderRadius: "15px",
                        padding: "2px 10px"
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 99999 - index
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 99999 - index
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
                    name={key}
                    placeholder="Choose a user from the list..."
                    onChange={(aa) => setRoles((prevRoles) => ({ ...prevRoles, [key]: aa ? { ...aa, updated: true } : {} }))}
                    value={roles[key]}
                    options={cs_users.map((user) => ({ value: user, label: user.name }))}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                  <InputDescription><Icon><FontAwesomeIcon icon={["fas", "chevron-double-right"]} /></Icon> {support_roles[key].description}</InputDescription>
                </InputWrapper>
              </RoleSection>
            </RoleInner>
          </RoleInnerSection>
        );
      })}
      <SettingsButtonContainer span={12}>
        <SaveProfileButton disabled={!Object.keys(updatedRoles).length} type="button" onClick={() => saveRoles()} nomargin primary green outline>{is_loading ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Save"}</SaveProfileButton>
      </SettingsButtonContainer>
    </SupportRolesContainer>
  );
};

const SupportRoles = (props) => <SupportRolesMain {...props} />;

export default SupportRoles;