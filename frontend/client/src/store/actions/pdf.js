import { CONVERT_MARKDOWN, CLOSE_PDF_MODAL, SHOW_LOADER, HIDE_LOADER } from "./constants";
import { showNotification } from "./notification";
import { week_day_colors } from "./schedule";
import { store } from "..";
import {
  CarePlanCover,
  FinancialOverviewCover,
  HealthOverviewCover,
  MedicationsCover,
  ScheduleCover,
  RelationshipsCover,
  ProvidersCover,
  NCAHeader
} from "../../pdf-config";
import { watermark_logo } from "../../watermark";
import { advisor_types } from "../actions/partners";
import { formatUSPhoneNumberPretty, getUserAge } from "../../utilities";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import { orderBy } from "lodash";
import { lighten } from "polished";
import { theme } from "../../global-styles";
import { isMobile, isAndroid } from "react-device-detect";
import { logEvent } from "./utilities";
import { createDocument } from "./document";

const addWaterMark = (doc, width, height) => {
  var totalPages = doc.internal.getNumberOfPages();

  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.addImage(watermark_logo, "PNG", 0, 0, width, height);
  }
  return doc;
};

const capitalize = (str, lower = false) => ((lower ? str.toLowerCase() : str) || "").replace(/(?:^|\s|["'(/[{])+\S/g, (match) => match.toUpperCase());

const getUser = (cognito_id, users) => {
  const owner = users ? users.find((u) => cognito_id === u.cognito_id) : false;
  if (owner) return { name: `${owner.first_name} ${owner.last_name}`, user: owner };
  return false;
};

export const convertMarkdown = (source) => async (dispatch) => {
  dispatch({ type: CONVERT_MARKDOWN, payload: source });
};

export const closePDFContainerModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_PDF_MODAL });
};

const renderGrantorAssetsTable = (doc, grantor_assets) => {
  doc.setFontSize(18);
  doc.text(40, (doc.lastAutoTable && doc.lastAutoTable.id !== "NCA") ? doc.lastAutoTable.finalY + 40 : 50, "Grantor Assets");
  doc.autoTable({
    startY: (doc.lastAutoTable && doc.lastAutoTable.id !== "NCA") ? doc.lastAutoTable.finalY + 55 : 65,
    showHead: "firstPage",
    showFoot: "never",
    headStyles: {
      fillColor: "#136B9D"
    },
    bodyStyles: {
      overflow: "linebreak",
      cellWidth: "auto",
      fontSize: 9
    },
    footStyles: {
      fillColor: "#136B9D"
    },
    head: [
      {
        account_type: "Account Type",
        institution: "Institution",
        account_number: "Account #",
        source: "Source",
        trust_percent: "Trust %",
        value: "Value",
        trust_assets: "Trust Assets"
      }
    ],
    foot: [
      {
        account_type: "Account Type",
        institution: "Institution",
        account_number: "Account #",
        source: "Source",
        trust_percent: "Trust %",
        value: "Value",
        trust_assets: "Trust Assets"
      }
    ],
    body: grantor_assets.map((g) => {
      return {
        account_type: g.friendly_name ? capitalize(g.friendly_name) : capitalize(g.account_type),
        institution: g.institution_name ? capitalize(g.institution_name) : "N/A",
        account_number: g.account_number ? (g.account_number.length !== 4 ? `${g.account_number}` : `****${g.account_number}`) : "N/A",
        source: g.source || "N/A",
        trust_percent: g.assigned_percent ? `${g.assigned_percent}%` : "0%",
        value: g.value ? `$${g.value.toLocaleString()}` : "N/A",
        trust_assets: g.trust_assets ? `$${g.trust_assets.toLocaleString()}` : 0
      };
    })
  });
};

const renderBeneficiaryAssetsTable = (doc, beneficiary_assets) => {
  doc.setFontSize(18);
  doc.text(40, (doc.lastAutoTable && doc.lastAutoTable.id !== "NCA") ? doc.lastAutoTable.finalY + 40 : 50, "Beneficiary Assets");
  doc.autoTable({
    startY: (doc.lastAutoTable && doc.lastAutoTable.id !== "NCA") ? doc.lastAutoTable.finalY + 55 : 65,
    showHead: "firstPage",
    showFoot: "never",
    headStyles: {
      fillColor: "#136B9D"
    },
    bodyStyles: {
      overflow: "linebreak",
      cellWidth: "auto",
      fontSize: 9
    },
    footStyles: {
      fillColor: "#136B9D"
    },
    head: [
      {
        account_type: "Account Type",
        institution: "Institution",
        account_number: "Account #",
        source: "Source",
        value: "Value"
      }
    ],
    foot: [
      {
        account_type: "Account Type",
        institution: "Institution",
        account_number: "Account #",
        source: "Source",
        value: "Value"
      }
    ],
    body: beneficiary_assets.map((g) => {
      return {
        account_type: g.friendly_name ? capitalize(g.friendly_name) : capitalize(g.account_type),
        institution: g.institution_name ? capitalize(g.institution_name) : "N/A",
        account_number: g.account_number ? (g.account_number.length !== 4 ? `${g.account_number}` : `****${g.account_number}`) : "N/A",
        source: g.source || "N/A",
        value: g.value ? `$${g.value.toLocaleString()}` : "N/A"
      };
    })
  });
};

