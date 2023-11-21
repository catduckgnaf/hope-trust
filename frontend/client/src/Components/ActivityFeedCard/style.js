import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import { lighten } from "polished";

export const ActivityFeedCardMain = styled(Col)`

`;

export const ActivityFeedCardPadding = styled.div`
  width: 100%;
  padding: 5px;
`;

export const ActivityFeedCardIcon = styled(Col)`
  display: flex;
  align-self: center;
  justify-content center;
  text-align: center;
  font-size: 30px;
`;

export const ActivityFeedCardIconRow = styled(Row)`

`;

export const ActivityFeedCardIconCol = styled(Col)`
  padding: 3px 0;
  overflow: hidden;
`;

export const ActivityFeedCardInner = styled(Row)`
  width: 100%;
  color: ${theme.metadataGrey};
  background: ${theme.white};
  box-shadow: 0 2px 4px ${theme.boxShadowLight};
  border-color: ${lighten(0.05, theme.metadataGrey)};
  border-radius: 0 6px 6px 0;
  border-left-style: solid;
  border-left-width: 3px;
  padding: 10px 0;
  transition: 0.1s ease;

  &:hover {
    border-left-width: 6px;
  }

  & > ${ActivityFeedCardIcon} {
    color: ${theme.notificationOrange};
  }

  ${(props) => props.status === "new" && css`
    border-color: ${lighten(0.1, theme.notificationYellow)};
    & > ${ActivityFeedCardIcon} {
      color: ${theme.notificationYellow};
    }
  `};

  ${(props) => props.status === "pending" && css`
    border-color: ${lighten(0.1, theme.notificationYellow)};

    & > ${ActivityFeedCardIcon} {
      color: ${theme.notificationYellow};
    }
  `};
  ${(props) => props.status === "approved" && css`
    border-color: ${lighten(0.1, theme.buttonLightGreen)};

    & > ${ActivityFeedCardIcon} {
      color: ${theme.buttonLightGreen};
    }
  `};
  ${(props) => props.status === "declined" && css`
    border-color: ${lighten(0.1, theme.errorRed)};

  & > ${ActivityFeedCardIcon} {
      color: ${theme.errorRed};
    }
  `};

  ${(props) => props.type === "money" && css`
    border-color: ${lighten(0.2, theme.moneyRequestColor)};

    & > ${ActivityFeedCardIcon} {
      color: ${theme.moneyRequestColor};
    }
  `};
  ${(props) => props.type === "medical" && css`
    border-color: ${lighten(0.1, theme.medicalRequestColor)};

    & > ${ActivityFeedCardIcon} {
      color: ${theme.medicalRequestColor};
    }
  `};
  ${(props) => props.type === "food" && css`
    border-color: ${lighten(0.05, theme.foodRequestColor)};

    & > ${ActivityFeedCardIcon} {
      color: ${theme.foodRequestColor};
    }
  `};
  ${(props) => props.type === "transportation" && css`
    border-color: ${lighten(0.1, theme.transportationRequestColor)};

    & > ${ActivityFeedCardIcon} {
      color: ${theme.transportationRequestColor};
    }
  `};
  ${(props) => props.type === "other_request_type" && css`
    border-color: ${lighten(0.1, theme.otherRequestColor)};

    & > ${ActivityFeedCardIcon} {
      color: ${theme.otherRequestColor};
    }
  `};

  ${(props) => props.type === "account_update" && css`
    border-color: ${lighten(0.1, theme.buttonGreen)};

    & > ${ActivityFeedCardIcon} {
      color: ${theme.buttonGreen};
    }
  `};

  ${(props) => props.type === "new_relationship" && css`
    border-color: ${lighten(0.1, theme.notificationOrange)};

    & > ${ActivityFeedCardIcon} {
      color: ${theme.notificationOrange};
    }
  `};

  ${(props) => props.type === "professional_portal_assistance" && css`
    border-color: ${lighten(0.1, theme.hopeTrustBlue)};

    & > ${ActivityFeedCardIcon} {
      color: ${theme.hopeTrustBlue};
    }
  `};

  ${(props) => props.type === "domain_approved" && css`
    border-color: ${lighten(0.1, theme.hopeTrustBlue)};

    & > ${ActivityFeedCardIcon} {
      color: ${theme.hopeTrustBlue};
    }
  `};

`;

export const ActivityFeedCardIconImageLabel = styled.div`
  text-align: center;
  padding-top: 5px;
  font-size: 12px;
  font-weight: 400;
  text-transform: capitalize;
  color: ${theme.metadataGrey};
  text-overflow: ellipsis;
  max-width: 75%;
  margin: auto;
  overflow: hidden;
  white-space: nowrap;
`;

export const ActivityFeedCardBody = styled(Col)`
  display: flex;
  align-self: center;
  justify-content center;

  ${(props) => props.paddingleft && css`
    padding-left: ${props.paddingleft}px;
  `};
`;

export const ActivityFeedCardItem = styled(Row)`
  font-size: 13px;
  font-weight: 400;
  margin: 5px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  max-width: 90%;
  white-space: nowrap;
`;

export const ActivityFeedCardItemInner = styled(Col)`
  padding: 3px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  max-width: 90%;
  white-space: nowrap;
  ${(props) => props.transform && css`
    text-transform: ${props.transform};
  `};
`;

export const ItemStrong = styled.div`
  display: inline-block;
  font-weight: 500;
  min-width: 85px;
`;

export const ActivityFeedCardActions = styled(Col)`
  align-self: center;
`;

export const ActivityFeedCardActionsInner = styled(Row)`
  text-align: center;
`;

export const ActivityFeedCardAction = styled(Col)`
  display: flex;
  align-self: center;
  justify-content center;
  font-size: 13px;
  cursor: pointer;

  ${(props) => props.disabled && css`
    opacity: 0.3;
    cursor: no-drop;
  `};
`;

export const ActivityFeedCardActionInner = styled(Row)`
  text-align: center;
  color: ${theme.metadataGrey};
`;