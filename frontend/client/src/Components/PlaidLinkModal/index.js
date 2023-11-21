import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { allowNumbersOnly } from "../../utilities";
import { showLoader, hideLoader } from "../../store/actions/loader";
import { showNotification } from "../../store/actions/notification";
import { closePlaidLinkModal, getPlaidAccounts } from "../../store/actions/plaid";
import { Row, Col } from "react-simple-flex-grid";
import { Modal } from "react-responsive-modal";
import { isMobile } from "react-device-detect";
import { isSelfAccount } from "../../utilities";
import { Button, SelectLabel, Select, RequiredStar, Input, InputWrapper, InputLabel } from "../../global-components";
import {
  AccountItems,
  AccountItemMain,
  AccountItemPadding,
  AccountItemInner,
  AccountItemSection,
  AccountItem,
  AccountItemField,
  PlaidLinkModalTitle,
  AccountItemTitle,
  LinkAccountsButtonContainer
} from "./style";

class PlaidLinkModal extends Component {

  constructor(props) {
    super(props);
    const { accounts, session, metadata, grantor_assets, beneficiary_assets } = this.props;
    const currentAccount = accounts.find((account) => account.account_id === session.account_id);
    const merged = metadata.accounts.map((a) => {
      const current_asset = [...grantor_assets.list, ...beneficiary_assets.list].find((ca) => ca.plaid_account_id === a.id);
      return {
        ...a,
        asset_type: current_asset?.type || "",
        friendly_name: current_asset?.friendly_name || "",
        assigned_percent: current_asset?.assigned_percent || 0,
        vesting_type: current_asset?.vesting_type || ""
      };
    });
    this.state = {
      metadata: { ...metadata, accounts: merged },
      currentAccount
    };
  }

  createAccounts = async () => {
    let { metadata } = this.state;
    const { showNotification, closePlaidLinkModal, showLoader, hideLoader, getPlaidAccounts, token } = this.props;
    const isComplete = metadata.accounts.every(this.checkMetadata);
    if (isComplete) {
      showLoader("Linking Accounts...");
      const linked = await getPlaidAccounts(token, metadata);
      if (linked.success) {
        closePlaidLinkModal();
        showNotification("success", "Accounts Linked", `Your accounts from ${metadata.institution.name} have been linked.`);
      } else {
        showNotification("error", "Accounts Not Linked", "An error occurred when linking your accounts.");
      }
      hideLoader();
    } else {
      showNotification("error", "Required fields missing", "You must fill in all required fields.");
    }

  };

  checkMetadata = (account) => {
    if (account.asset_type === "grantor") return account.vesting_type && account.asset_type;
    if (account.asset_type === "beneficiary") return account.asset_type;
    return false;
  };

  validPercentage = (event) => {
    if (event.target.value < 0) event.target.value = 0;
    if (event.target.value > 100) event.target.value = 100;
  };

  updateAccounts = (index, id, value) => {
    let { metadata } = this.state;
    let accounts = metadata.accounts;
    accounts[index][id] = value;
    metadata.accounts = accounts;
    this.setState({ metadata });
  };

