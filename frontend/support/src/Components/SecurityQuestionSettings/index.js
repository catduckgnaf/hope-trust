import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { security_questions_table_columns } from "../../column-definitions";
import { getSecurityQuestions, openCreateSecurityQuestionModal, default_categories } from "../../store/actions/security-questions";
import {
  ViewContainer
} from "../../global-components";
import {
  SecurityQuestionsMain,
  SecurityQuestionsPadding,
  SecurityQuestionsInner
} from "./style";
import GenericTable from "../GenericTable";

class SecurityQuestionSettings extends Component {

  constructor(props) {
    super(props);
    document.title = "Security Question Settings";
    this.state = {};
  }

  render() {
    const { security } = this.props;
    return (
      <ViewContainer>
        <SecurityQuestionsMain>
          <SecurityQuestionsPadding>
            <SecurityQuestionsInner>
              <GenericTable
                permissions={["hopetrust-security-questions-edit"]}
                getData={getSecurityQuestions}
                columns={security_questions_table_columns}
                page_size={25}
                data_path={["security", "questions"]}
                initial_data={[]}
                loading={security.isFetching}
                requested={security.requested}
                header="Security Questions"
                newRow={{
                  onClick: openCreateSecurityQuestionModal,
                  arguments: [{}, false, false]
                }}
                paging={true}
                search={true}
                columnResizing={true}
                fields={[
                  {
                    caption: "Question",
                    name: "question",
                    type: "string"
                  },
                  {
                    caption: "Category",
                    name: "category",
                    type: "select",
                    options: default_categories.map((a) => ({ caption: a.label, value: a.value }))
                  },
                  {
                    caption: "Created",
                    name: "created_at",
                    type: "date"
                  },
                  {
                    caption: "Updated",
                    name: "updated_at",
                    type: "date"
                  }
                ]}
              />
            </SecurityQuestionsInner>
          </SecurityQuestionsPadding>
        </SecurityQuestionsMain>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  security: state.security
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(SecurityQuestionSettings);
