const template_map = {
	"Wholesale Entity Agreement": "808446b72d64242bd7a05ebde2c4c043a1394a61",
	"Retail Entity Agreement": "808446b72d64242bd7a05ebde2c4c043a1394a61",
	"Agent Entity Agreement": "808446b72d64242bd7a05ebde2c4c043a1394a61",
	"Group Entity Agreement": "808446b72d64242bd7a05ebde2c4c043a1394a61",
	"Team Entity Agreement": "808446b72d64242bd7a05ebde2c4c043a1394a61"
};

const required_custom_fields = {
	[template_map["Wholesale Entity Agreement"]]: [
		"Partner_Name",
		"Partner_Company",
		"Partner_Email"
	],
	[template_map["Retail Entity Agreement"]]: [
		"Partner_Name",
		"Partner_Company",
		"Partner_Email"
	],
	[template_map["Agent Entity Agreement"]]: [
		"Partner_Name",
		"Partner_Company",
		"Partner_Email"
	],
	[template_map["Group Entity Agreement"]]: [
		"Partner_Name",
		"Partner_Company",
		"Partner_Email"
	],
	[template_map["Team Entity Agreement"]]: [
		"Partner_Name",
		"Partner_Company",
		"Partner_Email"
	]
};

const setCustomFields = (templates, signers, benefits_config, user, config) => {
	let custom_fields = [];
	for (let i = 0; i < templates.length; i++) {
		const template = templates[i];
		if (required_custom_fields[template].includes("Partner_Name") && !custom_fields.find((c) => c.name === "Partner_Name")) custom_fields.push({ name: "Partner_Name", value: signers[0].name });
		if (required_custom_fields[template].includes("Partner_Company") && !custom_fields.find((c) => c.name === "Partner_Company")) custom_fields.push({ name: "Partner_Company", value: config.name });
		if (required_custom_fields[template].includes("Partner_Email") && !custom_fields.find((c) => c.name === "Partner_Email")) custom_fields.push({ name: "Partner_Email", value: user.email });
	}
	return custom_fields;
};

module.exports = { setCustomFields };