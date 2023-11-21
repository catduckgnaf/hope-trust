import * as React from "react";
import { connect } from "beautiful-react-redux";

export const withPolling = (pollingAction, duration = 120000, args = []) => (Component) => {
    const wrapper = () => (
        class extends React.Component {
            componentDidMount() {
                if (!this.props.session.idle) this.dataPolling = setInterval(() => this.props.pollingAction(...args), duration);
            }
            componentWillUnmount() {
                clearInterval(this.dataPolling);
            }
            render() {
                return <Component {...this.props} />;
            }
        });
        
    const mapStateToProps = (state) => ({
        session: state.session
    });
    const mapDispatchToProps = { pollingAction };
    return connect(mapStateToProps, mapDispatchToProps)(wrapper());
};