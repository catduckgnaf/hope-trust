import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  NoPermissionMain,
  NoPermissionPadding,
  NoPermissionInner,
  NoPermissionInnerSection,
  NoPermissionInnerSectionIcon,
  NoPermissionInnerSectionText,
  NoPermissionInnerSectionInner,
  NoPermissionInnerSectionIconSuper,
  NoPermissionInnerSectionIconRegular
} from "./style";

class NoPermission extends Component {

  render() {
    const { message, icon } = this.props;
    return (
      <NoPermissionMain>
        <NoPermissionPadding>
          <NoPermissionInner>
            <NoPermissionInnerSection span={12}>
              <NoPermissionInnerSectionIcon>
                <NoPermissionInnerSectionInner className="fa-layers fa-fw">
                  <NoPermissionInnerSectionIconRegular>
                    <FontAwesomeIcon icon={["fad", icon]} size="sm"/>
                  </NoPermissionInnerSectionIconRegular>
                  <NoPermissionInnerSectionIconSuper>
                    <FontAwesomeIcon icon={["fad", "lock-alt"]} size="sm" transform="shrink-9 down-5 left-6"/>
                  </NoPermissionInnerSectionIconSuper>
                </NoPermissionInnerSectionInner>
              </NoPermissionInnerSectionIcon>
            </NoPermissionInnerSection>
            <NoPermissionInnerSection span={12}>
              <NoPermissionInnerSectionText>
                {message}
              </NoPermissionInnerSectionText>
            </NoPermissionInnerSection>
          </NoPermissionInner>
        </NoPermissionPadding>
      </NoPermissionMain>
    );
  }
}

export default NoPermission;