const renderIncomeTable = (doc, income) => {
  doc.setFontSize(18);
  doc.text(40, (doc.lastAutoTable && doc.lastAutoTable.id !== "NCA") ? doc.lastAutoTable.finalY + 40 : 50, "Income");
  doc.autoTable({
    startY: (doc.lastAutoTable && doc.lastAutoTable.id !== "NCA") ? doc.lastAutoTable.finalY + 55 : 65,
    showHead: "firstPage",
    showFoot: "never",
    headStyles: {
      fillColor: "#136B9D"
    },
    bodyStyles: {
      overflow: "linebreak",
      cellWidth: "auto",
      fontSize: 9
    },
    footStyles: {
      fillColor: "#136B9D"
    },
    head: [
      {
        income_type: "Income Type",
        term: "Projected Age Range",
        monthly_value: "Monthly Value",
        annual_value: "Annual Value"
      }
    ],
    foot: [
      {
        income_type: "Income Type",
        term: "Projected Age Range",
        monthly_value: "Monthly Value",
        annual_value: "Annual Value"
      }
    ],
    body: income.map((g) => {
      return {
        income_type: g.income_type ? capitalize(g.income_type) : "N/A",
        term: g.term && g.term.length ? `${g.term[0]} - ${g.term[1]}` : "N/A",
        monthly_value: g.monthly_income ? `$${g.monthly_income.toLocaleString()}` : "N/A",
        annual_value: g.annual_income ? `$${g.annual_income.toLocaleString()}` : "N/A"
      };
    })
  });
};

const renderBenefitsTable = (doc, benefits) => {
  doc.setFontSize(18);
  doc.text(40, (doc.lastAutoTable && doc.lastAutoTable.id !== "NCA") ? doc.lastAutoTable.finalY + 40 : 50, "Benefits");
  doc.autoTable({
    startY: (doc.lastAutoTable && doc.lastAutoTable.id !== "NCA") ? doc.lastAutoTable.finalY + 55 : 65,
    showHead: "firstPage",
    showFoot: "never",
    headStyles: {
      fillColor: "#136B9D"
    },
    bodyStyles: {
      overflow: "linebreak",
      cellWidth: "auto",
      fontSize: 9
    },
    footStyles: {
      fillColor: "#136B9D"
    },
    head: [
      {
        program_name: "Program Name",
        term: "Projected Age Range",
        account_number: "Account #",
        renewal_date: "Renewal Date",
        value: "Value",
        annual_cost: "Annual Value"
      }
    ],
    foot: [
      {
        program_name: "Program Name",
        term: "Projected Age Range",
        account_number: "Account #",
        renewal_date: "Renewal Date",
        value: "Value",
        annual_cost: "Annual Value"
      }
    ],
    body: benefits.map((b) => {
      return {
        program_name: b.program_name ? capitalize(b.program_name) : "N/A",
        term: b.term && b.term.length ? `${b.term[0]} - ${b.term[1]}` : "N/A",
        account_number: b.account_number ? (b.account_number.length !== 4 ? `${b.account_number}` : `****${b.account_number}`) : "N/A",
        renewal_date: b.renewal_date ? moment(b.renewal_date).format("MM/DD/YYYY") : "N/A",
        value: b.value ? `$${b.value.toLocaleString()}` : "N/A",
        annual_cost: b.value ? `$${(b.value * 12).toLocaleString()}` : "N/A"
      };
    })
  });
};

const renderBudgetTable = (doc, budget, beneficiary) => {
  const usable_budgets = budget.filter((b) => b.term.length && b.term[0] <= getUserAge(beneficiary.birthday));
  const total_budget = usable_budgets.reduce((a, { value }) => a + value, 0);
  doc.setFontSize(18);
  doc.text(40, (doc.lastAutoTable && doc.lastAutoTable.id !== "NCA") ? doc.lastAutoTable.finalY + 40 : 50, `Monthly Expenses ($${total_budget.toLocaleString()})`);
  let categories = {};
  budget.forEach((b) => {
    if (categories[b.parent_category]) {
      categories[b.parent_category].push({
        percent_total: `${((b.value / total_budget) * 100).toFixed(1)}%`,
        budget_category: b.budget_category ? capitalize(b.budget_category) : "N/A",
        term: b.term && b.term.length ? `${b.term[0]} - ${b.term[1]}` : "N/A",
        value: b.value ? `$${b.value.toLocaleString()}` : "N/A",
        annual_value: b.value ? `$${(b.value * 12).toLocaleString()}` : "N/A",
        in_range: b.term.length && b.term[0] <= getUserAge(beneficiary.birthday)
      });
    } else {
      categories[b.parent_category] = [
        {
          percent_total: `${((b.value / total_budget) * 100).toFixed(1)}%`,
          budget_category: b.budget_category ? capitalize(b.budget_category) : "N/A",
          term: b.term && b.term.length ? `${b.term[0]} - ${b.term[1]}` : "N/A",
          value: b.value ? `$${b.value.toLocaleString()}` : "N/A",
          annual_value: b.value ? `$${(b.value * 12).toLocaleString()}` : "N/A",
          in_range: b.term.length && b.term[0] <= getUserAge(beneficiary.birthday)
        }
      ];
    }
  });
  let body = [];
  Object.keys(categories).forEach((category) => { // for each key in our schedule map
    const category_items = categories[category]; // grab items from day array
    category_items.forEach((item, index) => { // for each day item
      let row = []; // inititate an empty row
      Object.values(item).forEach((value, sub_item_index) => {
        row.push({ content: value });
        if (!item.in_range) row[sub_item_index].styles = { fillColor: lighten(0.35, theme.errorRed), textColor: theme.errorRed };
    });
      if (index % category_items.length === 0) { // for every X amount of items in the day array, nest them in the day row
        const budget_item = store.getState().customer_support.core_settings.budget_categories.find((b) => b.category === category);
        row.unshift({
          rowSpan: category_items.length,
          content: capitalize(category),
          styles: { valign: "middle", halign: "center", fontStyle: "bold", textColor: budget_item ? budget_item.parent_color : "#000000" }
        });
      }
      body.push(row);
    });
  });
  doc.autoTable({
    startY: (doc.lastAutoTable && doc.lastAutoTable.id !== "NCA") ? doc.lastAutoTable.finalY + 55 : 65,
    showHead: "firstPage",
    showFoot: "never",
    headStyles: {
      fillColor: "#136B9D"
    },
    bodyStyles: {
      overflow: "linebreak",
      cellWidth: "auto",
      fontSize: 9
    },
    footStyles: {
      fillColor: "#136B9D"
    },
    head: [
      {
        parent_category: "Category",
        percent_total: "Percent Total",
        budget_category: "Type",
        term: "Projected Age Range",
        value: "Monthly Cost",
        annual_value: "Annual Cost"
      }
    ],
    foot: [
      {
        parent_category: "Category",
        percent_total: "Percent Total",
        budget_category: "Type",
        term: "Projected Age Range",
        value: "Monthly Cost",
        annual_value: "Annual Cost"
      }
    ],
    body,
    theme: "grid"
  });
};

