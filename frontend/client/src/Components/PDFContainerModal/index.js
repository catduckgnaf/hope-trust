import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Row, Col } from "react-simple-flex-grid";
import { Modal } from "react-responsive-modal";
import { Button } from "../../global-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  CarePlanCover,
  FinancialOverviewCover,
  HealthOverviewCover
} from "../../pdf-config";
import { closePDFContainerModal, generatePDF, generateWord } from "../../store/actions/pdf";
import {
  PDFContainerMain,
  PDFContainerModal,
  PDFContainerModalModalTitle,
  PDFContainerModalButtonContainer,
  PDFHint,
  PDFHintPadding,
  PDFHintInner
} from "./style";
import showdown from "showdown";
import sanitizeHtml from "sanitize-html";

class PDFContainerModalModal extends Component {

  constructor(props) {
    super(props);
    const { accounts, relationship, session } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    const beneficiary = relationship.list.find((u) => u.type === "beneficiary");
    this.state = { beneficiary, account, all_blocks: [], NCA_table: false };
  }

  getCover = (title) => {
    switch (title) {
      case "Care Plan":
        return CarePlanCover;
      case "Financial Overview":
       return FinancialOverviewCover;
      case "Health Overview":
        return HealthOverviewCover;
      default:
        return false;
    }
  };

  componentDidMount() {
    const { source = [], title, survey } = this.props;
    const { account } = this.state;
    let NCA_table = false;
    let NCA_table_index;
    const converter = new showdown.Converter({ openLinksInNewWindow: true, simplifiedAutoLink: true, encodeEmails: true });
    const allowed_tags = ["h1", "h2", "h3", "h4", "h5", "h6", "a", "b", "i", "strong", "u", "p", "ul", "ol", "li", "hr", "div", "span", "code", "table", "th", "td", "tr", "tbody", "thead", "blockquote"];
    converter.setFlavor("github");
    const all_blocks = source.map((block, index) => {
      let html = converter.makeHtml(block.html);
      let clean = sanitizeHtml(html, {
        allowedTags: allowed_tags,
        allowedAttributes: {
          div: ["class"],
          span: ["class"],
          hr: ["class "],
          i: ["class"],
          code: ["class"],
          h1: ["id", "class"],
          h2: ["id", "class"],
          h3: ["id", "class"],
          h4: ["id", "class"],
          h5: ["id", "class"],
          h6: ["id", "class"],
          p: ["id", "class"],
          table: ["id", "class"],
          thead: ["id", "class"],
          tbody: ["id", "class"],
          th: ["id", "class"],
          tr: ["id", "class"],
          td: ["id", "class"],
          blockquote: ["style"]
        },
        transformTags: {
          "code": () => {
            if (!account.permissions.includes("hopetrust-super-admin")) {
              return {
                tagName: "i",
                attribs: {
                  class: "hidden_uid"
                }
              };
            } else {
              return {
                tagName: "i",
                attribs: {
                  class: "uid"
                }
              };
            }
          },
          "table": () => {
            return {
              tagName: "table",
              attribs: {
                class: "convertable_table"
              }
            };
          },
          "h1": () => {
            if (title === "Trust") {
              return {
                tagName: "h1",
                attribs: {
                  class: "heading_align_center"
                }
              };
            } else {
              return {
                tagName: "h1",
                attribs: {
                  class: "heading_bold"
                }
              };
            }
          },
          "h2": () => {
            if (title === "Trust") {
              return {
                tagName: "h2",
                attribs: {
                  class: "heading_align_center"
                }
              };
            } else {
              return {
                tagName: "h2",
                attribs: {
                  class: "heading_bold"
                }
              };
            }
          },
          "h3": () => {
            if (title === "Trust") {
              return {
                tagName: "h3",
                attribs: {
                  class: "heading_align_center"
                }
              };
            } else {
              return {
                tagName: "h3",
                attribs: {
                  class: "heading_bold"
                }
              };
            }
          },
          "h4": () => {
            if (title === "Trust") {
              return {
                tagName: "h4",
                attribs: {
                  class: "heading_align_center"
                }
              };
            } else {
              return {
                tagName: "h4",
                attribs: {
                  class: "heading_bold"
                }
              };
            }
          },
          "h5": () => {
            if (title === "Trust") {
              return {
                tagName: "h5",
                attribs: {
                  class: "heading_align_center"
                }
              };
            } else {
              return {
                tagName: "h5",
                attribs: {
                  class: "heading_bold"
                }
              };
            }
          },
          "h6": () => {
            if (title === "Trust") {
              return {
                tagName: "h6",
                attribs: {
                  class: "horizontal_rule"
                }
              };
            } else {
              return {
                tagName: "h6",
                attribs: {
                  class: "heading_bold"
                }
              };
            }
          }
        },
        exclusiveFilter: (frame) => {
          if (frame && ["div", "p", "h1", "h2", "h3", "h4"].includes(frame.tag)) {
            if (!frame.text.trim()) return true;
            else return false;
          }
          if (frame && frame.tag === "blockquote") {
            if (frame.text) {
              const parsed = JSON.parse(frame.text);
              if (parsed.type === "table") {
                NCA_table = parsed;
                NCA_table_index = index;
                return true;
              }
            }
          }
          if (frame && frame.attribs) {
            if (frame.tag === "code" && frame.attribs.class && frame.attribs.class === "hidden_uid") return true;
          }
        }
      });
      if (clean.trim().length) return <div id={survey.list.find((s) => s.survey_id === block.survey_id).title} key={index} className={NCA_table && index === NCA_table_index ? "nca_section" : "section"} dangerouslySetInnerHTML={{ __html: clean }} />;
      return false;
    });
    this.setState({ all_blocks, NCA_table });
  }

