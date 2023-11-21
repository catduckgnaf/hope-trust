import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { toastr } from "react-redux-toastr";
import PropTypes from "prop-types";
import { Button } from "../../global-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { openCreateBeneficiaryAssetModal, deleteBeneficiaryAssetRecord } from "../../store/actions/beneficiary-assets";
import { theme } from "../../global-styles";
import { lighten } from "polished";
import Tooltip from "react-simple-tooltip";
import {
  BeneficiaryFinanceCardMain,
  BeneficiaryFinanceCardPadding,
  BeneficiaryFinanceCardInner,
  BeneficiaryFinanceCardSection,
  BeneficiaryFinanceCardSectionText,
  MobileLabel,
  IconContainer,
  IconContainerInner
} from "./style";
import { getAccountTypeColor } from "../../store/actions/utilities";

class BeneficiaryFinanceCard extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, session } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    this.state = {
      permissions: account.permissions
    };
  }

  deleteFinance = (id, plaid_item_id) => {
    const { deleteBeneficiaryAssetRecord } = this.props;
    const deleteOptions = {
      onOk: () => deleteBeneficiaryAssetRecord(id, plaid_item_id),
      onCancel: () => toastr.removeByType("confirms"),
      okText: "Delete",
      cancelText: "Cancel"
    };
    toastr.confirm("Are you sure you want to delete this asset?", deleteOptions);
  };

  render() {
    const { finance, openCreateBeneficiaryAssetModal } = this.props;
    const { permissions } = this.state;
    return (
      <BeneficiaryFinanceCardMain>
        <BeneficiaryFinanceCardPadding>
          {finance.source === "Plaid"
            ? (
              <IconContainer>
                <IconContainerInner>
                  <Tooltip arrow={15} placement="right" background={lighten(0.6, theme.hopeTrustBlue)} radius={6} padding={0} border="none" color={theme.hopeTrustBlue} content={<div style={{ fontSize: "12px", width: "200px", boxShadow: "0 4px 8px rgba(0,0,0,0.2)", padding: "8px 10px", borderRadius: "6px", background: lighten(0.6, theme.hopeTrustBlue) }}>Bank Account Linked By Plaid</div>}><FontAwesomeIcon icon={["fad", "university"]} /></Tooltip>
                </IconContainerInner>
              </IconContainer>
            )
            : null
          }
          <BeneficiaryFinanceCardInner color={getAccountTypeColor(finance.account_type)} debt={finance.has_debt ? 1 : 0}>
            <BeneficiaryFinanceCardSection xs={12} sm={12} md={3} lg={3} xl={3}>
              <MobileLabel>Account Type: </MobileLabel><BeneficiaryFinanceCardSectionText transform="capitalize" paddingleft={15}>{finance.friendly_name || finance.account_type}</BeneficiaryFinanceCardSectionText>
            </BeneficiaryFinanceCardSection>
            <BeneficiaryFinanceCardSection xs={12} sm={12} md={3} lg={3} xl={3}>
              <MobileLabel>Account Number: </MobileLabel><BeneficiaryFinanceCardSectionText transform="uppercase" encrypt>{(finance.account_number.length !== 4 ? `${finance.account_number}` : `****${finance.account_number}`) || "N/A"}</BeneficiaryFinanceCardSectionText>
            </BeneficiaryFinanceCardSection>
            <BeneficiaryFinanceCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Total Value: </MobileLabel><BeneficiaryFinanceCardSectionText transform="capitalize">${finance.value.toLocaleString()}</BeneficiaryFinanceCardSectionText>
            </BeneficiaryFinanceCardSection>
            <BeneficiaryFinanceCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Net Value: </MobileLabel><BeneficiaryFinanceCardSectionText transform="capitalize">${(finance.value - finance.debt).toLocaleString()}</BeneficiaryFinanceCardSectionText>
            </BeneficiaryFinanceCardSection>
            <BeneficiaryFinanceCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Actions: </MobileLabel>

              {permissions.includes("finance-edit")
                ? (
                  <BeneficiaryFinanceCardSectionText paddingtop={3} paddingbottom={3}>
                    <Button marginright={5} nomargin blue small onClick={() => openCreateBeneficiaryAssetModal(finance.type, finance.account_type, finance.source, finance, true, false)}>Edit</Button>
                    <Button nomargin danger small onClick={() => this.deleteFinance(finance.id, finance.plaid_item_id)}>Delete</Button>
                  </BeneficiaryFinanceCardSectionText>
                )
                : (
                  <BeneficiaryFinanceCardSectionText paddingtop={3} paddingbottom={3}>
                    <Button marginright={5} nomargin blue small onClick={() => openCreateBeneficiaryAssetModal(finance.type, finance.account_type, finance.source, finance, false, true)}>View</Button>
                  </BeneficiaryFinanceCardSectionText>
                )
              }
            </BeneficiaryFinanceCardSection>
          </BeneficiaryFinanceCardInner>
        </BeneficiaryFinanceCardPadding>
      </BeneficiaryFinanceCardMain>
    );
  }
}
const mapStateToProps = (state) => ({
  accounts: state.accounts,
  user: state.user,
  session: state.session,
  core_settings: state.customer_support.core_settings
});
const dispatchToProps = (dispatch) => ({
  deleteBeneficiaryAssetRecord: (id, plaid_item_id) => dispatch(deleteBeneficiaryAssetRecord(id, plaid_item_id)),
  openCreateBeneficiaryAssetModal: (type, finance_type, source, defaults, updating, viewing) => dispatch(openCreateBeneficiaryAssetModal(type, finance_type, source, defaults, updating, viewing))
});
export default connect(mapStateToProps, dispatchToProps)(BeneficiaryFinanceCard);
