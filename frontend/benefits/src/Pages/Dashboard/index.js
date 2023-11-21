import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import WholesaleDashboard from "../../Components/WholesaleDashboard";
import RetailDashboard from "../../Components/RetailDashboard";
import AgentDashboard from "../../Components/AgentDashboard";
import GroupDashboard from "../../Components/GroupDashboard";
import TeamDashboard from "../../Components/TeamDashboard";
import { getRelationships } from "../../store/actions/relationship";
import { capitalize } from "../../utilities";
import { DashboardContainer } from "./style";

const ConditionalDashboard = ({ user, session }) => {
  const account = user && user.accounts ? user.accounts.find((account) => account.account_id === session.account_id) : {};
  document.title = capitalize(`${account.type} Dashboard`);
  switch(account.type) {
    case "wholesale":
      return <WholesaleDashboard />;
    case "retail":
      return <RetailDashboard />;
    case "agent":
      return <AgentDashboard />;
    case "group":
      return <GroupDashboard />;
    case "team":
      return <TeamDashboard />;
    default:
      return <div>default</div>;
  }
};

class Dashboard extends Component {
  constructor(props) {
    super(props);
    document.title = "Dashboard";
  }

  componentDidMount() {
    const { getRelationships, relationship } = this.props;
    if (!relationship.isFetching && !relationship.requested) getRelationships();
    localStorage.removeItem("react-avatar/failing");
  }

  render() {
    const { user, session } = this.props;
    return (
      <DashboardContainer>
        <ConditionalDashboard user={user} session={session} />
      </DashboardContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session,
  relationship: state.relationship
});
const dispatchToProps = (dispatch) => ({
  getRelationships: () => dispatch(getRelationships())
});
export default connect(mapStateToProps, dispatchToProps)(Dashboard);