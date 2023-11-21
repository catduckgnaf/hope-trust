const fetch = require("node-fetch");

const getSessionData = async (survey_id, survey_name, session_id, hidden_fields = ["HTTP", "SCRIPT"]) => {
  const url = `https://www.surveygizmo.com/s3/${survey_id}/${survey_name}?snc=${session_id}&_iseditlink=true&__output=json&programmatic=true`;
  let group_id = 0;
  let s_q_n = 0;
  let answer_id = 0;
  let status = false;
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
  })
    .then((res) => {
      console.log(`-----RESPONSE FOR SESSION ${session_id}-----`, survey_id, res.status, res.statusText);
      status = res.status;
      return res.json();
    })
    .then((data) => {
      let survey_data = {};
      let questions = {};
      let questions_map = {};
      for (let section_id in data.data.Sections) {
        let section = data.data.Sections[section_id];
        if (!section.SectionRuntime) continue;
        if (section.SectionRuntime.Hidden === true) continue;
        // if (section.SectionRuntime.Shown === false) continue;

        for (let question_id in section.Questions) {
          let question = section.Questions[question_id];
          question["section_id"] = parseInt(section_id, 10);
          questions_map[question_id] = question;

          if (question.QuestionRuntime.Data.atoms.length === 0 && question.QuestionRuntime.Type !== "GROUP") continue;
          questions[question_id] = question;
        }
      }

      let groups = {};
      for (let section_id in data.data.Sections) {
        let section = data.data.Sections[section_id];
        if (!section.SectionRuntime) continue;
        if (section.SectionRuntime.Hidden === true) continue;
        if (section.SectionRuntime.Shown === false) continue;

        for (let question_id in section.Questions) {
          let question = section.Questions[question_id];
          if (["TABLE", "GROUP", "MATRIX"].includes(question.QuestionRuntime.Type)) {
            question["section_id"] = parseInt(section_id, 10);
            groups[question_id] = question;
          }
        }
      }

      let meta = {};
      let requests = [];

      for (let group_id in groups) {
        const prom = fetch(`https://api.alchemer.com/v5/survey/${survey_id}/surveyquestion/${group_id}?api_token=${process.env.GIZMO_API_KEY}&api_token_secret=${process.env.GIZMO_SECRET}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
        }).then((r) => r.json()).catch((error) => console.log("SURVEY GIZMO REST API ERROR: ", error));
        requests.push(prom);
      }

      let res = Promise.all(requests).then((result) => {
        result.forEach((response) => {
          if (response.data) meta[response.data.id] = response.data;
        });

        for (group_id in meta) {
          let group = meta[group_id];
          if (!survey_data[group_id]) {
            survey_data[group_id] = {
              "id": parseInt(group_id, 10),
              "type": "parent",
              "shown": true,
              "section_id": parseInt(groups[group_id]["section_id"], 10),
              "subquestions": {}
            };
          }

          for (s_q_n in group.sub_questions) {
            let subquestion = group.sub_questions[s_q_n];

            let question = questions[subquestion.id];
            if (question) {
              if (["RADIO", "CHECKBOX", "MULTI_TEXTBOX"].includes(question.QuestionRuntime.Type)) {
                survey_data[group_id]["subquestions"][subquestion.id] = {};
                for (answer_id in question.QuestionRuntime.Data.atoms) {
                  let formatted_answer_id = answer_id.replace("-other", "");
                  survey_data[group_id]["subquestions"][subquestion.id][formatted_answer_id] = {
                    "id": parseInt(answer_id, 10),
                    "type": question.QuestionRuntime.Type,
                    "shown": true,
                    "answer": question.QuestionRuntime.Data.atoms[answer_id]["raw_value"],
                    "parent": parseInt(group_id, 10),
                  };
                }

              } else {
                for (answer_id in question.QuestionRuntime.Data.atoms) {
                  survey_data[group_id]["subquestions"][subquestion.id] = {
                    "id": parseInt(subquestion.id, 10),
                    "type": question.QuestionRuntime.Type,
                    "shown": true,
                    "answer": question.QuestionRuntime.Data.atoms[answer_id]["raw_value"],
                    "parent": parseInt(group_id, 10),
                    "section_id": parseInt(groups[group_id]["section_id"], 10),
                    "answer_id": parseInt(answer_id, 10)
                  };
                }
              }
            }

            for (let pqid in questions_map) {
              if (questions_map[pqid].QuestionRuntime.PipePrototypeSKU === subquestion.id) {
                for (answer_id in questions_map[pqid].QuestionRuntime.Data.atoms) {
                  survey_data[group_id]["subquestions"][pqid] = {
                    "id": parseInt(pqid, 10),
                    "type": questions_map[pqid].QuestionRuntime.Type,
                    "shown": true,
                    "answer": questions_map[pqid].QuestionRuntime.Data.atoms[answer_id]["raw_value"],
                    "parent": parseInt(group_id, 10),
                    "section_id": parseInt(groups[group_id]["section_id"], 10),
                    "answer_id": parseInt(answer_id, 10),
                    "piped_sku": subquestion.id,
                  };

                  if (questions_map[pqid].QuestionRuntime.PipedValue !== undefined && questions_map[pqid].QuestionRuntime.PipedValue.value !== undefined) {
                    survey_data[group_id]["subquestions"][pqid]["piped_value"] = questions_map[pqid].QuestionRuntime.PipedValue.id;
                  }

                  delete questions[pqid];
                }
              }
            }
            delete questions[subquestion.id];
          }
          delete questions[group_id];
          if (Object.keys(survey_data[group_id].subquestions).length < 1) {
            delete survey_data[group_id];
          }
        }
        let parent_id = 0;
        for (let question_id in questions) {
          let question = questions[question_id];
          if (hidden_fields.includes(question.QuestionRuntime.Type)) continue;
          let qid = question_id;
          if (void 0 !== question.QuestionRuntime.PipePrototypeSKU && question.QuestionRuntime.PipePrototypeSKU !== 0) qid = question.QuestionRuntime.PipePrototypeSKU;

          switch (question.QuestionRuntime.Type) {
            case "CHECKBOX":
            case "MULTI_TEXTBOX":
            case "MULTI_SLIDER":
              survey_data[qid] = {
                "id": parseInt(qid, 10),
                "type": "parent",
                "shown": true,
                "section_id": parseInt(question.section_id, 10),
                "options": {}
              };
              for (let answer_id in question.QuestionRuntime.Data.atoms) {
                let formatted_answer_id = answer_id.replace("-other", "");
                let answer = {
                  "id": parseInt(answer_id, 10),
                  "answer": question.QuestionRuntime.Data.atoms[answer_id]["raw_value"],
                  "option": question.QuestionRuntime.Data.atoms[answer_id]["raw_value"]
                };
                if (survey_data[question_id]) survey_data[question_id]["options"][formatted_answer_id] = answer;
              }
              delete questions[question_id];
              break;

            case "ESSAY":
            case "RADIO":
            case "TEXTBOX":
            case "SLIDER":
            case "MENU":

              let qdata = {};
              for (let answer_id in question.QuestionRuntime.Data.atoms) {
                qdata = {
                  "id": parseInt(qid, 10),
                  "type": question.QuestionRuntime.Type,
                  "shown": true,
                  "section_id": parseInt(question.section_id, 10),
                  "answer": question.QuestionRuntime.Data.atoms[answer_id]["raw_value"],
                  "answer_id": parseInt(answer_id, 10)
                };
              }

              if (question.QuestionRuntime.Number === "" && parent_id) {
                qdata["parent"] = parseInt(parent_id, 10);
                delete (qdata["shown"]);
                delete (qdata["answer_id"]);
                survey_data[parent_id]["subquestions"][qid] = qdata;
              } else {
                survey_data[qid] = qdata;
              }

              delete questions[question_id];
              break;
            case "HIDDEN":
              for (let hidden_count = 0; hidden_count < question.QuestionRuntime.Data.atoms.length; hidden_count++) {
                if (["302"].includes(question_id)) {
                  survey_data[qid] = {
                    "id": parseInt(qid, 10),
                    "type": question.QuestionRuntime.Type,
                    "shown": true,
                    "section_id": parseInt(question.section_id, 10),
                    "answer": question.QuestionRuntime.Data.atoms[hidden_count]["raw_value"]
                  };
                }
              }
              delete questions[question_id];
              break;
            default:
              break;
          }
        }
        let params_exclude = [];
        let params = {};
        for (let key in data.summary.url_variables) {
          if (params_exclude.includes(key)) continue;
          params[key] = {
            key,
            "type": "url",
            "value": data.summary.url_variables[key],
          };
        }

        let res = { survey_data, url_variables: params, response_status: status };
        return res;
      })
      .then((res) => res)
      .catch((error) => {
        console.log(error);
      });

      return res;
    })
    .catch((error) => {
      console.log("SURVEY GIZMO SURVEY DATA ERROR: ", error);
      return error;
    });
};

const getSessionDataAPI = async (survey_id, session_id, hidden_fields = ["HTTP", "SCRIPT", "HIDDEN"]) => {
  const url = `https://api.alchemer.com/v5/survey/${survey_id}/surveyresponse?&api_token=9e90cd7e36396f5bffd2aa6f310be34f8a6bcef89634d7bac8&api_token_secret=A9pNwz6VCDo7U&resultsperpage=1&filter[field][0]=[url("snc")]&filter[operator][0]==&filter[value][0]=${session_id}`;
  return fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => {
      console.log(`-----RESPONSE FOR SESSION ${session_id}-----`, survey_id, res.status, res.statusText);
      return res.json();
    })
    .then((response_data) => {
      if (!response_data.total_pages || !response_data.data.length) return { ready: false };
      let survey_data = {};
      const survey_data_keys = Object.keys(response_data.data[0].survey_data);
      for (let j = 0; j < survey_data_keys.length; j++) {
        const parent_qid = survey_data_keys[j];
        let full_item = response_data.data[0].survey_data[parent_qid];
        if (!full_item.shown) continue;
        if (hidden_fields.includes(full_item.type) && !["302"].includes(parent_qid)) continue;
        if (full_item.question) delete full_item.question;
        if (full_item.subquestions && Object.values(full_item.subquestions).length) {
          let subquestion_keys = Object.keys(full_item.subquestions);
          for (let i = 0; i < subquestion_keys.length; i++) {
            let subquestion_key = subquestion_keys[i];
            let subquestion_item = full_item.subquestions[subquestion_key];
            if (subquestion_item && Object.values(subquestion_item).length) {
              let subquestion_sub_items = Object.keys(subquestion_item);
              for (let j = 0; j < subquestion_sub_items.length; j++) {
                let subquestion_item_key = subquestion_sub_items[j];
                let subquestion_key_item = full_item.subquestions[subquestion_key][subquestion_item_key];
                if (!subquestion_key_item.shown) continue;
                if (subquestion_key_item.question) delete subquestion_key_item.question;
              }
            }
          }
        }
        if (full_item.options && Object.values(full_item.options).length) {
          let options = Object.keys(full_item.options);
          for (let o = 0; o < options.length; o++) {
            let subquestion_key = options[o];
            let subquestion_item = full_item.options[subquestion_key];
            if (!subquestion_item.shown) continue;
            if (subquestion_item.question) delete full_item.question;
          }
        }
        survey_data[parent_qid] = full_item;
      }
      let params_exclude = [];
      let params = {};
      for (let key in response_data.data[0].url_variables) {
        if (params_exclude.includes(key)) continue;
        params[key] = {
          key,
          "type": "url",
          "value": response_data.data[0].url_variables[key].value,
        };
      }
      return { survey_data, url_variables: params, ready: true };
    })
    .catch((error) => {
      console.log("SURVEY GIZMO SURVEY DATA ERROR: ", error);
      return error;
    });
};

module.exports = { getSessionData, getSessionDataAPI };
