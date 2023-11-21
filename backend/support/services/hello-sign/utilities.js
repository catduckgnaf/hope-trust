const template_map = {
	"IC Agreement Generic": "f9aeabe0c905e7b4090ace66bbfcc912b0e536aa",
	"Plan Cost Agreement": "eabb1741106c1e5ad60abb1413196cf9c629175a",
	"Individual Agreement": "3c7c0ff1c8af3898c13f12d80495085748ca621f",
	"Legal Referral": "dab6d18866b8cf31ed8e9366b1a79d6e256afd47",
	"Equitable IC Agreement": "3b126d39f875095647523d9e28b74524cd5adab4",
	"Entity Agreement": "1aa1989b83d91e5af9baf5826ce51d3086be6bef"
};

const required_custom_fields = {
	[template_map["IC Agreement Generic"]]: [
		"Partner_Name",
		"Partner_Company",
		"Partner_Email"
	],
	[template_map["Equitable IC Agreement"]]: [
		"Partner_Name",
		"Partner_Company",
		"Partner_Email"
	],
	[template_map["Legal Referral"]]: [
		"Partner_Name",
		"Partner_Company",
		"Partner_Email"
	],
	[template_map["Individual Agreement"]]: [
		"Partner_Name",
		"Partner_Company",
		"Partner_Email"
	],
	[template_map["Entity Agreement"]]: [
		"Partner_Name",
		"Partner_Company",
		"Partner_Email"
	],
	[template_map["Plan Cost Agreement"]]: [
		"Plan_Cost",
		"Partner_Name",
		"Partner_Company",
		"Seats_Number",
		"Additional_Seat_Cost"
	]
};

const setCustomFields = (templates, signers, partner, user, cost, full_cost, additional_plan_credits, additional_plan_cost) => {
	let custom_fields = [];
	for (let i = 0; i < templates.length; i++) {
		const template = templates[i];
		if (required_custom_fields[template].includes("Partner_Name") && !custom_fields.find((c) => c.name === "Partner_Name")) custom_fields.push({ name: "Partner_Name", value: signers[0].name });
		if (required_custom_fields[template].includes("Partner_Company") && !custom_fields.find((c) => c.name === "Partner_Company")) custom_fields.push({ name: "Partner_Company", value: partner.name });
		if (required_custom_fields[template].includes("Partner_Email") && !custom_fields.find((c) => c.name === "Partner_Email")) custom_fields.push({ name: "Partner_Email", value: user.email });
		if (required_custom_fields[template].includes("Plan_Cost") && !custom_fields.find((c) => c.name === "Plan_Cost")) custom_fields.push({ name: "Plan_Cost", value: cost || 0 });
		if (required_custom_fields[template].includes("Seats_Number") && !custom_fields.find((c) => c.name === "Seats_Number")) custom_fields.push({ name: "Seats_Number", value: (full_cost / additional_plan_credits) || 0 });
		if (required_custom_fields[template].includes("Additional_Seat_Cost") && !custom_fields.find((c) => c.name === "Additional_Seat_Cost")) custom_fields.push({ name: "Additional_Seat_Cost", value: additional_plan_cost || 0 });
	}
	return custom_fields;
};

module.exports = { setCustomFields };