const renderProvidersTable = (doc, providers, beneficiary) => {
  doc.setFontSize(18);
  doc.text(40, (doc.lastAutoTable && doc.lastAutoTable.id !== "NCA") ? doc.lastAutoTable.finalY + 40 : 50, beneficiary ? `Providers - ${beneficiary.first_name} ${beneficiary.last_name}` : "Providers");
  doc.autoTable({
    startY: (doc.lastAutoTable && doc.lastAutoTable.id !== "NCA") ? doc.lastAutoTable.finalY + 55 : 65,
    showHead: "firstPage",
    showFoot: "never",
    headStyles: {
      fillColor: "#136B9D"
    },
    bodyStyles: {
      overflow: "linebreak",
      cellWidth: "auto",
      minCellWidth: 75,
      fontSize: 9
    },
    footStyles: {
      fillColor: "#136B9D"
    },
    head: [
      {
        name: "Name",
        specialty: "Specialty",
        phone: "Phone",
        email: "Email",
        type: "Type",
        relationship: "Relationship"
      }
    ],
    foot: [
      {
        name: "Name",
        specialty: "Specialty",
        phone: "Phone",
        email: "Email",
        type: "Type",
        relationship: "Relationship"
      }
    ],
    body: providers.map((p) => {
      return {
        name: capitalize(p.name),
        specialty: capitalize(p.specialty),
        phone: formatUSPhoneNumberPretty(p.phone) || "N/A",
        email: p.email || "N/A",
        type: capitalize(p.type),
        relationship: capitalize(getUser(p.associated_cognito_id, store.getState().relationship.list).name || "N/A")
      };
    })
  });
};

const renderRelationshipsTable = (doc, relationships, replacement_title, beneficiary) => {
  doc.text(40, (doc.lastAutoTable && doc.lastAutoTable.id !== "NCA") ? doc.lastAutoTable.finalY + 40 : 50, beneficiary ? `${replacement_title ? replacement_title : "Relationships"} - ${beneficiary.first_name} ${beneficiary.last_name}` : replacement_title ? replacement_title : "Relationships");
  let body = [];
  const active = relationships.map((s) => {
    return { ...s, emergency: !!s.emergency, primary_contact: !!s.primary_contact, secondary_contact: !!s.secondary_contact };
  });
  let parsed_rows = orderBy(active, ["primary_contact", "secondary_contact", "emergency"], ["desc", "desc", "desc"]).map((r) => {
    const partner_type = r.is_partner ? advisor_types.find((t) => t.name === r.partner_data.partner_type) : [];
    return {
      name: capitalize(`${r.first_name} ${r.last_name}`).substring(0, 20),
      relationship: r.is_partner && partner_type ? partner_type.alias : capitalize(r.type) || "N/A",
      phone: r.home_phone ? formatUSPhoneNumberPretty(r.home_phone) : "N/A",
      email: !r.email.includes("hopeportalusers") ? r.email : "N/A",
      emergency: r.emergency ? "Yes" : "No",
      primary_contact: r.primary_contact ? "Yes" : "No",
      secondary_contact: r.secondary_contact ? "Yes" : "No"
    };
  });
  parsed_rows.forEach((item) => {
    const isEmergency = item.emergency === "Yes";
    const isPrimary = item.primary_contact === "Yes";
    const isSecondary = item.secondary_contact === "Yes";
    let row = [];
    Object.values(item).forEach((value, index) => {
      row.push({ content: value });
      if (isEmergency) row[index].styles = { fillColor: lighten(0.35, theme.errorRed), textColor: theme.errorRed };
      if (isPrimary) row[index].styles = { fillColor: lighten(0.35, theme.buttonGreen), textColor: theme.buttonGreen };
      if (isSecondary) row[index].styles = { fillColor: lighten(0.35, theme.notificationOrange), textColor: theme.notificationOrange };
    });
    body.push(row);
  });
  doc.autoTable({
    startY: (doc.lastAutoTable && doc.lastAutoTable.id !== "NCA") ? doc.lastAutoTable.finalY + 55 : 65,
    showHead: "firstPage",
    showFoot: "never",
    headStyles: {
      fillColor: "#136B9D",
      fontSize: 9
    },
    bodyStyles: {
      overflow: "linebreak",
      cellWidth: "auto",
      minCellWidth: 85,
      fontSize: 9,
    },
    footStyles: {
      fillColor: "#136B9D",
      fontSize: 9
    },
    head: [
      {
        name: "Name",
        relationship: "Relationship",
        phone: "Phone",
        email: "Email",
        emergency: "Emergency"
      }
    ],
    foot: [
      {
        name: "Name",
        relationship: "Relationship",
        phone: "Phone",
        email: "Email",
        emergency: "Emergency"
      }
    ],
    body
  });
};

