import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { isMobile, isTablet } from "react-device-detect";
import ReactAvatar from "react-avatar";
import RelationshipPermissionsSettings from "../../Components/RelationshipPermissionsSettings";
import UserProfileGeneralSettings from "../../Components/UserProfileGeneralSettings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ViewContainer,
  Page,
  PageHeader,
  PageAction,
  Button
} from "../../global-components";
import {
  UserProfileMain,
  UserProfileMainHeader,
  UserProfileMainSection,
  UserProfileMainSectionPadding,
  UserProfileMainSectionInner,
  UserProfileHeaderTitle,
  UserProfileSectionPadding,
  UserProfileSectionHeader,
  UserProfileHeaderBackground,
  UserProfileAvatarContainer,
  UserProfileSectionBody,
  UserProfileSectionFooter,
  UserProfileName,
  UserProfileSecondaryInfo,
  UserProfileContactIcons,
  UserProfileContactIcon,
  UserProfileContactLink
} from "./style";

export const advisor_types = [
  { name: "law", alias: "Law Firm" },
  { name: "bank_trust", alias: "Bank or Trust Company" },
  { name: "insurance", alias: "Insurance" },
  { name: "ria", alias: "Investment Advisor" },
  { name: "healthcare", alias: "Healthcare Provider" },
  { name: "accountant", alias: "Accountant" },
  { name: "advocate", alias: "Community Advocate" },
  { name: "education", alias: "Education" },
  { name: "other", alias: "Other" }
];

class AccountUserSingle extends Component {
  constructor(props) {
    super(props);
    const { title, match, relationship, session, accounts } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    const user = relationship.list.find((u) => u.cognito_id === match.params.cognito_id);
    document.title = user ? `${user.first_name} ${user.last_name}` : title;
    this.state = {
      user,
      account,
      permissions: {},
      defaultPermissions: user.permissions || [],
      editing: false
    };
  }

  setPermission = (category, id) => {
    let { permissions } = this.state;
    let newPermissions = permissions;
    newPermissions[category] = id;
    this.setState({
      permissions: newPermissions
    });
  };

  render() {
    const {
      user,
      account,
      editing,
      defaultPermissions
    } = this.state;
    return (
      <ViewContainer>
        <UserProfileMain>
          <UserProfileMainHeader span={12}>
            <Page>
              <PageHeader paddingleftmobile={15} xs={12} sm={12} md={6} lg={6} xl={6} align="left"></PageHeader>
              <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}>

                {account.permissions.includes("account-admin-edit") && !editing
                  ? <Button secondary blue onClick={() => this.setState({ editing: true })}>Edit</Button>
                  : null
                }
                {account.permissions.includes("account-admin-edit") && !editing
                  ? <Button secondary danger>Delete</Button>
                  : null
                }
                {account.permissions.includes("account-admin-edit") && editing
                  ? <Button secondary green>Save</Button>
                  : null
                }
                {account.permissions.includes("account-admin-edit") && editing
                  ? <Button secondary danger onClick={() => this.setState({ editing: false })}>Cancel</Button>
                  : null
                }
              </PageAction>
            </Page>
          </UserProfileMainHeader>
          <UserProfileMainSection xs={12} sm={12} md={12} lg={5} xl={5} sticky={1}>
            <UserProfileMainSectionPadding>
              <UserProfileMainSectionInner>

                <UserProfileSectionHeader>
                  <UserProfileSectionPadding nopadding>

                    <UserProfileContactIcons>

                      <UserProfileContactIcon span={user.is_partner ? 4 : 6}>
                        <UserProfileContactLink href={`mailto:${user.email}`}>
                          <FontAwesomeIcon icon={["fas", "envelope"]} />
                        </UserProfileContactLink>
                      </UserProfileContactIcon>

                      <UserProfileContactIcon span={user.is_partner ? 4 : 6}>
                        <UserProfileContactLink href={`tel:${user.home_phone}`}>
                          <FontAwesomeIcon icon={["fas", "phone"]} />
                        </UserProfileContactLink>
                      </UserProfileContactIcon>

                      {user.is_partner
                        ? (
                          <UserProfileContactIcon span={user.is_partner ? 4 : 6}>
                            <UserProfileContactLink href={`tel:${user.other_phone}`}>
                              <FontAwesomeIcon icon={["fas", "phone-office"]} />
                            </UserProfileContactLink>
                          </UserProfileContactIcon>
                        )
                        : null
                      }

                    </UserProfileContactIcons>

                    <UserProfileHeaderBackground />
                    <UserProfileAvatarContainer>
                      <ReactAvatar className="user-single-avatar" size={150} alt={`${user.first_name} ${user.last_name} Avatar`} src={user.avatar} name={`${user.first_name} ${user.last_name}`} round />
                    </UserProfileAvatarContainer>
                    <UserProfileName>{`${user.first_name} ${user.last_name}`}</UserProfileName>
                    {!user.is_partner
                      ? <UserProfileSecondaryInfo>{user.type}</UserProfileSecondaryInfo>
                      : (
                        <>
                          <UserProfileSecondaryInfo>{user.partner_data.name}</UserProfileSecondaryInfo>
                          <UserProfileSecondaryInfo>{advisor_types.find((at) => user.partner_data.partner_type === at.name).alias}</UserProfileSecondaryInfo>
                        </>
                      )
                    }
                  </UserProfileSectionPadding>
                </UserProfileSectionHeader>

                <UserProfileSectionBody margintop={40} paddingtop={20}>
                  <UserProfileSectionPadding>
                    <UserProfileGeneralSettings defaults={user} updating={editing} viewing={!editing} />
                  </UserProfileSectionPadding>
                </UserProfileSectionBody>

                <UserProfileSectionFooter>
                  <UserProfileSectionPadding>Footer</UserProfileSectionPadding>
                </UserProfileSectionFooter>

              </UserProfileMainSectionInner>
            </UserProfileMainSectionPadding>
          </UserProfileMainSection>
          <UserProfileMainSection xs={12} sm={12} md={12} lg={7} xl={7}>
            <UserProfileMainSectionPadding>
              <UserProfileMainSectionInner>

                <UserProfileSectionHeader>
                  <UserProfileSectionPadding>
                    <UserProfileHeaderTitle>User Permissions</UserProfileHeaderTitle>
                  </UserProfileSectionPadding>
                </UserProfileSectionHeader>

                <UserProfileSectionBody>
                  <UserProfileSectionPadding>
                    <RelationshipPermissionsSettings disabled={!editing} setPermission={this.setPermission} defaults={defaultPermissions} hide_header={true} />
                  </UserProfileSectionPadding>
                </UserProfileSectionBody>

                <UserProfileSectionFooter>
                  <UserProfileSectionPadding>Footer</UserProfileSectionPadding>
                </UserProfileSectionFooter>

              </UserProfileMainSectionInner>
            </UserProfileMainSectionPadding>
          </UserProfileMainSection>
        </UserProfileMain>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  current_user: state.user,
  session: state.session,
  relationship: state.relationship
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(AccountUserSingle);
