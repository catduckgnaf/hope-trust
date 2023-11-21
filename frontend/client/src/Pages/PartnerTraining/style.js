import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "../../global-styles";
import media from "styled-media-query";

export const VideosContainer = styled(Row)`
  padding: 20px;
  background: ${theme.white};
  border-radius: 10px;
  overflow: hidden;

  ${media.lessThan("350px")`
    padding: 5px;
  `};
`;

export const VideoDataContainer = styled(Col)`
  
`;

export const VideoDataItem = styled(Col)`
  margin-top: 20px;
`;

export const QuizSectionHeading = styled(Row)`
    color: ${theme.hopeTrustBlue};
    font-weight: 400;
    font-size: 18px;
    margin-top: 20px
    margin-bottom: 10px;
    padding-left: 5px;
`;

export const QuizSections = styled(Row)`
  &:first-child {
    ${QuizSectionHeading} {
      margin-top: 0;
    }
  }
`;
export const QuizModules = styled.div`

`;

export const QuizSection = styled(Col)`
  
`;

export const QuizTextSection = styled(Col)`
  
`;

export const QuizButtonsContainer = styled.div`
  margin: 10px 0;
`;

export const CertificateDownload = styled.div`
  color: ${theme.white};
  display: inline-block;
  font-size: 12px;
  opacity: 0.8;
  cursor: pointer;

  ${media.lessThan("484px")`
    font-size: 11px;
  `};
`;

export const HeadingDescription = styled.h5`
  opacity: 0.6;
  margin: 10px 0;

  ${media.lessThan("484px")`
    font-size: 11px;
  `};
`;

export const HeadingSmall = styled.h6`
  opacity: 0.6;
	margin: 0;
	letter-spacing: 1px;
	text-transform: uppercase;

  ${media.lessThan("484px")`
    font-size: 11px;
  `};
`;

export const HeadingLarge = styled.h2`
  letter-spacing: 1px;
	margin: 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;

  ${media.lessThan("484px")`
    font-size: 18px;
  `};

  ${(props) => props.status === "Locked" && css`
    color: ${theme.metadataGrey};
  `};

  ${(props) => props.status === "Passed" && css`
    color: ${theme.buttonLightGreen};
  `};

  ${(props) => props.status === "Failed" && css`
    color: ${theme.errorRed};
  `};

  ${(props) => props.status === "Incomplete" && css`
    color: ${theme.hopeTrustBlue};
  `};
`;

export const CoursePreview = styled.div`
  background-color: ${theme.hopeTrustBlue};
	color: ${theme.white};
	padding: 20px;
	max-width: 160px;
  min-width: 160px;
  border-radius: 10px 0 0 10px;

  a {
    color: ${theme.white};
    display: inline-block;
    font-size: 12px;
    opacity: 0.8;
    margin-top: 30px;
    text-decoration: none;

    ${media.lessThan("484px")`
      font-size: 10px;
    `};
  }

  ${media.lessThan("484px")`
    max-width: 130px;
    min-width: 130px;
  `};
`;

export const Course = styled.div`
  background-color: ${theme.white};
	border-radius: 10px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	display: flex;
	max-width: 100%;
  min-height: 208px;

  ${(props) => props.disabled && css`
    background-color: ${theme.disabled};
    cursor: no-drop;

    ${HeadingLarge} {
      color: ${theme.labelGrey};
    }
    ${CoursePreview} {
      background-color: ${theme.labelGrey};
      color: ${theme.disabled};
      ${HeadingLarge} {
        color: ${theme.disabled};
      }
    }
  `};

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const CourseInfo = styled.div`
  padding: 20px;
	position: relative;
	width: 100%;
`;

export const ProgressContainer = styled.div`
  position: absolute;
	top: 15px;
	right: 30px;
	text-align: right;
	width: 110px;

  ${media.lessThan("484px")`
    display: none;
  `};
`;

export const Progress = styled.div`
  background-color: ${theme.lightGrey};
	border-radius: 3px;
	height: 5px;
	width: 100%;

  &:after {
    border-radius: 3px;
    background-color: ${theme.lightGrey};
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 5px;
    width: 0;
    ${(props) => props.percentage && css`
      width: ${props.percentage}%;
    `};
    ${(props) => props.percentage >= 90 && css`
      background-color: ${theme.buttonLightGreen};
    `};

    ${(props) => props.percentage < 90 && props.percentage >= 70 && css`
      background-color: ${theme.notificationYellow};
    `};

    ${(props) => props.percentage < 70 && css`
      background-color: ${theme.errorRed};
    `};
  }
`;

export const ProgressText = styled.div`
  font-size: 10px;
	opacity: 0.6;
	letter-spacing: 1px;
  margin-top: 4px;
`;

export const BtnContainer = styled.div`
  position: absolute;
	bottom: 20px;
	right: 30px;
  display: flex;

  ${media.lessThan("484px")`
    right: 10px;
  `};
`;

export const Btn = styled.button`
  background-color: ${theme.hopeTrustBlue};
	border: 0;
	border-radius: 50px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	color: ${theme.white};
	font-size: 13px;
	padding: 10px 20px;
  margin-left: 5px;

  ${(props) => props.green && css`
      background-color: ${theme.buttonLightGreen};
    `};

  ${(props) => props.disabled && css`
    background-color: ${theme.disabled};
    color: ${theme.labelGrey};
    cursor: no-drop;
    pointer-events: none;
  `};

  &:hover {
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  ${media.lessThan("484px")`
    font-size: 10px;
    padding: 10px;
  `};
`;

export const LoaderContainer = styled.div`
  width: 100%;
  text-align: center;
  padding: 20px;
`;