const renderMedicationsTable = (doc, medications, beneficiary) => {
  doc.setFontSize(18);
  doc.text(40, (doc.lastAutoTable && doc.lastAutoTable.id !== "NCA") ? doc.lastAutoTable.finalY + 40 : 50, beneficiary ? `Medications - ${beneficiary.first_name} ${beneficiary.last_name}` : "Medications");
  doc.autoTable({
    startY: (doc.lastAutoTable && doc.lastAutoTable.id !== "NCA") ? doc.lastAutoTable.finalY + 55 : 65,
    showHead: "firstPage",
    showFoot: "never",
    headStyles: {
      fillColor: "#136B9D"
    },
    bodyStyles: {
      overflow: "linebreak",
      cellWidth: "auto",
      fontSize: 9
    },
    footStyles: {
      fillColor: "#136B9D"
    },
    head: [
      {
        name: "Name",
        route: "Route",
        strength: "Strength",
        frequency: "Frequency",
        physician: "Physician",
        otc: "OTC"
      }
    ],
    foot: [
      {
        name: "Name",
        route: "Route",
        strength: "Strength",
        frequency: "Frequency",
        physician: "Physician",
        otc: "OTC"
      }
    ],
    body: medications.map((m) => {
      return {
        name: capitalize(m.name),
        route: m.route ? capitalize(m.route) : "N/A",
        strength: m.strength ? `${m.strength}${m.unit ? ` / ${m.unit.split("/")[0]}` : ""}` : "N/A",
        frequency: m.frequency ? capitalize(m.frequency) : "N/A",
        physician: m.physician ? capitalize(m.physician) : "N/A",
        otc: m.otc ? "Yes" : "No"
      };
    })
  });
};

const renderScheduleTable = (doc, schedule, beneficiary) => {
  doc.setFontSize(18);
  doc.text(40, (doc.lastAutoTable && doc.lastAutoTable.id !== "NCA") ? doc.lastAutoTable.finalY + 40 : 50, beneficiary ? `Schedule - ${beneficiary.first_name} ${beneficiary.last_name}` : "Schedule");
  const schedule_map = {
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    other: []
  };
  schedule.forEach((s) => {
    const days_of_the_week_short = s.days_of_the_week ? s.days_of_the_week.split(",") : [];
    const first_letter_days = days_of_the_week_short.map((day) => capitalize(`${day.charAt(0)}${day.charAt(1)}${day.charAt(2)}`));
    schedule_map[s.day_of_the_week || "other"].push({
      title: s.title ? capitalize(s.title) : "N/A",
      type: s.type && s.type === "weekly" ? capitalize(s.type) : (s.frequency && s.frequency === "bi-weekly") ? `${capitalize(s.frequency)}${first_letter_days.length ? ` - ${first_letter_days.join(", ")}` : ""}` : capitalize(s.frequency || s.type),
      start_time: s.start_time ? s.start_time : "N/A",
      end_time: s.end_time ? s.end_time : "N/A",
      location: s.location ? capitalize(s.location) : "N/A",
      assistant: s.assistance ? s.assistant : "Not Required"
    });
  });
  let body = [];
  Object.keys(schedule_map).forEach((day) => { // for each key in our schedule map
    const day_items = schedule_map[day]; // grab items from day array
    const day_items_sorted = day_items.sort((d1, d2) => moment(d1.start_time, ["h:mm A"]) - moment(d2.start_time, ["h:mm A"]));
    day_items_sorted.forEach((item, index) => { // for each day item
      let row = []; // inititate an empty row
      Object.values(item).forEach((value) => row.push({ content: value }));
      if (index % day_items_sorted.length === 0) { // for every X amount of items in the day array, nest them in the day row
        row.unshift({
          rowSpan: day_items_sorted.length,
          content: capitalize(day),
          styles: { valign: "middle", halign: "center", fontStyle: "bold", textColor: week_day_colors[day] ? week_day_colors[day].color : "#000000" }
        });
      }
      body.push(row);
    });
  });
  doc.autoTable({
    startY: (doc.lastAutoTable && doc.lastAutoTable.id !== "NCA") ? doc.lastAutoTable.finalY + 55 : 65,
    showHead: "firstPage",
    showFoot: "never",
    headStyles: {
      fillColor: "#136B9D"
    },
    bodyStyles: {
      overflow: "linebreak",
      cellWidth: "auto",
      fontSize: 9
    },
    footStyles: {
      fillColor: "#136B9D"
    },
    head: [
      {
        day: "Day",
        title: "Title",
        type: "Type",
        start_time: "Start",
        end_time: "End",
        location: "Location",
        assistant: "Assistant"
      }
    ],
    foot: [
      {
        day: "Day",
        title: "Title",
        type: "Type",
        start_time: "Start",
        end_time: "End",
        location: "Location",
        assistant: "Assistant"
      }
    ],
    body,
    theme: "grid"
  });
};

