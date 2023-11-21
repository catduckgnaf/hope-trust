import * as React from "react";
import { connect } from "beautiful-react-redux";
import { openTicketModal } from "../store/actions/request";

export const ticketPolling = (pollingAction, duration = 2000) => (Component) => {
    const wrapper = () => (
        class extends React.Component {
            async componentDidMount() {
                this.dataPolling = setInterval(async () => {
                    const updated = await this.props.pollingAction(this.props.request.focus.id);
                    if (updated.success && this.props.request.viewingTicket) this.props.openTicketModal(updated.payload);
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
        request: state.request
    });
    const mapDispatchToProps = { pollingAction, openTicketModal };
    return connect(mapStateToProps, mapDispatchToProps)(wrapper());
};