import styled from "styled-components";
import media from "styled-media-query";

export const WidgetMain = styled.div`
  position: fixed;
  bottom: 0;
  right: 20px;
  z-index: 999999999;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 4px 10px rgb(0 0 0 / 20%);

  #hubspot-conversations-inline-parent {
    width: 100%;
    height: 100%;
    border-radius: 10px 10px 0 0;
  }

  iframe {
    width: 350px;
    height: 500px;
    border:none;
    border-radius: 10px 10px 0 0;
  }

  ${media.lessThan("768px")`
    border-radius: 0;
    width: 100%;
    height: 100%;
    box-shadow: none;
    top: 0;
    left: 0;

    #hubspot-conversations-inline-parent {
      border-radius: 0;
    }

    iframe {
      width: 100%;
      height: 100%;
      border-radius: 0;
    }
  `};
`;

export const WidgetClose = styled.div`
  position: absolute;
  top: -10px;
  left: -10px;
  background: #FFF;
  font-size: 19px;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  text-align: center;
  box-shadow: 0 4px 8px rgb(0 0 0 / 10%);
  padding: 4px;
  cursor: pointer;

  ${media.lessThan("768px")`
    top: 18px;
    right: 10px;
    left: auto;
  `};
`;