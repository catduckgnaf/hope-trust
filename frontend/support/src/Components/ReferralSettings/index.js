import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { deleteReferrals, getReferrals, openCreateReferralModal, updateReferral } from "../../store/actions/referral";
import { advisor_types } from "../../store/actions/partners";
import { referral_table_columns } from "../../column-definitions";
import {
  ViewContainer
} from "../../global-components";
import {
  ReferralCodesMain,
  ReferralCodesPadding,
  ReferralCodesInner
} from "./style";
import GenericTable from "../GenericTable";
import { orderBy } from "lodash";
import { nestedFilter } from "../../utilities";

class ReferralSettings extends Component {

  constructor(props) {
    super(props);
    const { location, referral } = this.props;
    document.title = "Referral Settings";
    let filter = {};
    let referrals = [];
    Object.keys(location.query).forEach((key) => filter[key] = [location.query[key]]);
    window.history.pushState({}, "Referral Settings", window.location.pathname);
    if (Object.keys(filter).length) {
      referrals = nestedFilter(referral.list, filter);
    }
    this.state = {
      referrals
    };
  }

  render() {
    const { referral } = this.props;
    const { referrals } = this.state;
    return (
      <ViewContainer>
        <ReferralCodesMain>
          <ReferralCodesPadding>
            <ReferralCodesInner>
              <GenericTable
                deleteMultiple={deleteReferrals}
                isSelectable={true}
                cellUpdateFunction={updateReferral}
                permissions={["hopetrust-organizations-edit"]}
                getData={getReferrals}
                columns={referral_table_columns}
                page_size={25}
                data_path={["referral", "list"]}
                initial_data={referrals}
                transform_data={(data) => {
                  return orderBy(data, [(r) => r.status === "inactive", "created_at"], ["desc", "desc"]);
                }}
                loading={referral.isFetching}
                requested={referral.requested}
                header="Organizations"
                newRow={{
                  onClick: openCreateReferralModal,
                  arguments: [{}, false, false]
                }}
                filter={{
                  groupName: "and",
                  items: [
                    {
                      field: "status",
                      key: "1",
                      operator: "=",
                      value: "inactive",
                    }
                  ],
                }}
                paging={true}
                search={true}
                columnResizing={true}
                dataRowAttributes={(rowData) => {
                  return {
                    style: {
                      backgroundColor: (rowData.status === "inactive") ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 255, 255, 1)"
                    }
                  }
                }}
                fields={[
                  {
                    caption: "Organization Name",
                    name: "name",
                    type: "string"
                  },
                  {
                    caption: "Referral Prefix",
                    name: "prefix",
                    type: "string"
                  },
                  {
                    caption: "Hubspot Company ID",
                    name: "hubspot_company_id",
                    type: "string"
                  },
                  {
                    caption: "Partners",
                    name: "count",
                    type: "number"
                  },
                  {
                    caption: "Partner Type",
                    name: "type",
                    type: "select",
                    options: advisor_types.map((a) => ({ caption: a.alias, value: a.name }))
                  },
                  {
                    caption: "Status",
                    name: "status",
                    type: "select",
                    options: [
                      { caption: "Active", value: "active" },
                      { caption: "Inactive", value: "inactive" }
                    ]
                  },
                  {
                    caption: "Has MYTO",
                    name: "myto_allowed",
                    type: "select",
                    options: [
                      { caption: "Yes", value: "true" },
                      { caption: "No", value: "false" }
                    ]
                  },
                  {
                    caption: "Can Create Accounts",
                    name: "new_accounts",
                    type: "select",
                    options: [
                      { caption: "Yes", value: "true" },
                      { caption: "No", value: "false" }
                    ]
                  },
                  {
                    caption: "Created",
                    name: "created_at",
                    type: "date"
                  }
                ]}
              />
            </ReferralCodesInner>
          </ReferralCodesPadding>
        </ReferralCodesMain>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  referral: state.referral,
  location: state.router.location
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(ReferralSettings);
