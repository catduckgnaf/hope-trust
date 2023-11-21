import styled, { css } from "styled-components";
import media from "styled-media-query";

/*

  ------------------------
    CONTAINERS
  ------------------------

*/


export const Container = styled.div`
  overflow: auto;
  background-color: #D1D9E5;
  font-family: "Noto Sans", sans-serif;
  font-size: 16px;
  color: #2E395A;

  height: auto;
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  ${(props) => props.background_image && css`
    min-height:100%;
    background:linear-gradient(0deg, rgba(209, 217, 229, 0.95), rgba(209, 217, 229, 0.95)), url(${props.background_image});
    background-size:cover;
  `};

  ${media.lessThan("medium")`
    height: 100vh;
  `}

  ${(props) => props.fixed && css`
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 99999999;
  `};

  ${(props) => props.absolute && css`
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 99999999;
  `};
`;

export const MultipartFormWrapper = styled.article`
  background-color: white;
  max-width: 100rem;
  min-height: 40rem;
  min-width: 70rem;
  margin: 20px;
  width: auto;

  display: flex;

  border-radius: 14px;
  box-shadow: 0px 30px 60px -20px rgba(0, 0, 0, 0.1);

  ${media.lessThan("medium")`
    flex-direction: column;
    height: 100%;
    margin: 0;
  `}

  ${media.lessThan("1135px")`
    min-width: 100%;
    width: 100%;
    border-radius: 0;
  `}
`;

/*

  ------------------------
    MultipartForm SIDEBAR
  ------------------------

*/


export const MultipartFormSidebar = styled.aside`
  max-width: 26rem;
  width: 100%;

  padding: 3.5rem;

  text-align: center;

  ${media.lessThan("medium")`
    padding: 1.5rem 2.75rem 1.5rem 2.75rem;
    margin: 0 auto;
  `}
`;

export const SidebarHeader = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const SidebarContent = styled.section`
  ${media.lessThan("medium")`
    display: none;
  `}
`;

/*

  ------------------------
    MultipartForm BODY
  ------------------------

*/

export const MultipartFormBody = styled.main`
  position: relative;
  background-color: #F4F6F8;

  flex-grow: 1;
  padding: 0 5.5rem;
  display: flex;
  flex-direction: column;
  
  border-radius: 0 14px 14px 0;

  ${(props) => !props.sidebar && css`
    border-radius: 14px;
  `};

  // iPad Breakpoint
  ${media.lessThan("810px")`
    padding: 0 2rem;
  `}

  ${media.lessThan("medium")`
    flex-direction: column-reverse;
    justify-content: start;

    border-radius: 0;
    padding: 0 4rem 2rem 4rem;
  `}

  ${media.lessThan("small")`
    padding: 0 2.25rem 2.25rem 2.25rem;
  `}
`;

export const MultipartFormHeader = styled.header`
  margin-top: 6.25rem;

  ${media.lessThan("medium")`
    margin: 1.5rem 0;
    text-align: center;
  `}
`;

export const MultipartFormForm = styled.form`
  margin-top: 2rem;
  height: 100%;

  display: flex;
  flex-direction: column;

  ${media.lessThan("medium")`
    margin-top: 1rem;
  `}
`;

export const FormInputsContainer = styled.div`
  flex-grow: 1;
`;

export const FormGroup = styled.div`
  display: flex;
`;

export const FormInputGroup = styled.div`
  width: 100%;

  ${FormGroup} &:not(:first-child) {
    margin-left: 0.75rem;
  }
`;

export const FormActions = styled.section`
  justify-self: end;
  margin: 1.75rem 0 4rem 0;
  width: 100%;
  align-items: center;

  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;

  ${media.lessThan("medium")`
    flex-direction: column;
    margin: 2rem 0 0 0;
  `}
`;