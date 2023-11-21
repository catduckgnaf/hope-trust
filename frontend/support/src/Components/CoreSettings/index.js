import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Row, Col } from "react-simple-flex-grid";
import Checkbox from "react-simple-checkbox";
import { showNotification } from "../../store/actions/notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCoreSettings, updateCoreSettings, changeCoreSettingsTab, customerServiceGetCSUsers } from "../../store/actions/customer-support";
import Autosuggest from "react-autosuggest";
import SupportRoles from "../SupportRoles";
import {
  InputWrapper,
  InputLabel,
  Input,
  TextArea,
} from "../../global-components";
import {
  RowBody,
  RowHeader,
  RowBodyPadding,
  RowContentSection,
  SettingsButtonContainer,
  SettingsTabs,
  SettingsTabsPadding,
  SettingsTabPadding,
  SettingsTabInner,
  SettingsTabIcon,
  SettingsTabStatusBar,
  TabContent
} from "../../Pages/Settings/style";
import {
  SaveProfileButton,
  SettingsTabsInner,
  SettingsTab,
  SectionHeader,
  SuggestionMain,
  SuggestionPadding,
  SuggestionInner,
  SuggestionsContainer
} from "./style";
import GenericTable from "../GenericTable";
import {
  message_settings_columns,
  document_settings_columns,
  cs_table_columns,
  budget_category_columns,
  asset_type_columns,
  income_type_columns,
  benefit_type_columns,
  contact_settings_columns
} from "../../column-definitions";
import { capitalize, uniqBy } from "lodash";
const application_types = ["client", "benefits", "support"];

let tabs_config = [
  {
    slug: "maintenance",
    icon: "wrench",
    title: "Maintenance"
  },
  {
    slug: "cs-users",
    icon: "users-cog",
    title: "Support Users"
  },
  {
    slug: "roles",
    icon: "user-headset",
    title: "Support Roles"
  },
  {
    slug: "messaging-settings",
    icon: "envelope",
    title: "Messaging Settings"
  },
  {
    slug: "document-settings",
    icon: "file",
    title: "Document Settings"
  },
  {
    slug: "budget-categories",
    icon: "usd-circle",
    title: "Budget Categories"
  },
  {
    slug: "asset-types",
    icon: "house",
    title: "Asset Types"
  },
  {
    slug: "income-types",
    icon: "envelope-open-dollar",
    title: "Income Types"
  },
  {
    slug: "benefit-types",
    icon: "flag-usa",
    title: "Benefit Types"
  },
  {
    slug: "contact-types",
    icon: "user",
    title: "Contact Types"
  }
];

