import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Button } from "../../global-components";
import {
  MainContainer,
  ContainerMain,
  ContainerPadding,
  ContainerInner,
  ContainerInnerTitle,
  ContainerHeader,
  ContainerSection
} from "./style";

class Container extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    title: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Object)
    ]),
    xs: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
    xl: PropTypes.number,
    span: PropTypes.number,
    padding: PropTypes.oneOfType([
      PropTypes.number.isRequired,
      PropTypes.string.isRequired
    ]),
  }
  static defaultProps = {
    title: "",
    xs: 12,
    sm: 12,
    md: 12,
    lg: 12,
    xl: 12,
    span: 12,
    padding: 10
  };

  render() {
    const { hide_buttons = false, children, title, xs, sm, md, lg, xl, id, padding, paddingtop, height, action, overflow, viewall, bottom, transparent } = this.props;
    const hasAction = !!action;
    const hasView = !!viewall;
    const hasBoth = !!(hasAction && hasView);

    return (
      <MainContainer id={id} xs={xs} sm={sm} md={md} lg={lg} xl={xl}>
        <ContainerMain padding={padding} paddingtop={paddingtop}>
          <ContainerPadding>
            <ContainerInner transparent={transparent} height={height} overflow={overflow}>
              <ContainerHeader bottom={bottom}>
                {!hide_buttons
                  ? (
                    <>
                      <ContainerSection xs={!hasBoth ? 8 : 4} sm={!hasBoth ? 8 : 4} md={6} lg={6} xl={6} align="left">
                        {title
                          ? <ContainerInnerTitle>{title}</ContainerInnerTitle>
                          : null
                        }
                      </ContainerSection>
                      <ContainerSection xs={!hasBoth ? 4 : 8} sm={!hasBoth ? 4 : 8} md={6} lg={6} xl={6} align="right">
                        {action
                          ? <Button onClick={() => action.func()} small blue>{action.title}</Button>
                          : null
                        }
                        {viewall
                          ? <Button onClick={() => viewall.func()} small green marginright={10}>{viewall.title}</Button>
                          : null
                        }
                      </ContainerSection>
                    </>
                  )
                  : (
                    <ContainerSection span={12} align="left">
                      {title
                        ? <ContainerInnerTitle>{title}</ContainerInnerTitle>
                        : null
                      }
                    </ContainerSection>
                  )
                }
              </ContainerHeader>
              {children}
            </ContainerInner>
          </ContainerPadding>
        </ContainerMain>
      </MainContainer>
    );
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(Container);
