import styled, { css } from "styled-components";
import media from "styled-media-query";
import * as Generics from "../elements.styles";

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
  min-width: 40rem;
  margin: 20px;
  width: auto;

  display: flex;

  border-radius: 14px;
  box-shadow: 0px 30px 60px -20px rgba(0, 0, 0, 0.1);

  ${media.lessThan("medium")`
    flex-direction: column;
    border-radius: 0;
    height: 100%;
    min-width: 100%;
    width: 100%;
    margin: 0;
  `}
`;

/*

  ------------------------
    MultipartForm BODY
  ------------------------

*/

export const Progress = styled.div`
  margin: auto;
  width: 15rem;
  height: 5px;
  border-bottom: 1px solid #D8D8D8;
  display: flex;
  justify-content: space-between;
`;

export const MultipartFormBody = styled.main`
  position: relative;
  background: #F4F6F8;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  border-radius: 14px;

  ${media.lessThan("medium")`
    flex-direction: column;
    justify-content: start;

    border-radius: 22px 22px 0 0;
  `}
`;

export const MultipartFormBanner = styled.div`
  
`;

export const MultipartFormHeader = styled.header`
  text-align: center;
  padding-top: 2.25rem;
  background: #FFF;
  border-radius: 14px 14px 0 0;
  padding-bottom: 3rem;

  ${(props) => props.banner && css`
    border-radius: 0;
  `};

  ${media.lessThan("medium")`
    text-align: center;
  `}
`;

export const MultipartFormTitle = styled(Generics.MultipartFormTitle)`
  margin: 1.5rem 0 2rem 0;
  font-size: 30px;
  font-weight: bold;
  line-height: 40px;

  ${media.lessThan("medium")`
    display: block;
    font-size: 24px;
    margin: 1rem 0 1rem 0;
  `}
`;

export const MultipartFormSubtitle = styled.h3`
  margin: 1rem auto 2rem auto;
  font-weight: normal;
  font-size: 16px;
  line-height: 24px;
  color: #136B9D;
  text-align: center;
  width: 80%;

  ${media.lessThan("medium")`
    display: block;
    font-size: 24px;
    margin: 1rem 0 1rem 0;
  `}
`;

export const MultipartFormForm = styled.form`
  height: 100%;
  padding: 2.5rem 4.5rem 0 4.5rem;

  // iPad Breakpoint
  ${media.lessThan("810px")`
    padding: 2rem;
  `}

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  ${media.lessThan("medium")`
    margin-top: 1rem;
    height: auto;
    padding: 2.25rem;
  `}
`;

export const FormInputsContainer = styled.div`
  width: 100%;
`;

export const FormGroup = styled.div`
  display: flex;

  ${MultipartFormForm} > &:last-of-type {
    flex-grow: 1;
  }
`;

export const FormInputGroup = styled.div`
  width: 100%;

  ${MultipartFormForm} > &:last-of-type {
    flex-grow: 1;
  }

  ${FormGroup} &:not(:first-child) {
    margin-left: 0.75rem;
  }
`;

export const FormActions = styled.section`
  justify-self: center;
  margin: 1.75rem 0 4rem 0;
  width: 100%;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  ${Generics.FormButton}:last-child {
    margin-top: 1rem;
  }

  ${media.lessThan("medium")`
    flex-direction: column;
    margin: 2rem 0 0 0;
  `}
`;

export const FormSecondaryCTA = styled.a`
  position: absolute;
  top: 2.5rem;
  transition: 0.2s ease;
  font-size: 14px;
  color: #136B9D;
  border: 1px solid;
  padding: 10px;
  border-radius: 6px;
  text-decoration: none;

  &:hover {
    cursor: pointer;
    background: #136B9D;
    color: white;
  }

  ${(props) => props.position && css`
    ${props.position}: 3rem;
  `};

  ${(props) => props.banner && css`
    top: 3.8rem;
  `};

  ${media.lessThan("medium")`
    position: relative;
    right: auto;
    left: auto;
    top: 1.5rem;
    padding: 5px 10px;
    font-size: 12px;
  `}
`;