const renderNCATable = (doc, table_data) => {
  const headers = {};
  const rows = [];
  table_data.column_headers.forEach((header) => headers[header] = header);
  table_data.row_data.forEach((row) => {
    let the_row = {};
    row.forEach((row_data, row_index) => the_row[table_data.column_headers[row_index]] = row_data);
    rows.push(the_row);
  });
  doc.autoTable({
    tableId: "NCA",
    startY: 230,
    showHead: "firstPage",
    showFoot: "never",
    headStyles: {
      fillColor: "#ffaf2d",
      textColor: "#000",
      fontStyle: "normal"
    },
    bodyStyles: {
      overflow: "linebreak",
      cellWidth: "auto",
      fontSize: 9,
      minCellWidth: 80
    },
    footStyles: {
      fillColor: "#136B9D"
    },
    head: [headers],
    foot: [headers],
    body: rows
  });
};

const renderOrganizationExport = (doc, data, organization) => {
  data = orderBy(data, ["created"], ["desc"]);
  doc.setFontSize(18);
  doc.text(40, doc.lastAutoTable ? doc.lastAutoTable.finalY + 40 : 50, `Organization Export - Advisors at ${capitalize(organization)}`);
  doc.autoTable({
    startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 55 : 65,
    showHead: "firstPage",
    showFoot: "never",
    headStyles: {
      fillColor: "#136B9D",
      fontSize: 8
    },
    bodyStyles: {
      overflow: "linebreak",
      cellWidth: "auto",
      fontSize: 8
    },
    footStyles: {
      fillColor: "#136B9D"
    },
    head: [
      {
        name: "Advisor",
        created: "Created",
        contact_email: "Email",
        contact_number: "Phone",
        plan_type: "Plan",
        contract_signed: "Contracts",
        referral_code: "Referral Code",
        approved: "Training",
        clients_number: "Clients #"
      }
    ],
    foot: [
      {
        name: "Advisor Name",
        created: "Created",
        contact_email: "Advisor Email",
        contact_number: "Advisor Phone",
        plan_type: "Plan Type",
        contract_signed: "Contracts",
        referral_code: "Referral Code",
        approved: "Training",
        clients_number: "Clients #"
      }
    ],
    body: data.map((d) => {
      return {
        name:  d.name,
        created: d.created,
        contact_email: d.contact_email,
        contact_number: d.contact_number,
        plan_type: d.plan_type,
        contract_signed: d.contract_signed ? "Yes" : "No",
        referral_code: d.referral_code || "N/A",
        approved: d.approved ? "Yes" : "No",
        clients_number: d.clients_number
      };
    })
  });
};

const renderOrganizationClientExport = (doc, clients, name, organization) => {
  clients = orderBy(clients, ["client_created"], ["desc"]);
  doc.setFontSize(18);
  doc.text(40, 50, `${capitalize(organization)} Client Export - ${name} (${clients.length} clients)`);
  doc.autoTable({
    startY: 65,
    showHead: "firstPage",
    showFoot: "never",
    headStyles: {
      fillColor: "#136B9D",
      fontSize: 8
    },
    bodyStyles: {
      overflow: "linebreak",
      cellWidth: "auto",
      fontSize: 8
    },
    footStyles: {
      fillColor: "#136B9D"
    },
    head: [
      {
        client_first: "Client First",
        client_last: "Client Last",
        client_created: "Created",
        plan: "Plan",
        trust: "Trust",
        advisor_name: "Advisor"
      }
    ],
    foot: [
      {
        client_first: "Advisor",
        client_last: "Created",
        client_created: "Email",
        plan: "Phone",
        trust: "Plan",
        advisor_name: "Contracts"
      }
    ],
    body: clients.map((d) => {
      return {
        client_first: d.client_first,
        client_last: d.client_last,
        client_created: d.client_created,
        plan: d.plan,
        trust: d.trust,
        advisor_name: d.advisor_name
      };
    })
  });
};

