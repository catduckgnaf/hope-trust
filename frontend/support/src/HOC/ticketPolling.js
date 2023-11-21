import * as React from "react";
import { connect } from "beautiful-react-redux";
import { openCreateTicketModal } from "../store/actions/tickets";

export const ticketPolling = (pollingAction, duration = 2000) => (Component) => {
    const wrapper = () => (
        class extends React.Component {
            async componentDidMount() {
                this.dataPolling = setInterval(async () => {
                    const updated = await this.props.pollingAction(this.props.tickets.defaults.id);
                    if (updated.success && this.props.tickets.viewing_ticket) this.props.openCreateTicketModal(updated.payload, true, false, 0);
                }, duration);
            }
            componentWillUnmount() {
                clearInterval(this.dataPolling);
            }
            render() {
                return <Component {...this.props} />;
            }
        });
        
    const mapStateToProps = (state) => ({
        tickets: state.tickets
    });
    const mapDispatchToProps = { pollingAction, openCreateTicketModal };
    return connect(mapStateToProps, mapDispatchToProps)(wrapper());
};