  render() {
    const { linkingAssets, closePlaidLinkModal, user } = this.props;
    let { metadata, currentAccount } = this.state;
    const institution = metadata.institution;
    const accounts = metadata.accounts;


    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "900px", width: "100%", borderRadius: "5px", marginTop: isMobile ? "95px" : "50px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={linkingAssets} onClose={() => closePlaidLinkModal()} center>
        <PlaidLinkModalTitle>Accounts at {institution.name}</PlaidLinkModalTitle>
        <Row>
          <Col span={12}>
            <AccountItems gutter={20}>
              {metadata.accounts.map((account, index) => {
                return (
                  <AccountItemMain key={index} xs={12} sm={12} md={12} lg={metadata.accounts.length === 1 ? 12 : 6} xl={metadata.accounts.length === 1 ? 12 : 6}>
                    <AccountItemPadding>
                      <AccountItemInner>
                        <AccountItemSection span={12}>
                          <AccountItemTitle>{`${account.subtype} Account - ****${account.mask}`}</AccountItemTitle>
                          <AccountItem>
                            <AccountItemField>
                              <InputWrapper>
                                <InputLabel><RequiredStar>*</RequiredStar> Account Type:</InputLabel>
                                <SelectLabel>
                                  <Select onChange={(event) => this.updateAccounts(index, "asset_type", event.target.value)} value={account.asset_type}>
                                    <option disabled value="">Choose an asset type</option>
                                    <option value="beneficiary" disabled={!currentAccount.permissions.includes("finance-edit")}>{isSelfAccount(user, currentAccount) ? "Personal Asset" : "Beneficiary Asset"}</option>
                                    <option value="grantor" disabled={!currentAccount.permissions.includes("grantor-assets-edit")}>{isSelfAccount(user, currentAccount) ? "Trust Asset" : "Grantor Asset"}</option>
                                  </Select>
                                </SelectLabel>
                              </InputWrapper>
                            </AccountItemField>
                          </AccountItem>
                        </AccountItemSection>
                        <AccountItemSection span={12}>
                          <AccountItem>
                            <AccountItemField>
                              <InputWrapper>
                                <InputLabel>Nickname:</InputLabel>
                                <Input maxLength="25" onChange={(event) => this.updateAccounts(index, "friendly_name", event.target.value)} type="text" value={account.friendly_name || account.name} placeholder="Example: Jack's Savings Account" />
                              </InputWrapper>
                            </AccountItemField>
                          </AccountItem>
                        </AccountItemSection>
                        {account.asset_type === "grantor" && account.vesting_type !== "non-trust"
                          ? (
                            <AccountItemSection span={12}>
                              <AccountItem>
                                <AccountItemField>
                                  <InputWrapper>
                                    <InputLabel><RequiredStar>*</RequiredStar> Trust Allocation % (What percentage will be placed in trust?):</InputLabel>
                                    <Input min={0} onBlur={this.validPercentage} onKeyPress={allowNumbersOnly} onChange={(event) => this.updateAccounts(index, "assigned_percent", Number(event.target.value))} type="number" inputMode="numeric" pattern="[0-9]*" value={account.assigned_percent} placeholder="What percent will go to a trust?" />
                                  </InputWrapper>
                                </AccountItemField>
                              </AccountItem>
                            </AccountItemSection>
                          )
                          : null
                        }
                        {account.asset_type === "grantor"
                          ? (
                            <AccountItemSection span={12}>
                              <AccountItem>
                                <AccountItemField>
                                  <InputWrapper>
                                    <InputLabel><RequiredStar>*</RequiredStar> Vesting Type (When will this asset be added to the trust?):</InputLabel>
                                    <SelectLabel>
                                      <Select onChange={(event) => this.updateAccounts(index, "vesting_type", event.target.value)} value={account.vesting_type}>
                                        <option disabled value="">Choose a vesting type</option>
                                        <option value="current">Current</option>
                                        <option value="future">Future</option>
                                        <option value="non-trust">Non-Trust</option>
                                      </Select>
                                    </SelectLabel>
                                  </InputWrapper>
                                </AccountItemField>
                              </AccountItem>
                            </AccountItemSection>
                          )
                          : null
                        }
                      </AccountItemInner>
                    </AccountItemPadding>
                  </AccountItemMain>
                );
              })}
            </AccountItems>
          </Col>
          <Col span={12}>
            <Row>
              <LinkAccountsButtonContainer span={12}>
                <Button type="button" onClick={() => this.createAccounts()} green nomargin>{`Link ${accounts.length} ${accounts.length === 1 ? "Account" : "Accounts"}`}</Button>
                <Button type="button" onClick={() => closePlaidLinkModal()} green>Cancel</Button>
              </LinkAccountsButtonContainer>
            </Row>
          </Col>
        </Row>

      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  user: state.user,
  session: state.session,
  grantor_assets: state.grantor_assets,
  beneficiary_assets: state.beneficiary_assets
});
const dispatchToProps = (dispatch) => ({
  closePlaidLinkModal: () => dispatch(closePlaidLinkModal()),
  getPlaidAccounts: (token, metadata) => dispatch(getPlaidAccounts(token, metadata)),
  showLoader: (message) => dispatch(showLoader(message)),
  hideLoader: () => dispatch(hideLoader()),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
});
export default connect(mapStateToProps, dispatchToProps)(PlaidLinkModal);