export const exportOrganizationExport = (data, organization) => async (dispatch) => {
  window.html2canvas = html2canvas;
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "letter",
    putOnlyUsedFonts: false
  });
  const height = doc.internal.pageSize.getHeight();
  const name = `Organization Export - ${capitalize(organization)}`;
  doc.setFont("helvetica");
  doc.setFontType("normal");
  doc.setProperties({
    title: name,
    author: "HopeTrust",
    creator: `${store.getState().user.first_name} ${store.getState().user.last_name}`
  });
  renderOrganizationExport(doc, data, organization);
  for (let i = 0; i < data.length; i++) {
    const advisor_data = data[i];
    if (!advisor_data.clients.length) continue;
    doc.addPage("letter", "landscape");
    renderOrganizationClientExport(doc, advisor_data.clients, advisor_data.name, organization);
  }
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 0; i < pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(12);
    doc.setTextColor("#B2B2B2");
    doc.text(10, 20, `Page ${doc.internal.getCurrentPageInfo().pageNumber}/${pageCount}`);
    doc.text(10, height - 10, `Page ${doc.internal.getCurrentPageInfo().pageNumber}/${pageCount}`);
  }
  if (isMobile && isAndroid) {
    window.open(doc.output("bloburl"), "_blank");
  } else {
    doc.save(`${name}.pdf`);
  }
};

export const exportRelationships = (users, term, type) => async (dispatch) => {
  const relationships = store.getState().relationship.list;
  const currentUser = relationships.find((u) => u.cognito_id === store.getState().user.cognito_id);
  const beneficiary = relationships.find((u) => u.type === "beneficiary");
  window.html2canvas = html2canvas;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
    putOnlyUsedFonts: false
  });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const name = `${beneficiary.first_name} ${beneficiary.last_name}'s Relationships`;
  doc.setFont("helvetica");
  doc.setFontType("normal");
  doc.setProperties({
    title: name,
    author: "HopeTrust",
    creator: `${currentUser.first_name} ${currentUser.last_name}`
  });
  doc.addImage(RelationshipsCover, "JPEG", 0, 0, width, height);
  doc.addPage("letter", "portrait");
  setTimeout(() => {
    const replacement_title = type && term ? `Relationships (${type}-${term})` : (type || term) ? `Relationships (${type || term})` : "Relationships";
    if (users.length && currentUser.permissions.includes("account-admin-view")) {
      renderRelationshipsTable(doc, users, replacement_title, beneficiary);
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 0; i < pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(12);
        doc.setTextColor("#B2B2B2");
        doc.text(10, 20, `Page ${doc.internal.getCurrentPageInfo().pageNumber}/${pageCount}`);
        doc.text(10, height - 10, `Page ${doc.internal.getCurrentPageInfo().pageNumber}/${pageCount}`);
      }
      if (isMobile && isAndroid) {
        window.open(doc.output("bloburl"), "_blank");
      } else {
        doc.save(`${replacement_title}.pdf`);
      }
    }
  }, 2000);
};

export const exportMedications = () => async (dispatch) => {
  const relationships = store.getState().relationship.list;
  const currentUser = relationships.find((u) => u.cognito_id === store.getState().user.cognito_id);
  const beneficiary = relationships.find((u) => u.type === "beneficiary");
  const medications = store.getState().medication.list;
  window.html2canvas = html2canvas;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
    putOnlyUsedFonts: false
  });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const name = `${beneficiary.first_name} ${beneficiary.last_name}'s Medications`;
  doc.setFont("helvetica");
  doc.setFontType("normal");
  doc.setProperties({
    title: name,
    author: "HopeTrust",
    creator: `${currentUser.first_name} ${currentUser.last_name}`
  });
  doc.addImage(MedicationsCover, "JPEG", 0, 0, width, height);
  doc.addPage("letter", "portrait");
  setTimeout(() => {
    if (medications.length && currentUser.permissions.includes("health-and-life-view")) {
      renderMedicationsTable(doc, medications, beneficiary);
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 0; i < pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(12);
        doc.setTextColor("#B2B2B2");
        doc.text(10, 20, `Page ${doc.internal.getCurrentPageInfo().pageNumber}/${pageCount}`);
        doc.text(10, height - 10, `Page ${doc.internal.getCurrentPageInfo().pageNumber}/${pageCount}`);
      }
      if (isMobile && isAndroid) {
        window.open(doc.output("bloburl"), "_blank");
      } else {
        doc.save("Medications.pdf");
      }
    }
  }, 2000);
};

export const exportProviders = () => async (dispatch) => {
  const relationships = store.getState().relationship.list;
  const currentUser = relationships.find((u) => u.cognito_id === store.getState().user.cognito_id);
  const beneficiary = relationships.find((u) => u.type === "beneficiary");
  const providers = store.getState().provider.list;
  window.html2canvas = html2canvas;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
    putOnlyUsedFonts: false
  });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const name = `${beneficiary.first_name} ${beneficiary.last_name}'s Providers`;
  doc.setFont("helvetica");
  doc.setFontType("normal");
  doc.setProperties({
    title: name,
    author: "HopeTrust",
    creator: `${currentUser.first_name} ${currentUser.last_name}`
  });
  doc.addImage(ProvidersCover, "JPEG", 0, 0, width, height);
  doc.addPage("letter", "portrait");
  setTimeout(() => {
    if (providers.length && currentUser.permissions.includes("health-and-life-view")) {
      renderProvidersTable(doc, providers, beneficiary);
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 0; i < pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(12);
        doc.setTextColor("#B2B2B2");
        doc.text(10, 20, `Page ${doc.internal.getCurrentPageInfo().pageNumber}/${pageCount}`);
        doc.text(10, height - 10, `Page ${doc.internal.getCurrentPageInfo().pageNumber}/${pageCount}`);
      }
      if (isMobile && isAndroid) {
        window.open(doc.output("bloburl"), "_blank");
      } else {
        doc.save("Providers.pdf");
      }
    }
  }, 2000);
};