class CoreSettings extends Component {
  static propTypes = {}
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { customer_support_data } = props;
    document.title = "Core Settings";
    this.state = {
      is_loading: false,
      clientCoreSettings: {
        client_app_version: customer_support_data.core_settings.client_app_version,
        client_maintenance_mode: customer_support_data.core_settings.client_maintenance_mode,
        client_debug: customer_support_data.core_settings.client_debug,
        client_maintenance_mode_title: customer_support_data.core_settings.client_maintenance_mode_title,
        client_maintenance_mode_message: customer_support_data.core_settings.client_maintenance_mode_message
      },
      benefitsCoreSettings: {
        benefits_app_version: customer_support_data.core_settings.benefits_app_version,
        benefits_maintenance_mode: customer_support_data.core_settings.benefits_maintenance_mode,
        benefits_debug: customer_support_data.core_settings.benefits_debug,
        benefits_maintenance_mode_title: customer_support_data.core_settings.benefits_maintenance_mode_title,
        benefits_maintenance_mode_message: customer_support_data.core_settings.benefits_maintenance_mode_message
      },
      supportCoreSettings: {
        support_app_version: customer_support_data.core_settings.support_app_version,
        support_maintenance_mode: customer_support_data.core_settings.support_maintenance_mode,
        support_debug: customer_support_data.core_settings.support_debug,
        support_maintenance_mode_title: customer_support_data.core_settings.support_maintenance_mode_title,
        support_maintenance_mode_message: customer_support_data.core_settings.support_maintenance_mode_message
      }
    };
  }

  componentDidMount() {
    const { getCoreSettings, customer_support_data } = this.props;
    if (!customer_support_data.requestedCoreSettings && !customer_support_data.isFetchingCoreSettings) getCoreSettings();
  }

  set = (id, value, type) => {
    let updatedCoreSettings_copy = this.state[`${type}UpdatedCoreSettings`] || {};
    let CoreSettings_copy = this.state[`${type}CoreSettings`];
    updatedCoreSettings_copy[id] = value;
    CoreSettings_copy[id] = value;
    this.setState({
      [`${type}UpdatedCoreSettings`]: updatedCoreSettings_copy,
      [`${type}CoreSettings`]: CoreSettings_copy

    });
  };

  saveSettings = async (type) => {
    const { updateCoreSettings, showNotification } = this.props;
    this.setState({ is_loading: true });
    const updated = await updateCoreSettings(this.state[`${type}UpdatedCoreSettings`]);
    if (updated.success) showNotification("success", "Settings Updated", "Core Settings successfully updated.");
    else showNotification("error", "Update Failed", updated.message);
    this.setState({
      is_loading: false,
      [`${type}UpdatedCoreSettings`]: {},
      [`${type}CoreSettings`]: {
        [`${type}_app_version`]: updated.payload[`${type}_app_version`],
        [`${type}_maintenance_mode`]: updated.payload[`${type}_maintenance_mode`],
        [`${type}_debug`]: updated.payload[`${type}_debug`],
        [`${type}_maintenance_mode_title`]: updated.payload[`${type}_maintenance_mode_title`],
        [`${type}_maintenance_mode_message`]: updated.payload[`${type}_maintenance_mode_message`]
      }
    });
  };

  changeTab = (tab) => {
    const { changeCoreSettingsTab } = this.props;
    document.title = tab.title;
    changeCoreSettingsTab(tab.slug);
  };

  render() {
    const {
      is_loading
    } = this.state;
    const { customer_support_data } = this.props;

    return (
      <RowBody>
        <RowHeader>
          <Row>
            <Col>Core Settings</Col>
          </Row>
        </RowHeader>
        <RowContentSection span={12}>
          <SettingsTabs>
            <SettingsTabsPadding span={12}>
              <SettingsTabsInner>

                {tabs_config.map((tab, index) => {
                  return (
                    <SettingsTab key={index} onClick={() => this.changeTab(tab)}>
                      <SettingsTabPadding>
                        <SettingsTabInner active={customer_support_data.active_core_settings_tab === tab.slug ? 1 : 0}>
                          <SettingsTabIcon>
                            <FontAwesomeIcon icon={["fad", tab.icon]} />
                          </SettingsTabIcon> {tab.title}
                        </SettingsTabInner>
                        <SettingsTabStatusBar active={customer_support_data.active_core_settings_tab === tab.slug ? 1 : 0} />
                      </SettingsTabPadding>
                    </SettingsTab>
                  );
                })}

              </SettingsTabsInner>
            </SettingsTabsPadding>
          </SettingsTabs>
          <TabContent>
            {customer_support_data.active_core_settings_tab === "maintenance"
              ? (
                <RowBodyPadding gutter={50} paddingbottom={1}>
                  {application_types.map((type, index) => {
                    return (
                      <RowContentSection span={12} key={index}>
                        <SectionHeader margintop={index > 0 ? 25 : 0}>{capitalize(type)}</SectionHeader>
                        <InputWrapper>
                          <InputLabel>App Version</InputLabel>
                          <Input
                            type="number"
                            step="0.01"
                            id={`${type}_app_version`}
                            min={0}
                            value={this.state[`${type}CoreSettings`][`${type}_app_version`]}
                            placeholder="Enter your title..."
                            onChange={(event) => this.set(event.target.id, event.target.value, type)}
                          />
                        </InputWrapper>
                        <InputWrapper>
                          <InputLabel>Maintenance Mode?</InputLabel>
                          <Checkbox
                            checked={this.state[`${type}CoreSettings`][`${type}_maintenance_mode`]}
                            borderThickness={3}
                            size={2}
                            tickSize={2}
                            onChange={(is_checked) => this.set(`${type}_maintenance_mode`, is_checked, type)}
                          />
                        </InputWrapper>
                        <InputWrapper>
                          <InputLabel>Debug Mode?</InputLabel>
                          <Checkbox
                            checked={this.state[`${type}CoreSettings`][`${type}_debug`]}
                            borderThickness={3}
                            size={2}
                            tickSize={2}
                            onChange={(is_checked) => this.set(`${type}_debug`, is_checked, type)}
                          />
                        </InputWrapper>
                        {this.state[`${type}CoreSettings`][`${type}_maintenance_mode`]
                          ? (
                            <>
                              <InputWrapper>
                                <InputLabel>Maintenance Mode Title</InputLabel>
                                <Input
                                  type="text"
                                  id={`${type}_maintenance_mode_title`}
                                  value={this.state[`${type}CoreSettings`][`${type}_maintenance_mode_title`]}
                                  placeholder="Enter a title..."
                                  onChange={(event) => this.set(event.target.id, event.target.value.replace("'", "’"), type)}
                                />
                              </InputWrapper>
                              <InputWrapper>
                                <InputLabel>Maintenance Mode Message</InputLabel>
                                <TextArea
                                  id={`${type}_maintenance_mode_message`}
                                  value={this.state[`${type}CoreSettings`][`${type}_maintenance_mode_message`]}
                                  placeholder="Enter a message..."
                                  onChange={(event) => this.set(event.target.id, event.target.value.replace("'", "’"), type)}
                                  rows={8}
                                />
                              </InputWrapper>
                            </>
                          )
                          : null
                        }
                        <SettingsButtonContainer span={12}>
                          <SaveProfileButton disabled={!this.state[`${type}UpdatedCoreSettings`] || (this.state[`${type}UpdatedCoreSettings`] && !Object.keys(this.state[`${type}UpdatedCoreSettings`]).length)} type="button" onClick={() => this.saveSettings(type)} nomargin primary green outline>{is_loading ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Save"}</SaveProfileButton>
                        </SettingsButtonContainer>
                      </RowContentSection>
                    );
                  })}
                </RowBodyPadding>
              )
              : null
            }
            {customer_support_data.active_core_settings_tab === "cs-users"
              ? (
                <GenericTable
                  onRefresh={localStorage.removeItem("react-avatar/failing")}
                  permissions={["hopetrust-core"]}
                  getData={customerServiceGetCSUsers}
                  columns={cs_table_columns}
                  page_size={25}
                  data_path={["customer_support", "cs_users"]}
                  initial_data={[]}
                  loading={customer_support_data.isFetchingCSUsers}
                  requested={customer_support_data.requestedCsUsers}
                  header="Support Users"
                  paging={true}
                  search={true}
                  columnResizing={true}
                  radius={0}
                  fields={[
                    {
                      caption: "First Name",
                      name: "first_name",
                      type: "string"
                    },
                    {
                      caption: "Last Name",
                      name: "last_name",
                      type: "string"
                    },
                    {
                      caption: "Full Name",
                      name: "name",
                      type: "string"
                    },
                    {
                      caption: "Email",
                      name: "email",
                      type: "string"
                    },
                    {
                      caption: "State",
                      name: "state",
                      type: "string"
                    },
                    {
                      caption: "Status",
                      name: "status",
                      type: "select",
                      options: [
                        { value: "active", caption: "Active" },
                        { value: "inactive", caption: "Inactive" }
                      ]
                    },
                    {
                      caption: "Created",
                      name: "created_at",
                      type: "date"
                    }
                  ]}
                />
              )
              : null
            }
            {customer_support_data.active_core_settings_tab === "roles"
              ? <SupportRoles />
              : null
            }
            {customer_support_data.active_core_settings_tab === "messaging-settings"
              ? (
                <GenericTable
                  permissions={["hopetrust-core"]}
                  getData={getCoreSettings}
                  columns={message_settings_columns}
                  page_size={25}
                  data_path={["customer_support", "core_settings", "email_signature_identifiers"]}
                  initial_data={[]}
                  newRow={{
                    isTableDispatch: true,
                    onClick: "openNewItemField",
                    arguments: { updateProp: "email_signature_identifiers", action: updateCoreSettings },
                    fields: [
                      {
                        type: "text",
                        name: "term",
                        placeholder: "Enter a term...",
                        condition: (value) => value
                      }
                    ]
                  }}
                  rowKeyField="term"
                  loading={customer_support_data.isFetchingCoreSettings}
                  requested={customer_support_data.requestedCoreSettings}
                  header="Email Signature Identifiers"
                  paging={true}
                  search={true}
                  radius={0}
                  columnResizing={false}
                />
              )
              : null
            }
            {customer_support_data.active_core_settings_tab === "document-settings"
              ? (
                <GenericTable
                  permissions={["hopetrust-core"]}
                  getData={getCoreSettings}
                  columns={document_settings_columns}
                  page_size={25}
                  data_path={["customer_support", "core_settings", "document_types"]}
                  initial_data={[]}
                  newRow={{
                    isTableDispatch: true,
                    onClick: "openNewItemField",
                    arguments: { updateProp: "document_types", action: updateCoreSettings },
                    fields: [
                      {
                        type: "component",
                        name: "category",
                        condition: (value) => value,
                        Component: (key, newItemConfig, updateNewItemField, NewItemFieldInput) => {
                          return (
                            <Autosuggest
                              key={key}
                              suggestions={uniqBy(customer_support_data.core_settings.document_types, "category").filter((a) => a.category)}
                              containerProps={{
                                style: {
                                  flexGrow: 1,
                                  flexBasis: 0
                                }
                              }}
                              onSuggestionsClearRequested={() => ({})}
                              onSuggestionsFetchRequested={({ value, reason }) => ({})}
                              getSuggestionValue={(suggestion) => suggestion.category}
                              renderSuggestionsContainer={({ containerProps, children, query }) => {
                                return (
                                  <SuggestionsContainer {...containerProps}>
                                    {children}
                                  </SuggestionsContainer>
                                );
                              }}
                              renderSuggestion={(suggestion, { query, isHighlighted }) => {
                                const substring = (suggestion.category || "").split(query);
                                if (substring.length) {
                                  return (
                                    <SuggestionMain>
                                      <SuggestionPadding>
                                        <SuggestionInner isHighlighted={isHighlighted}>
                                          <div dangerouslySetInnerHTML={{ __html: substring.join(`<strong>${query}</strong>`) }} />
                                        </SuggestionInner>
                                      </SuggestionPadding>
                                    </SuggestionMain>
                                  );
                                }
                                return null;
                              }}
                              renderInputComponent={(inputProps) => {
                                return (
                                  <NewItemFieldInput {...inputProps} />
                                );
                              }}
                              shouldRenderSuggestions={() => true}
                              highlightFirstSuggestion={false}
                              focusInputOnSuggestionClick={false}
                              onSuggestionSelected={(event, { suggestionValue }) => updateNewItemField({ ...newItemConfig, values: { ...newItemConfig.values, category: suggestionValue } })}
                              inputProps={{
                                name: "category",
                                type: "text",
                                placeholder: `${customer_support_data.core_settings.document_types.length ? "Choose" : "Enter"} a category...`,
                                value: newItemConfig.values["category"] || "",
                                onChange: (event, { newValue, method }) => updateNewItemField({ ...newItemConfig, values: { ...newItemConfig.values, category: event.target.value } })
                              }}
                            />
                          );
                        }
                      },
                      {
                        type: "text",
                        name: "type",
                        placeholder: "Enter a type...",
                        condition: (value) => value
                      },
                      {
                        type: "text",
                        name: "icon",
                        placeholder: "Enter an icon...",
                        condition: (value) => value
                      }
                    ]
                  }}
                  rowKeyField="type"
                  loading={customer_support_data.isFetchingCoreSettings}
                  requested={customer_support_data.requestedCoreSettings}
                  additional_info={<a target="_blank" rel="noreferrer" href="https://fontawesome.com/v6/search">Search Icons</a>}
                  header="Document Types"
                  paging={true}
                  search={true}
                  radius={0}
                  columnResizing={false}
                />
              )
              : null
            }
            {customer_support_data.active_core_settings_tab === "budget-categories"
              ? (
                <GenericTable
                  permissions={["hopetrust-core"]}
                  getData={getCoreSettings}
                  columns={budget_category_columns}
                  page_size={25}
                  data_path={["customer_support", "core_settings", "budget_categories"]}
                  initial_data={[]}
                  newRow={{
                    isTableDispatch: true,
                    onClick: "openNewItemField",
                    arguments: { updateProp: "budget_categories", action: updateCoreSettings },
                    fields: [
                      {
                        type: "component",
                        name: "category",
                        condition: (value) => value,
                        Component: (key, newItemConfig, updateNewItemField, NewItemFieldInput) => {
                          return (
                            <Autosuggest
                              key={key}
                              suggestions={uniqBy(customer_support_data.core_settings.budget_categories, "category")}
                              containerProps={{
                                style: {
                                  flexGrow: 1,
                                  flexBasis: 0
                                }
                              }}
                              onSuggestionsClearRequested={() => ({})}
                              onSuggestionsFetchRequested={({ value, reason }) => ({})}
                              getSuggestionValue={(suggestion) => suggestion.category}
                              renderSuggestionsContainer={({ containerProps, children, query }) => {
                                return (
                                  <SuggestionsContainer {...containerProps}>
                                    {children}
                                  </SuggestionsContainer>
                                );
                              }}
                              renderSuggestion={(suggestion, { query, isHighlighted }) => {
                                const substring = (suggestion.category || "").split(query);
                                if (substring.length) {
                                  return (
                                    <SuggestionMain>
                                      <SuggestionPadding>
                                        <SuggestionInner isHighlighted={isHighlighted}>
                                          <div dangerouslySetInnerHTML={{ __html: substring.join(`<strong>${query}</strong>`) }} />
                                        </SuggestionInner>
                                      </SuggestionPadding>
                                    </SuggestionMain>
                                  );
                                }
                                return null;
                              }}
                              renderInputComponent={(inputProps) => {
                                return (
                                  <NewItemFieldInput {...inputProps} />
                                );
                              }}
                              shouldRenderSuggestions={() => true}
                              highlightFirstSuggestion={false}
                              focusInputOnSuggestionClick={false}
                              onSuggestionSelected={(event, { suggestion, suggestionValue }) => updateNewItemField({ ...newItemConfig, values: { ...newItemConfig.values, category: suggestionValue, parent_color: suggestion.parent_color } })}
                              inputProps={{
                                name: "category",
                                type: "text",
                                placeholder: `${customer_support_data.core_settings.budget_categories.length ? "Choose" : "Enter"} a parent category...`,
                                value: newItemConfig.values["category"] || "",
                                onChange: (event, { newValue, method }) => {
                                  const parentExists = customer_support_data.core_settings.budget_categories.find((bc) => bc.category === event.target.value);
                                  if (parentExists) updateNewItemField({ ...newItemConfig, values: { ...newItemConfig.values, category: event.target.value, parent_color: parentExists.parent_color }})
                                  else updateNewItemField({ ...newItemConfig, values: { ...newItemConfig.values, category: event.target.value, parent_color: "#000000"}})
                                }
                              }}
                            />
                          );
                        }
                      },
                      {
                        type: "color",
                        name: "parent_color",
                        value: "#000000",
                        style: {
                          flexGrow: 0,
                          minWidth: "36px",
                          padding: "5px"
                        },
                        condition: (value) => value,
                        show: (newItemConfig) => {
                          const parentExists = customer_support_data.core_settings.budget_categories.find((bc) => bc.category === newItemConfig.values.category);
                          return !parentExists;
                        }
                      },
                      {
                        type: "text",
                        name: "name",
                        placeholder: "Enter a category name...",
                        condition: (value) => value
                      },
                      {
                        type: "color",
                        name: "color",
                        value: "#000000",
                        style: {
                          flexGrow: 0,
                          minWidth: "36px",
                          padding: "5px"
                        },
                        condition: (value) => value
                      }
                    ]
                  }}
                  rowKeyField="name"
                  loading={customer_support_data.isFetchingCoreSettings}
                  requested={customer_support_data.requestedCoreSettings}
                  header="Budget Categories"
                  paging={true}
                  search={true}
                  radius={0}
                  columnResizing={false}
                />
              )
              : null
            }
            {customer_support_data.active_core_settings_tab === "asset-types"
              ? (
                <GenericTable
                  permissions={["hopetrust-core"]}
                  getData={getCoreSettings}
                  columns={asset_type_columns}
                  page_size={25}
                  data_path={["customer_support", "core_settings", "asset_types"]}
                  initial_data={[]}
                  newRow={{
                    isTableDispatch: true,
                    onClick: "openNewItemField",
                    arguments: { updateProp: "asset_types", action: updateCoreSettings },
                    fields: [
                      {
                        type: "component",
                        name: "category",
                        condition: (value) => value,
                        Component: (key, newItemConfig, updateNewItemField, NewItemFieldInput) => {
                          return (
                            <Autosuggest
                              key={key}
                              suggestions={uniqBy(customer_support_data.core_settings.asset_types, "category")}
                              containerProps={{
                                style: {
                                  flexGrow: 1,
                                  flexBasis: 0
                                }
                              }}
                              onSuggestionsClearRequested={() => ({})}
                              onSuggestionsFetchRequested={({ value, reason }) => ({})}
                              getSuggestionValue={(suggestion) => suggestion.category}
                              renderSuggestionsContainer={({ containerProps, children, query }) => {
                                return (
                                  <SuggestionsContainer {...containerProps}>
                                    {children}
                                  </SuggestionsContainer>
                                );
                              }}
                              renderSuggestion={(suggestion, { query, isHighlighted }) => {
                                const substring = (suggestion.category || "").split(query);
                                if (substring.length) {
                                  return (
                                    <SuggestionMain>
                                      <SuggestionPadding>
                                        <SuggestionInner isHighlighted={isHighlighted}>
                                          <div dangerouslySetInnerHTML={{ __html: substring.join(`<strong>${query}</strong>`) }} />
                                        </SuggestionInner>
                                      </SuggestionPadding>
                                    </SuggestionMain>
                                  );
                                }
                                return null;
                              }}
                              renderInputComponent={(inputProps) => {
                                return (
                                  <NewItemFieldInput {...inputProps} />
                                );
                              }}
                              shouldRenderSuggestions={() => true}
                              highlightFirstSuggestion={false}
                              focusInputOnSuggestionClick={false}
                              onSuggestionSelected={(event, { suggestionValue }) => updateNewItemField({ ...newItemConfig, values: { ...newItemConfig.values, category: suggestionValue } })}
                              inputProps={{
                                name: "category",
                                type: "text",
                                placeholder: `${customer_support_data.core_settings.asset_types.length ? "Choose" : "Enter"} a parent category...`,
                                value: newItemConfig.values["category"] || "",
                                onChange: (event, { newValue, method }) => updateNewItemField({ ...newItemConfig, values: { ...newItemConfig.values, category: event.target.value } })
                              }}
                            />
                          );
                        }
                      },
                      {
                        type: "text",
                        name: "type",
                        placeholder: "Enter an asset type...",
                        condition: (value) => value
                      },
                      {
                        type: "color",
                        name: "color",
                        value: "#000000",
                        style: {
                          flexGrow: 0,
                          minWidth: "36px",
                          padding: "5px"
                        },
                        condition: (value) => value
                      }
                    ]
                  }}
                  rowKeyField="type"
                  loading={customer_support_data.isFetchingCoreSettings}
                  requested={customer_support_data.requestedCoreSettings}
                  header="Asset Types"
                  paging={true}
                  search={true}
                  radius={0}
                  columnResizing={false}
                />
              )
              : null
            }
            {customer_support_data.active_core_settings_tab === "income-types"
              ? (
                <GenericTable
                  permissions={["hopetrust-core"]}
                  getData={getCoreSettings}
                  columns={income_type_columns}
                  page_size={25}
                  data_path={["customer_support", "core_settings", "income_types"]}
                  initial_data={[]}
                  newRow={{
                    isTableDispatch: true,
                    onClick: "openNewItemField",
                    arguments: { updateProp: "income_types", action: updateCoreSettings },
                    fields: [
                      {
                        type: "component",
                        name: "category",
                        condition: (value) => value,
                        Component: (key, newItemConfig, updateNewItemField, NewItemFieldInput) => {
                          return (
                            <Autosuggest
                              key={key}
                              suggestions={uniqBy(customer_support_data.core_settings.income_types, "category")}
                              containerProps={{
                                style: {
                                  flexGrow: 1,
                                  flexBasis: 0
                                }
                              }}
                              onSuggestionsClearRequested={() => ({})}
                              onSuggestionsFetchRequested={({ value, reason }) => ({})}
                              getSuggestionValue={(suggestion) => suggestion.category}
                              renderSuggestionsContainer={({ containerProps, children, query }) => {
                                return (
                                  <SuggestionsContainer {...containerProps}>
                                    {children}
                                  </SuggestionsContainer>
                                );
                              }}
                              renderSuggestion={(suggestion, { query, isHighlighted }) => {
                                const substring = (suggestion.category || "").split(query);
                                if (substring.length) {
                                  return (
                                    <SuggestionMain>
                                      <SuggestionPadding>
                                        <SuggestionInner isHighlighted={isHighlighted}>
                                          <div dangerouslySetInnerHTML={{ __html: substring.join(`<strong>${query}</strong>`) }} />
                                        </SuggestionInner>
                                      </SuggestionPadding>
                                    </SuggestionMain>
                                  );
                                }
                                return null;
                              }}
                              renderInputComponent={(inputProps) => {
                                return (
                                  <NewItemFieldInput {...inputProps} />
                                );
                              }}
                              shouldRenderSuggestions={() => true}
                              highlightFirstSuggestion={false}
                              focusInputOnSuggestionClick={false}
                              onSuggestionSelected={(event, { suggestionValue }) => updateNewItemField({ ...newItemConfig, values: { ...newItemConfig.values, category: suggestionValue } })}
                              inputProps={{
                                name: "category",
                                type: "text",
                                placeholder: `${customer_support_data.core_settings.income_types.length ? "Choose" : "Enter"} a parent category...`,
                                value: newItemConfig.values["category"] || "",
                                onChange: (event, { newValue, method }) => updateNewItemField({ ...newItemConfig, values: { ...newItemConfig.values, category: event.target.value } })
                              }}
                            />
                          );
                        }
                      },
                      {
                        type: "text",
                        name: "type",
                        placeholder: "Enter an income type...",
                        condition: (value) => value
                      },
                      {
                        type: "color",
                        name: "color",
                        value: "#000000",
                        style: {
                          flexGrow: 0,
                          minWidth: "36px",
                          padding: "5px"
                        },
                        condition: (value) => value
                      }
                    ]
                  }}
                  rowKeyField="type"
                  loading={customer_support_data.isFetchingCoreSettings}
                  requested={customer_support_data.requestedCoreSettings}
                  header="Income Types"
                  paging={true}
                  search={true}
                  radius={0}
                  columnResizing={false}
                />
              )
              : null
            }
            {customer_support_data.active_core_settings_tab === "benefit-types"
              ? (
                <GenericTable
                  permissions={["hopetrust-core"]}
                  getData={getCoreSettings}
                  columns={benefit_type_columns}
                  page_size={25}
                  data_path={["customer_support", "core_settings", "benefit_types"]}
                  initial_data={[]}
                  newRow={{
                    isTableDispatch: true,
                    onClick: "openNewItemField",
                    arguments: { updateProp: "benefit_types", action: updateCoreSettings },
                    fields: [
                      {
                        type: "component",
                        name: "category",
                        condition: (value) => value,
                        Component: (key, newItemConfig, updateNewItemField, NewItemFieldInput) => {
                          return (
                            <Autosuggest
                              key={key}
                              suggestions={uniqBy(customer_support_data.core_settings.benefit_types, "category")}
                              containerProps={{
                                style: {
                                  flexGrow: 1,
                                  flexBasis: 0
                                }
                              }}
                              onSuggestionsClearRequested={() => ({})}
                              onSuggestionsFetchRequested={({ value, reason }) => ({})}
                              getSuggestionValue={(suggestion) => suggestion.category}
                              renderSuggestionsContainer={({ containerProps, children, query }) => {
                                return (
                                  <SuggestionsContainer {...containerProps}>
                                    {children}
                                  </SuggestionsContainer>
                                );
                              }}
                              renderSuggestion={(suggestion, { query, isHighlighted }) => {
                                const substring = (suggestion.category || "").split(query);
                                if (substring.length) {
                                  return (
                                    <SuggestionMain>
                                      <SuggestionPadding>
                                        <SuggestionInner isHighlighted={isHighlighted}>
                                          <div dangerouslySetInnerHTML={{ __html: substring.join(`<strong>${query}</strong>`) }} />
                                        </SuggestionInner>
                                      </SuggestionPadding>
                                    </SuggestionMain>
                                  );
                                }
                                return null;
                              }}
                              renderInputComponent={(inputProps) => {
                                return (
                                  <NewItemFieldInput {...inputProps} />
                                );
                              }}
                              shouldRenderSuggestions={() => true}
                              highlightFirstSuggestion={false}
                              focusInputOnSuggestionClick={false}
                              onSuggestionSelected={(event, { suggestionValue }) => updateNewItemField({ ...newItemConfig, values: { ...newItemConfig.values, category: suggestionValue } })}
                              inputProps={{
                                name: "category",
                                type: "text",
                                placeholder: `${customer_support_data.core_settings.benefit_types.length ? "Choose" : "Enter"} a parent category...`,
                                value: newItemConfig.values["category"] || "",
                                onChange: (event, { newValue, method }) => updateNewItemField({ ...newItemConfig, values: { ...newItemConfig.values, category: event.target.value } })
                              }}
                            />
                          );
                        }
                      },
                      {
                        type: "text",
                        name: "type",
                        placeholder: "Enter an asset type...",
                        condition: (value) => value
                      },
                      {
                        type: "color",
                        name: "color",
                        value: "#000000",
                        style: {
                          flexGrow: 0,
                          minWidth: "36px",
                          padding: "5px"
                        },
                        condition: (value) => value
                      }
                    ]
                  }}
                  rowKeyField="type"
                  loading={customer_support_data.isFetchingCoreSettings}
                  requested={customer_support_data.requestedCoreSettings}
                  header="Benefit Types"
                  paging={true}
                  search={true}
                  radius={0}
                  columnResizing={false}
                />
              )
              : null
            }
            {customer_support_data.active_core_settings_tab === "contact-types"
              ? (
                <GenericTable
                  permissions={["hopetrust-core"]}
                  getData={getCoreSettings}
                  columns={contact_settings_columns}
                  page_size={25}
                  data_path={["customer_support", "core_settings", "contact_types"]}
                  initial_data={[]}
                  newRow={{
                    isTableDispatch: true,
                    onClick: "openNewItemField",
                    arguments: { updateProp: "contact_types", action: updateCoreSettings },
                    fields: [
                      {
                        type: "component",
                        name: "category",
                        condition: (value) => value,
                        Component: (key, newItemConfig, updateNewItemField, NewItemFieldInput) => {
                          return (
                            <Autosuggest
                              key={key}
                              suggestions={uniqBy(customer_support_data.core_settings.contact_types, "category")}
                              containerProps={{
                                style: {
                                  flexGrow: 1,
                                  flexBasis: 0
                                }
                              }}
                              onSuggestionsClearRequested={() => ({})}
                              onSuggestionsFetchRequested={({ value, reason }) => ({})}
                              getSuggestionValue={(suggestion) => suggestion.category}
                              renderSuggestionsContainer={({ containerProps, children, query }) => {
                                return (
                                  <SuggestionsContainer {...containerProps}>
                                    {children}
                                  </SuggestionsContainer>
                                );
                              }}
                              renderSuggestion={(suggestion, { query, isHighlighted }) => {
                                const substring = (suggestion.category || "").split(query);
                                if (substring.length) {
                                  return (
                                    <SuggestionMain>
                                      <SuggestionPadding>
                                        <SuggestionInner isHighlighted={isHighlighted}>
                                          <div dangerouslySetInnerHTML={{ __html: substring.join(`<strong>${query}</strong>`) }} />
                                        </SuggestionInner>
                                      </SuggestionPadding>
                                    </SuggestionMain>
                                  );
                                }
                                return null;
                              }}
                              renderInputComponent={(inputProps) => {
                                return (
                                  <NewItemFieldInput {...inputProps} />
                                );
                              }}
                              shouldRenderSuggestions={() => true}
                              highlightFirstSuggestion={false}
                              focusInputOnSuggestionClick={false}
                              onSuggestionSelected={(event, { suggestionValue }) => updateNewItemField({ ...newItemConfig, values: { ...newItemConfig.values, category: suggestionValue } })}
                              inputProps={{
                                name: "category",
                                type: "text",
                                placeholder: `${customer_support_data.core_settings.contact_types.length ? "Choose" : "Enter"} a parent category...`,
                                value: newItemConfig.values["category"] || "",
                                onChange: (event, { newValue, method }) => updateNewItemField({ ...newItemConfig, values: { ...newItemConfig.values, category: event.target.value } })
                              }}
                            />
                          );
                        }
                      },
                      {
                        type: "component",
                        name: "child_category",
                        condition: (value) => value,
                        Component: (key, newItemConfig, updateNewItemField, NewItemFieldInput) => {
                          return (
                            <Autosuggest
                              key={key}
                              suggestions={uniqBy(customer_support_data.core_settings.contact_types, "child_category")}
                              containerProps={{
                                style: {
                                  flexGrow: 1,
                                  flexBasis: 0
                                }
                              }}
                              onSuggestionsClearRequested={() => ({})}
                              onSuggestionsFetchRequested={({ value, reason }) => ({})}
                              getSuggestionValue={(suggestion) => suggestion.child_category}
                              renderSuggestionsContainer={({ containerProps, children, query }) => {
                                return (
                                  <SuggestionsContainer {...containerProps}>
                                    {children}
                                  </SuggestionsContainer>
                                );
                              }}
                              renderSuggestion={(suggestion, { query, isHighlighted }) => {
                                const substring = (suggestion.child_category || "").split(query);
                                if (substring.length) {
                                  return (
                                    <SuggestionMain>
                                      <SuggestionPadding>
                                        <SuggestionInner isHighlighted={isHighlighted}>
                                          <div dangerouslySetInnerHTML={{ __html: substring.join(`<strong>${query}</strong>`) }} />
                                        </SuggestionInner>
                                      </SuggestionPadding>
                                    </SuggestionMain>
                                  );
                                }
                                return null;
                              }}
                              renderInputComponent={(inputProps) => {
                                return (
                                  <NewItemFieldInput {...inputProps} />
                                );
                              }}
                              shouldRenderSuggestions={() => true}
                              highlightFirstSuggestion={false}
                              focusInputOnSuggestionClick={false}
                              onSuggestionSelected={(event, { suggestionValue }) => updateNewItemField({ ...newItemConfig, values: { ...newItemConfig.values, child_category: suggestionValue } })}
                              inputProps={{
                                name: "child_category",
                                type: "text",
                                placeholder: `${customer_support_data.core_settings.contact_types.length ? "Choose" : "Enter"} a sub category...`,
                                value: newItemConfig.values["child_category"] || "",
                                onChange: (event, { newValue, method }) => updateNewItemField({ ...newItemConfig, values: { ...newItemConfig.values, child_category: event.target.value } })
                              }}
                            />
                          );
                        }
                      },
                      {
                        type: "text",
                        name: "type",
                        placeholder: "Enter a type...",
                        condition: (value) => value
                      }
                    ]
                  }}
                  rowKeyField="type"
                  loading={customer_support_data.isFetchingCoreSettings}
                  requested={customer_support_data.requestedCoreSettings}
                  header="Contact Types"
                  paging={true}
                  search={true}
                  radius={0}
                  columnResizing={false}
                />
              )
              : null
            }
          </TabContent>
        </RowContentSection>
      </RowBody>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session,
  customer_support_data: state.customer_support
});
const dispatchToProps = (dispatch) => ({
  showNotification: (type, title, message) => dispatch(showNotification(type, title, message)),
  getCoreSettings: (override) => dispatch(getCoreSettings(override)),
  updateCoreSettings: (updates) => dispatch(updateCoreSettings(updates)),
  changeCoreSettingsTab: (tab) => dispatch(changeCoreSettingsTab(tab))
});
export default connect(mapStateToProps, dispatchToProps)(CoreSettings);