  render() {
    const { viewingPDF, closePDFContainerModal, id, title, generatePDF, generateWord } = this.props;
    const { beneficiary, account, all_blocks, NCA_table } = this.state;

    return (
      <Modal animationDuration={100} styles={{ modal: { width: "100%", maxWidth: "850px", borderRadius: "5px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={viewingPDF} onClose={() => closePDFContainerModal()} center>
        <PDFContainerModalModalTitle>{`${beneficiary.first_name}'s ${title}`}</PDFContainerModalModalTitle>
        <Row gutter={20}>
          <PDFContainerMain span={12}>
            {this.getCover(title)
              ? <img src={this.getCover(title)} width="100%" alt="Hope Care Plan Cover Page" />
              : null
            }
            <PDFContainerModal span={12} id={id}>
              {NCA_table
                ? (
                  <div id="nca_block">
                    {all_blocks[0]}
                  </div>
                )
                : null
              }
              <div id="all_blocks">
                {NCA_table
                  ? all_blocks.slice(1).map((block) => block)
                  : all_blocks.map((block) => block)
                }
              </div>
            </PDFContainerModal>
          </PDFContainerMain>
        </Row>
        <Row>
          <PDFHint span={12}>
            <PDFHintPadding>
              <PDFHintInner>
                Note: All relevant Health, Life and Finance records will be rendered in your final output.
              </PDFHintInner>
            </PDFHintPadding>
          </PDFHint>
          <Col span={12}>
            <Row>
              <PDFContainerModalButtonContainer span={12}>
                {title === "Trust" || account.permissions.includes("hopetrust-super-admin")
                  ? <Button type="button" onClick={() => generateWord(id, title)} blue><FontAwesomeIcon style={{ fontSize: "20px", verticalAlign: "sub", marginRight: "5px" }} icon={["fad", "file-word"]} /> Save to Word</Button>
                  : null
                }
                {title !== "Trust"
                  ? <Button type="button" onClick={() => generatePDF(id, title, NCA_table, all_blocks)} green><FontAwesomeIcon style={{ fontSize: "20px", verticalAlign: "sub", marginRight: "5px" }} icon={["fad", "file-pdf"]} /> Save to PDF</Button>
                  : null
                }
                <Button type="button" onClick={() => closePDFContainerModal()} blue>Close</Button>
              </PDFContainerModalButtonContainer>
            </Row>
          </Col>
        </Row>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  relationship: state.relationship,
  session: state.session,
  survey: state.survey
});
const dispatchToProps = (dispatch) => ({
  closePDFContainerModal: () => dispatch(closePDFContainerModal()),
  generatePDF: (id, title, NCA_table, all_blocks) => dispatch(generatePDF(id, title, NCA_table, all_blocks)),
  generateWord: (id, title) => dispatch(generateWord(id, title))
});
export default connect(mapStateToProps, dispatchToProps)(PDFContainerModalModal);