export const exportSchedule = () => async (dispatch) => {
  const relationships = store.getState().relationship.list;
  const currentUser = relationships.find((u) => u.cognito_id === store.getState().user.cognito_id);
  const beneficiary = relationships.find((u) => u.type === "beneficiary");
  const schedule = store.getState().schedule.list;
  window.html2canvas = html2canvas;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
    putOnlyUsedFonts: false
  });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const name = `${beneficiary.first_name} ${beneficiary.last_name}'s Schedule`;
  doc.setFont("helvetica");
  doc.setFontType("normal");
  doc.setProperties({
    title: name,
    author: "HopeTrust",
    creator: `${currentUser.first_name} ${currentUser.last_name}`
  });
  doc.addImage(ScheduleCover, "JPEG", 0, 0, width, height);
  doc.addPage("letter", "portrait");
  setTimeout(() => {
    if (schedule.length && currentUser.permissions.includes("health-and-life-view")) {
      renderScheduleTable(doc, schedule, beneficiary);
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 0; i < pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(12);
        doc.setTextColor("#B2B2B2");
        doc.text(10, 20, `Page ${doc.internal.getCurrentPageInfo().pageNumber}/${pageCount}`);
        doc.text(10, height - 10, `Page ${doc.internal.getCurrentPageInfo().pageNumber}/${pageCount}`);
      }
      if (isMobile && isAndroid) {
        window.open(doc.output("bloburl"), "_blank");
      } else {
        doc.save("Schedule.pdf");
      }
    }
  }, 2000);
};

