import { store } from "..";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { orderBy } from "lodash";
import { isMobile, isAndroid } from "react-device-detect";

const capitalize = (str, lower = false) => ((lower ? str.toLowerCase() : str) || "").replace(/(?:^|\s|["'(/[{])+\S/g, (match) => match.toUpperCase());

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