export const generatePDF = (id, title, NCA_table) => async (dispatch) => {
    const accounts = store.getState().accounts;
    const relationships = store.getState().relationship.list;
    const account = accounts.find((account) => account.account_id === store.getState().session.account_id);
    const currentUser = relationships.find((u) => u.cognito_id === store.getState().user.cognito_id);
    const beneficiary = relationships.find((u) => u.type === "beneficiary");
    const current_subscription = (account && account.subscription) ? account.subscription : {};
    const subscription_payer = relationships.find((u) => u.customer_id === current_subscription.customer_id);
    const providers = store.getState().provider.list;
    const medications = store.getState().medication.list;
    const schedule = store.getState().schedule.list;
    const grantor_assets = store.getState().grantor_assets.list;
    const beneficiary_assets = store.getState().beneficiary_assets.list;
    const income = store.getState().income.income_sources;
    const budget = store.getState().budgets.budget_items;
    const benefits = store.getState().benefits.government_benefits;
    window.html2canvas = html2canvas;
    dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Downloading PDF..." } });
    const margins = {
      top: 60,
      bottom: 60,
      left: 40,
      right: 50,
      width: 515
    };
    let doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter",
      putOnlyUsedFonts: false
    });
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    let name = "";
    if (beneficiary) name = `${beneficiary.first_name} ${beneficiary.last_name}'s ${title}`;
    doc.setFont("helvetica");
    doc.setFontType("normal");
    doc.setFontSize(12);
    doc.setProperties({
      title: name,
      author: "HopeTrust",
      creator: `${currentUser.first_name} ${currentUser.last_name}`
    });
    switch(title) {
      case "Care Plan":
        doc.addImage(CarePlanCover, "JPEG", 0, 0, width, height);
        doc.addPage("letter", "portrait");
        break;
      case "Financial Overview":
        doc.addImage(FinancialOverviewCover, "JPEG", 0, 0, width, height);
        doc.addPage("letter", "portrait");
        break;
      case "Health Overview":
        doc.addImage(HealthOverviewCover, "JPEG", 0, 0, width, height);
        doc.addPage("letter", "portrait");
        break;
      default:
        break;
    }
    setTimeout(() => {
      if (NCA_table) {
        doc.addImage(NCAHeader, "PNG", 0, 20, width, 120);
        doc.setFont("times");
        doc.setFontType("normal");
        doc.setFontSize(12);
        doc.text(40, 160, "Special Needs Analysis");
        if (beneficiary) doc.text(40, 180, `${beneficiary.first_name} ${beneficiary.last_name}`);
        if (beneficiary) doc.text(40, 200, `DOB: ${moment(beneficiary.birthday).format("MMMM DD, YYYY")}`);
        renderNCATable(doc, NCA_table);
        doc.fromHTML(
          document.querySelectorAll(`#${id} #nca_block`)[0],
          margins.left,
          NCA_table ? 340 : margins.top,
          { "width": margins.width },
          null,
          margins
        );
        doc.addPage("letter", "portrait");
      }
      doc.fromHTML(
        (id === "invoice") ? document.getElementById(`#${id}`) : document.querySelectorAll(`#${id} #all_blocks`)[0],
        margins.left,
        margins.top,
        { "width": margins.width },
        () => {
          dispatch({ type: HIDE_LOADER });
          dispatch(showNotification("success", `${title} Generated`, `We successfully generated your ${title}. Downloading...`));
          dispatch({ type: CLOSE_PDF_MODAL, payload: "" });
        },
        margins
      );
      if (providers.length || relationships.length || medications.length || schedule.length || (grantor_assets.length && currentUser.permissions.includes("grantor-assets-view")) || (beneficiary_assets.length && currentUser.permissions.includes("finance-view")) || (income.length && currentUser.permissions.includes("finance-view")) || (budget.length && currentUser.permissions.includes("budget-view")) || (benefits.length && currentUser.permissions.includes("finance-view"))) doc.addPage("letter", "portrait");
      if (providers.length && currentUser.permissions.includes("health-and-life-view") && (title === "Health Overview" || title === "Care Plan")) renderProvidersTable(doc, providers);
      if (relationships.length && currentUser.permissions.includes("account-admin-view") && (title === "Health Overview" || title === "Care Plan")) renderRelationshipsTable(doc, relationships);
      if (medications.length && currentUser.permissions.includes("health-and-life-view") && (title === "Health Overview" || title === "Care Plan")) renderMedicationsTable(doc, medications);
      if (schedule.length && currentUser.permissions.includes("health-and-life-view") && (title === "Health Overview" || title === "Care Plan")) renderScheduleTable(doc, schedule);
      if (grantor_assets.length && currentUser.permissions.includes("grantor-assets-view") && (title === "Financial Overview" || title === "Care Plan")) renderGrantorAssetsTable(doc, grantor_assets);
      if (beneficiary_assets.length && currentUser.permissions.includes("finance-view") && (title === "Financial Overview" || title === "Care Plan")) renderBeneficiaryAssetsTable(doc, beneficiary_assets);
      if (income.length && currentUser.permissions.includes("finance-view") && (title === "Financial Overview" || title === "Care Plan")) renderIncomeTable(doc, income);
      if (budget.length && currentUser.permissions.includes("budget-view") && (title === "Financial Overview" || title === "Care Plan")) renderBudgetTable(doc, budget, beneficiary);
      if (benefits.length && currentUser.permissions.includes("finance-view") && (title === "Financial Overview" || title === "Care Plan")) renderBenefitsTable(doc, benefits);
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(12);
        doc.setTextColor("#B2B2B2");
        doc.text(10, 20, `Page ${i}/${pageCount}`);

        if (title === "Care Plan" && subscription_payer && subscription_payer.is_partner) {
          const logo = subscription_payer.partner_data.logo;
          if (logo) {
            const type = logo.split(";")[0].split("/")[1];
            if ((i === 2) && logo) doc.addImage(subscription_payer.partner_data.logo, (type || "PNG").toUpperCase(), (width - 150), 40, 100, 100);
          }
        }

        if (beneficiary) doc.text(width - 175, 20, `${beneficiary.first_name} ${beneficiary.last_name}'s ${title}`);
        doc.text(10, height - 10, `Page ${doc.internal.getCurrentPageInfo().pageNumber}/${pageCount}`);
        if (beneficiary) doc.text(width - 175, height - 10, `${beneficiary.first_name} ${beneficiary.last_name}'s ${title}`);
      }
      if (process.env.REACT_APP_STAGE !== "production") doc = addWaterMark(doc, width, height);
      if (isMobile && isAndroid) {
        window.open(doc.output("bloburl"), "_blank");
      } else {
        doc.save(`${title}.pdf`);
      }
      if (title === "Care Plan") {
        dispatch(showNotification("confirm", "Would you like to save a copy of this Care Plan in your document vault?", "", {
          action: () => dispatch(createDocument({
            filename: `Care Plans/Care Plan - ${moment().format("MM-DD-YYYY-h-mm-ss")}`,
            size: doc.output().length,
            friendly_name: `Care Plan - ${moment().format("MM-DD-YYYY-h-mm-ss")}`,
            description: `Care Plan auto generated on ${moment().format("MM/DD/YYYY [at] h:mm a")} by ${currentUser.first_name} ${currentUser.last_name}`,
            document_type: "Care Plan",
            permissions: ["health-and-life"]
          }, doc.output("blob"), "application/pdf"))}));
      }
      dispatch(logEvent(`${title} PDF generated`, store.getState().user));
    }, 2000);
};

export const generateWord = (id, title) => async (dispatch) => {
  const content = document.getElementById(id).innerHTML;
  const string = `<html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><style type="text/css">body, html { font-family: TimesNewRoman !important; } h4, h3 { text-align: center; margin-top: 0; margin-bottom: 0; line-height: 12pt; } h6 { page-break-before: always; color: white; opacity: 0; margin: 0; padding: 0; font-size: 1px; } li { margin-top: 10px; } #cert_title { font-size: 25px; font-weight: bold } #cert_subtitle { font-size: 15px; margin-bottom: 20px; } #cert_item { font-weight: bold; margin-top: 5px } #text_block { margin-top: 40px; } #signature_block_blank { margin-top: 70px; } #signature_item { margin-top:5px; font-weight: bold; } #signature_block { margin-top: 30px; } #cert_notice { margin-top: 50px; padding-top: 20px; border-top: 1px solid gray; font-size: 12px; font-style: italic; }</style></head><body>${content}</body></html>`;
  const converted = new Blob(["\ufeff", string], { type: "application/msword" });
  const url = URL.createObjectURL(converted);
  const downloadLink = document.createElement("a");
  document.body.appendChild(downloadLink);
  downloadLink.href = url;
  downloadLink.download = `${title}.doc`;
  downloadLink.click();
  document.body.removeChild(downloadLink);
  dispatch(logEvent(`${title} Word document generated`, store.getState().user));
};