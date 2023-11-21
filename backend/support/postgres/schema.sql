CREATE SEQUENCE IF NOT EXISTS user_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS partner_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS auth_id START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS surv START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS surv_resp START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS quiz_resp START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS surv_sess START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS acct_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS acct_mbr START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS acct_prov START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS evt START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS med START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS account_grantor_assets_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS account_beneficiary_assets_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS account_benefits_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS account_income_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS account_budgets_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS account_features_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS bank_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS sub_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS doc_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS sec_q_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS sec_q_r_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS sec_myto_sim START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS user_notification_settings_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS serv_req_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS referral_config_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS user_plan_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS partner_plan_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS tran_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS prod_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS mess_resp START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS wholesaler_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS retailer_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS agent_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS group_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS team_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS benefits_config_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS benefits_client_config_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS ce_configurations_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS group_connections_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS wholesale_connections_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS ce_courses_seq START WITH 1 INCREMENT BY 1;

/* Core system settings */
DROP TABLE IF EXISTS hopetrust.system_settings;
CREATE TABLE hopetrust.system_settings
(
	id varchar(25) DEFAULT 'system_settings' NOT NULL,
	cognito_id varchar(100) NOT NULL, -- last person to update these settings
	support_maintenance_mode bool DEFAULT false,
	support_maintenance_mode_title varchar(100),
	support_maintenance_mode_message text,
	client_maintenance_mode bool DEFAULT false,
	client_maintenance_mode_title varchar(100),
	client_maintenance_mode_message text,
	benefits_maintenance_mode bool DEFAULT false,
	benefits_maintenance_mode_title varchar(100),
	benefits_maintenance_mode_message text,
	support_app_version float DEFAULT 0.0,
	client_app_version float DEFAULT 0.0,
	benefits_app_version float DEFAULT 0.0,
	email_signature_identifiers jsonb DEFAULT '[]' NOT NULL,
	document_types jsonb DEFAULT '[]' NOT NULL,
	contact_types jsonb DEFAULT '[]' NOT NULL,
	survey_order text[] DEFAULT '{}',
	debug bool DEFAULT false,
	created_at timestamp,
	updated_at timestamp
);

/* security questions */
DROP TABLE IF EXISTS hopetrust.account_features;
CREATE TABLE hopetrust.account_features
(
	id integer DEFAULT nextval('account_features_seq'), -- reference primary ID
	account_id varchar(100) NOT NULL, -- account ID of account these features apply to
	document_generation bool DEFAULT true,
	contact_options bool DEFAULT true,
	surveys bool DEFAULT true,
	documents bool DEFAULT true,
	medications bool DEFAULT true,
	schedule bool DEFAULT true,
	finances bool DEFAULT true,
	create_accounts bool DEFAULT true,
	trust bool DEFAULT false,
	care_coordination bool DEFAULT false,
	relationships bool DEFAULT true,
	providers bool DEFAULT true,
	billing bool DEFAULT true,
	two_factor_authentication bool DEFAULT true,
	permissions bool DEFAULT true,
	security_questions bool DEFAULT true,
	partner_conversion bool DEFAULT false,
	change_password bool DEFAULT true,
	org_export bool DEFAULT false,
	in_app_purchases bool DEFAULT true,
	live_chat bool DEFAULT true,
	messaging bool DEFAULT true,
	bank_account_linking bool DEFAULT false,
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS account_features_idx;
CREATE INDEX account_features_idx ON hopetrust.account_features(account_id);

/* Main user table */
DROP TABLE IF EXISTS hopetrust.users;
CREATE TABLE hopetrust.users
(
	id integer DEFAULT nextval('user_seq'),
	cognito_id varchar(100) NOT NULL,
	customer_id varchar(100),
	first_name varchar(100),
	middle_name varchar(100),
	last_name varchar(100),
	address varchar(100),
	address2 varchar(100),
	city varchar(50),
	state varchar(25),
	email varchar(100) NOT NULL,
	zip varchar(10),
	home_phone varchar(15),
	cell_phone varchar(15),
	other_phone varchar(15),
	fax varchar(15),
	avatar text,
	gender varchar(10),
	pronouns varchar(25),
	birthday varchar(15),
	status varchar(10), /* Active, Inactive, Pending */
	zendesk_user_id varchar(100),
	hubspot_contact_id varchar(100),
	username varchar(100),
	created_at timestamp,
	updated_at timestamp,
	valid_from timestamp,
	valid_to timestamp,
	version integer
);

DROP INDEX IF EXISTS user_id_idx;
CREATE INDEX user_id_idx ON hopetrust.users(cognito_id);

/* Wholesaler info table */
DROP TABLE IF EXISTS hopetrust.wholesalers;
CREATE TABLE hopetrust.wholesalers
(
	id integer DEFAULT nextval('wholesaler_seq'),
	domains text[] DEFAULT '{}',
	cognito_id varchar(100) NOT NULL,
	config_id integer NOT NULL,
	name varchar(512),
	status varchar(10),
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS wholesaler_id_idx;
CREATE INDEX wholesaler_id_idx ON hopetrust.wholesalers(cognito_id);

/* Retailer info table */
DROP TABLE IF EXISTS hopetrust.retailers;
CREATE TABLE hopetrust.retailers
(
	id integer DEFAULT nextval('retailer_seq'),
	cognito_id varchar(100) NOT NULL,
	config_id integer NOT NULL,
	parent_id varchar(100) NOT NULL,
	domains text[] DEFAULT '{}',
	name varchar(512),
	status varchar(10),
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS retailer_id_idx;
CREATE INDEX retailer_id_idx ON hopetrust.retailers(cognito_id);

/* Agent info table */
DROP TABLE IF EXISTS hopetrust.agents;
CREATE TABLE hopetrust.agents
(
	id integer DEFAULT nextval('agent_seq'),
	cognito_id varchar(100) NOT NULL,
	config_id integer NOT NULL,
	parent_id varchar(100) NOT NULL,
	status varchar(10),
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS agent_id_idx;
CREATE INDEX agent_id_idx ON hopetrust.agents(cognito_id);

/* Group info table */
DROP TABLE IF EXISTS hopetrust.groups;
CREATE TABLE hopetrust.groups
(
	id integer DEFAULT nextval('group_seq'),
	cognito_id varchar(100) NOT NULL,
	config_id integer NOT NULL,
	parent_id varchar(100) NOT NULL,
	wholesale_id integer,
	domains text[] DEFAULT '{}',
	name varchar(512),
	status varchar(10),
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS group_id_idx;
CREATE INDEX group_id_idx ON hopetrust.groups(cognito_id);

/* Team info table */
DROP TABLE IF EXISTS hopetrust.teams;
CREATE TABLE hopetrust.teams
(
	id integer DEFAULT nextval('team_seq'),
	cognito_id varchar(100) NOT NULL,
	config_id integer NOT NULL,
	parent_id varchar(100) NOT NULL,
	domains text[] DEFAULT '{}',
	name varchar(512),
	status varchar(10),
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS team_id_idx;
CREATE INDEX team_id_idx ON hopetrust.teams(cognito_id);

/* Benefits config table */
DROP TABLE IF EXISTS hopetrust.benefits_config;
CREATE TABLE hopetrust.benefits_config
(
	id integer DEFAULT nextval('benefits_config_seq'),
	cognito_id varchar(100) NOT NULL,
	signature_id varchar(250),
	signature_request_id varchar(512),
	contract_signed bool DEFAULT false,
	contract_signed_on timestamp,
	hubspot_company_id varchar(100),
	logo text,
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS benefits_config_id_idx;
CREATE INDEX benefits_config_id_idx ON hopetrust.benefits_config(cognito_id);

/* Benefit client config table */
DROP TABLE IF EXISTS hopetrust.benefits_client_config;
CREATE TABLE hopetrust.benefits_client_config
(
	id integer DEFAULT nextval('benefits_client_config_seq'),
	account_id varchar(100) NOT NULL,
	owner_id varchar(100) NOT NULL,
	group_id integer DEFAULT 0 NOT NULL,
	agent_id integer DEFAULT 0,
	invite_code varchar(100),
	invite_status varchar(25),
	status varchar(25),
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS benefits_client_config_id_idx;
CREATE INDEX benefits_client_config_id_idx ON hopetrust.benefits_client_config(owner_id);

/* Wholesale Connections table */
DROP TABLE IF EXISTS hopetrust.wholesale_connections;
CREATE TABLE hopetrust.wholesale_connections
(
	id integer DEFAULT nextval('wholesale_connections_seq'),
	cognito_id varchar(100) NOT NULL,
	config_id integer NOT NULL,
	status varchar(10),
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS wholesale_connections_id_idx;
CREATE INDEX wholesale_connections_id_idx ON hopetrust.wholesale_connections(config_id);

/* Group Connections table */
DROP TABLE IF EXISTS hopetrust.group_connections;
CREATE TABLE hopetrust.group_connections
(
	id integer DEFAULT nextval('group_connections_seq'),
	cognito_id varchar(100) NOT NULL,
	config_id integer NOT NULL,
	status varchar(10),
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS group_connections_id_idx;
CREATE INDEX group_connections_id_idx ON hopetrust.group_connections(config_id);

/* Advisor info table */
DROP TABLE IF EXISTS hopetrust.partners;
CREATE TABLE hopetrust.partners
(
	id integer DEFAULT nextval('partner_seq'),
	cognito_id varchar(100) NOT NULL,
	title varchar(250),
	name varchar(512),
	department varchar(250),
	custodian varchar(250),
	states text[],
	licenses text[],
	specialties text[],
	affiliations text[],
	certifications text[],
	role varchar(250),
	firm_size varchar(25),
	primary_network varchar(250),
	broker_dealer_affiliation varchar(250),
	chsnc_graduate bool,
	is_investment_manager bool,
	is_life_insurance_affiliate bool,
	partner_type varchar(100),
	approved bool,
	signature_id varchar(250),
	signature_request_id varchar(512),
	plan_type varchar(100),
	contract_signed bool,
	contract_signed_on timestamp,
	is_entity bool DEFAULT false,
	status varchar(10),
	logo text,
	domain_approved bool,
	source varchar(250),
	resident_state_license_number varchar(100),
	npn varchar(100),
	created_at timestamp,
	updated_at timestamp,
	valid_from timestamp,
	valid_to timestamp,
	version integer
);

DROP INDEX IF EXISTS partner_id_idx;
CREATE INDEX partner_id_idx ON hopetrust.partners(cognito_id);

/* Advisor info table */
DROP TABLE IF EXISTS hopetrust.referral_configurations;
CREATE TABLE hopetrust.referral_configurations
(
	id integer DEFAULT nextval('referral_config_seq'),
	cognito_id varchar(100) NOT NULL,
	domains text[],
	amount_off float,
	percent_off float,
	duration varchar(25) DEFAULT 'once' NOT NULL, /* once, repeating, forever */
	duration_in_months integer,
	max_redemptions integer,
	prefix varchar(512) NOT NULL,
	name varchar(512) NOT NULL,
	new_accounts bool DEFAULT false,
	myto_allowed bool DEFAULT false,
	hubspot_company_id varchar(100),
	type varchar(50),
	status varchar(10),
	features text[],
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS referral_configurations_idx;
CREATE INDEX referral_configurations_idx ON hopetrust.referral_configurations(cognito_id);

/* User Plan info table */
DROP TABLE IF EXISTS hopetrust.user_plans;
CREATE TABLE hopetrust.user_plans
(
	id integer DEFAULT nextval('user_plan_seq'),
	price_id varchar(100),
	created_by varchar(100) NOT NULL,
	account_id varchar(100),
	monthly integer,
	one_time_fee integer,
	name varchar(50),
	excerpt text,
	discount varchar(100),
	features text[],
	contract_length_months integer,
	cancellation_fee_on bool,
	cancellation_fee float,
	bill_remainder bool,
	billing_days integer,
	seats_included integer,
	features text[],
	permissions text[],
	vault_limit float DEFAULT 0,
	status varchar(10),
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS user_plans_idx;
CREATE INDEX user_plans_idx ON hopetrust.user_plans(price_id);

/* Partner Plan info table */
DROP TABLE IF EXISTS hopetrust.partner_plans;
CREATE TABLE hopetrust.partner_plans
(
	id integer DEFAULT nextval('partner_plan_seq'),
	price_id varchar(100),
	created_by varchar(100) NOT NULL,
	org_name varchar(512),
	account_id varchar(100),
	monthly integer,
	one_time_fee integer,
	cancellation_fee_on bool,
	cancellation_fee float,
	name varchar(50),
	excerpt text,
	features text[],
	permissions text[],
	discount varchar(100),
	type varchar(50),
	agreements text[],
	default_template varchar(100),
	additional_contracts text,
	plan_cost_agreement varchar(100),
	max_cancellations integer,
	additional_plan_credits integer,
	seats_included integer,
	contract_length_months integer,
	bill_remainder bool,
	billing_days integer,
	vault_limit float DEFAULT 0,
	status varchar(10),
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS partner_plans_idx;
CREATE INDEX partner_plans_idx ON hopetrust.partner_plans(price_id);


/* Accounts */
DROP TABLE IF EXISTS hopetrust.accounts;
CREATE TABLE hopetrust.accounts
(
	id integer DEFAULT nextval('acct_seq'),
	cognito_id varchar(100) NOT NULL, /* This is the user who created this account */
	account_id varchar(100) NOT NULL,
	plan_id varchar(100),
	subscription_id varchar(100),
	account_name varchar(512) NOT NULL,
	one_time_costs_total float DEFAULT 0,
	hubspot_deal_id varchar(100),
	status varchar(10), /* Active, Inactive, Pending */
	vault_permission text[] DEFAULT '{only-me}',
	created_at timestamp,
	updated_at timestamp,
	valid_from timestamp,
	valid_to timestamp,
	version integer
);

/* user permissions and membership info per account */
DROP TABLE IF EXISTS hopetrust.account_memberships;
CREATE TABLE hopetrust.account_memberships
(
	id integer DEFAULT nextval('acct_mbr'),
	cognito_id varchar(100) NOT NULL, /* This is the user who created this membership */
	account_id varchar(100) NOT NULL, /* This is the account who owns this membership */
	type varchar(150),	/* grantor, beneficiary, user, admin, vendor */
	linked_account bool DEFAULT false,
	status varchar(10), /* Active, Inactive, Pending */
	emergency bool,
	primary_contact bool,
	secondary_contact bool,
	referral_code varchar(250),
	permissions text[],
	created_at timestamp,
	approved bool,
	inherit bool,
	onboarded bool,
	notified bool DEFAULT true,
	updated_at timestamp,
	valid_from timestamp,
	valid_to timestamp,
	version integer
);

DROP INDEX IF EXISTS account_memberships_idx;
CREATE INDEX account_memberships_idx ON hopetrust.account_memberships(cognito_id);

/* surveys */
DROP TABLE IF EXISTS hopetrust.surveys;
CREATE TABLE hopetrust.surveys
(
	id integer DEFAULT nextval('surv'),
	cognito_id varchar(100) NOT NULL,
	account_id varchar(100),
	survey_id float,
	category varchar(100),
	organization varchar(512),
	survey_name varchar(100),
	slug varchar(100),
	status varchar(25),
	permissions text[] DEFAULT '{}',
	project_ids text[] DEFAULT '{}',
	collection_ids integer[] DEFAULT '{}',
	icon varchar(25),
	conditions jsonb DEFAULT '[]',
	depends_on integer[] DEFAULT '{}',
	tags text[] DEFAULT '{}',
	no_access_message varchar(250),
	action varchar(100),
	admin_override bool DEFAULT false,
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS surveys_idx;
CREATE INDEX surveys_idx ON hopetrust.surveys(survey_id);

/* survey sessions */
DROP TABLE IF EXISTS hopetrust.survey_sessions;
CREATE TABLE hopetrust.survey_sessions
(
	id integer DEFAULT nextval('surv_sess'),
	cognito_id varchar(100) NOT NULL,
	account_id varchar(100) NOT NULL,
	survey_id float,
	survey_name varchar(100),
	session_id varchar(250),
	is_complete bool DEFAULT false,
	access_time timestamp,
	created_at timestamp,
	updated_at timestamp,
	status varchar(25)
);

DROP INDEX IF EXISTS survey_sessions_idx;
CREATE INDEX survey_sessions_idx ON hopetrust.survey_sessions(session_id);


/* survey responses */
DROP TABLE IF EXISTS hopetrust.survey_responses;
CREATE TABLE hopetrust.survey_responses
(
	id integer DEFAULT nextval('surv_resp'),
	blob text,
	cognito_id varchar(100) NOT NULL,
	account_id varchar(100) NOT NULL,
	survey_id float,
	html text,
	session_id varchar(250),
	status varchar(25),
	processing bool DEFAULT false,
	project_ids text[],
	collection_ids text[],
	created_at timestamp,
	updated_at timestamp,
	valid_from timestamp,
	valid_to timestamp,
	version integer
);

DROP INDEX IF EXISTS survey_responses_idx;
CREATE INDEX survey_responses_idx ON hopetrust.survey_responses(account_id);

/* messages */
DROP TABLE IF EXISTS hopetrust.messages;
CREATE TABLE hopetrust.messages
(
	id integer DEFAULT nextval('mess_resp'),
	cognito_id varchar(100),
	account_id varchar(100),
	from_email varchar(100),
	to_email varchar(100),
	to_first varchar(100),
	to_last varchar(100),
	body text,
	subject varchar(100),
	attachments text[] DEFAULT '{}',
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS messages_idx;
CREATE INDEX messages_idx ON hopetrust.messages(account_id);

/* ce_courses */
DROP TABLE IF EXISTS hopetrust.ce_courses;
CREATE TABLE hopetrust.ce_courses
(
	id integer DEFAULT nextval('ce_courses_seq'),
	cognito_id varchar(100),
	category varchar(100),
	title varchar(100),
	video_id varchar(100),
	quiz_id varchar(100),
	training_material_url varchar(256),
	depends_on text[] DEFAULT '{}',
	required_types text[] DEFAULT '{}',
	partner_types text[] DEFAULT '{}',
	course_type varchar(100),
	requires_confirmation bool DEFAULT false,
	certificate bool DEFAULT false,
	organization varchar(100),
	description varchar(256),
	status varchar(25),
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS ce_courses_idx;
CREATE INDEX ce_courses_idx ON hopetrust.ce_courses(quiz_id);

/* quiz responses */
DROP TABLE IF EXISTS hopetrust.quiz_responses;
CREATE TABLE hopetrust.quiz_responses
(
	id integer DEFAULT nextval('quiz_resp'),
	cognito_id varchar(100),
	account_id varchar(100),
	quiz_id varchar(100),
	link_id varchar(100),
	percentage float,
	percentage_passmark float,
	email varchar(100),
	passed bool,
	link_result_id varchar(256),
	certificate_url varchar(256),
	certificate_serial varchar(100),
	confirmation_number varchar(100),
	view_results_url varchar(512),
	proctor_first_name varchar(100),
	proctor_last_name varchar(100),
	proctor_email varchar(100),
	proctor_address varchar(100),
	proctor_address2 varchar(100),
	proctor_city varchar(50),
	proctor_state varchar(25),
	proctor_zip varchar(10),
	access_time timestamp,
	created_at timestamp,
	updated_at timestamp,
	status varchar(25)
);

DROP INDEX IF EXISTS quiz_responses_idx;
CREATE INDEX quiz_responses_idx ON hopetrust.quiz_responses(account_id);

/* AX Authorization creds */
DROP TABLE IF EXISTS hopetrust.ax_authorization_credentials;
CREATE TABLE hopetrust.ax_authorization_credentials
(
	id integer DEFAULT nextval('auth_id'),
	account_id varchar(100) NOT NULL,
	survey_id float,
	project_id varchar(150),
	api_key text,
	jwt text,
	expires_in float,
	base_url varchar(250),
	status varchar(25),
	token_expiration timestamp,
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS ax_authorization_credentials_idx;
CREATE INDEX ax_authorization_credentials_idx ON hopetrust.ax_authorization_credentials(survey_id);

/* Per user bank account information */
DROP TABLE IF EXISTS hopetrust.user_bank_accounts;
CREATE TABLE hopetrust.user_bank_accounts
(
	id integer DEFAULT nextval('bank_seq'),
	cognito_id varchar(100) NOT NULL,
	account_id varchar(100) NOT NULL,
	plaid_item_id varchar(100),
	access_token varchar(250),
	status varchar(25),
	created_at timestamp,
	updated_at timestamp,
	valid_from timestamp,
	valid_to timestamp,
	version integer
);

DROP INDEX IF EXISTS user_bank_accounts_idx;
CREATE INDEX user_bank_accounts_idx ON hopetrust.user_bank_accounts(cognito_id);


/* subscriptions */
DROP TABLE IF EXISTS hopetrust.subscriptions;
CREATE TABLE hopetrust.subscriptions
(
	id integer DEFAULT nextval('sub_seq'), -- reference primary ID
	cognito_id varchar(100) NOT NULL, -- cognito ID of user who created this subscription
	customer_id varchar(100), -- Stripe customer ID of responsible party
	subscription_id varchar(100), -- Stripe subscription ID of referenced subscription
	price_id varchar(100), -- Stripe price ID of referenced product
	type varchar(25), -- the type of subscription user or partner
	status varchar(25), -- status of record, either active or inactive
	account_value float, -- amount of credits this account is worth
	balance float DEFAULT 0,
	in_transfer bool DEFAULT false,
	max_cancellations integer DEFAULT 0,
	additional_seat_cost float DEFAULT 0,
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS subscriptions_idx;
CREATE INDEX subscriptions_idx ON hopetrust.subscriptions(customer_id);


/* transactions */
DROP TABLE IF EXISTS hopetrust.transactions;
CREATE TABLE hopetrust.transactions
(
	id integer DEFAULT nextval('tran_seq'), -- reference primary ID
	customer_id varchar(100), -- Stripe customer ID of responsible party
	subscription_id varchar(100), -- Stripe subscription ID of referenced subscription
	charge_id varchar(100), -- Stripe charge ID of referenced charge
	price_id varchar(100), -- Stripe price ID of referenced product
	lines text[], -- if multiple line items, array of string price IDs
	status varchar(25), -- status of transaction - succeeded, failed, refunded
	amount float DEFAULT 0, -- total amount spent for this transaction
	receipt_url varchar(250),
	invoice_id varchar(250),
	invoice_url varchar(250),
	invoice_pdf varchar(250),
	failure_message varchar(512),
	message varchar(100),
	description varchar(512),
	type varchar(25), -- the type of transaction - charge, subscription
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS transactions_idx;
CREATE INDEX transactions_idx ON hopetrust.transactions(subscription_id);

/* products */
DROP TABLE IF EXISTS hopetrust.products;
CREATE TABLE hopetrust.products
(
	id integer DEFAULT nextval('prod_seq'), -- reference primary ID
	cognito_id varchar(100) NOT NULL, /* This is the last user to update this record */
	price_id varchar(100), -- Stripe price ID of referenced product,
	product_id varchar(100), -- Stripe product ID of referenced price,
	title varchar(100),
	tags text[],
	category varchar(100),
	amount float, -- total sot of the product (if price_id is empty)
	status varchar(25), -- status of product - active, inactive
	description varchar(512),
	contacts text[],
	type varchar(50), -- type of product - one of one_time, monthly
	slug varchar(100),
	features text[],
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS products_idx;
CREATE INDEX products_idx ON hopetrust.products(price_id);


/* Per account asset information */
DROP TABLE IF EXISTS hopetrust.account_grantor_assets;
CREATE TABLE hopetrust.account_grantor_assets
(
	id integer DEFAULT nextval('account_grantor_assets_seq'),
	cognito_id varchar(100) NOT NULL, /* This is the user who created this record */
	account_id varchar(100) NOT NULL, /* Account this record belongs to */
	account_type varchar(100) NOT NULL, /* The literal type of asset, ie: House */
	vesting_type varchar(100), /* current, future, non-trust */
	institution_name varchar(150), /* where the account exists */
	account_number varchar(50),
	value float, /* amount from grantor */
	trust_assets float, /* amount from trust */
	debt float,
	has_debt bool,
	source varchar(100), /* hopetrust or plaid */
	assigned_percent float, /* percent of total asset assigned to a trust */
	inflation bool,
	status varchar(50),
	friendly_name varchar(250),
	description varchar(250),
	plaid_account_id varchar(250),
	plaid_item_id varchar(250),
	type varchar(50),
	created_at timestamp,
	updated_at timestamp,
	valid_from timestamp,
	valid_to timestamp,
	version integer
);

DROP INDEX IF EXISTS account_grantor_assets_idx;
CREATE INDEX account_grantor_assets_idx ON hopetrust.account_grantor_assets(account_id);


/* Per account asset information */

DROP TABLE IF EXISTS hopetrust.account_beneficiary_assets;
CREATE TABLE hopetrust.account_beneficiary_assets
(
	id integer DEFAULT nextval('account_beneficiary_assets_seq'),
	cognito_id varchar(100) NOT NULL, /* This is the user who created this record */
	account_id varchar(100) NOT NULL, /* Account this record belongs to */
	account_type varchar(100) NOT NULL, /* The literal type of asset, ie: House */
	institution_name varchar(150), /* where the account exists */
	account_number varchar(50),
	value float, /* amount from beneficiary */
	debt float,
	has_debt bool,
	source varchar(100), /* hopetrust or plaid */
	inflation bool,
	status varchar(50),
	friendly_name varchar(250),
	description varchar(250),
	plaid_account_id varchar(250),
	plaid_item_id varchar(250),
	type varchar(50),
	created_at timestamp,
	updated_at timestamp,
	valid_from timestamp,
	valid_to timestamp,
	version integer
);

DROP INDEX IF EXISTS account_beneficiary_assets_idx;
CREATE INDEX account_beneficiary_assets_idx ON hopetrust.account_beneficiary_assets(account_id);


/* Per account benefit information */

DROP TABLE IF EXISTS hopetrust.account_benefits;
CREATE TABLE hopetrust.account_benefits
(
	id integer DEFAULT nextval('account_benefits_seq'),
	cognito_id varchar(100) NOT NULL, /* This is the user who created this record */
	account_id varchar(100) NOT NULL, /* Account this record belongs to */
	program_name varchar(250) NOT NULL,
	details varchar(250),
	renewal_date varchar(25),
	account_number varchar(250),
	term integer[] DEFAULT '{0,0}' NOT NULL,
	status varchar(50),
	value float,
	created_at timestamp,
	updated_at timestamp,
	valid_from timestamp,
	valid_to timestamp,
	version integer
);

DROP INDEX IF EXISTS account_benefits_idx;
CREATE INDEX account_benefits_idx ON hopetrust.account_benefits(account_id);

/* Per account income information */

DROP TABLE IF EXISTS hopetrust.account_income;
CREATE TABLE hopetrust.account_income
(
	id integer DEFAULT nextval('account_income_seq'),
	cognito_id varchar(100) NOT NULL, /* This is the user who created this record */
	account_id varchar(100) NOT NULL, /* Account this record belongs to */
	income_type varchar(100) NOT NULL,
	details varchar(250),
	term integer[] DEFAULT '{0,0}' NOT NULL,
	monthly_income float,
	annual_income float,
	inflation bool,
	status varchar(50),
	created_at timestamp,
	updated_at timestamp,
	valid_from timestamp,
	valid_to timestamp,
	version integer
);

DROP INDEX IF EXISTS account_income_idx;
CREATE INDEX account_income_idx ON hopetrust.account_income(account_id);


/* Per account budget information */

DROP TABLE IF EXISTS hopetrust.account_budgets;
CREATE TABLE hopetrust.account_budgets
(
	id integer DEFAULT nextval('account_budgets_seq'),
	cognito_id varchar(100) NOT NULL, /* This is the user who created this record */
	account_id varchar(100) NOT NULL, /* Account this record belongs to */
	budget_category varchar(100) NOT NULL,
	parent_category varchar(100) NOT NULL,
	details varchar(250),
	term integer[] DEFAULT '{0,0}' NOT NULL,
	value float,
	inflation bool,
	status varchar(100),
	created_at timestamp,
	updated_at timestamp,
	valid_from timestamp,
	valid_to timestamp,
	version integer
);

DROP INDEX IF EXISTS account_budgets_idx;
CREATE INDEX account_budgets_idx ON hopetrust.account_budgets(account_id);


/* Maim document table that contains the information for each document in the system */
DROP TABLE IF EXISTS hopetrust.documents;
CREATE TABLE hopetrust.documents
(
	id integer DEFAULT nextval('doc_seq'),
	cognito_id varchar(100) NOT NULL,
	account_id varchar(100) NOT NULL,
	associated_account_id varchar(100),
	filename varchar(512) NOT NULL,
	size float,
	friendly_name varchar(100),
	description varchar(512),
	permissions text[],
	document_type varchar(100),
	private bool DEFAULT false,
	static bool DEFAULT false,
	static_type varchar(25),
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS documents_idx;
CREATE INDEX documents_idx ON hopetrust.documents(account_id);


/*provders */
DROP TABLE IF EXISTS hopetrust.account_providers;
CREATE TABLE hopetrust.account_providers
(
	id integer DEFAULT nextval('acct_prov'),
	cognito_id varchar(100) NOT NULL,
	account_id varchar(100) NOT NULL,
	associated_cognito_id varchar(100),
	name varchar(100),
	contact_first varchar(100),
	contact_last varchar(100),
	address varchar(100),
	address2 varchar(100),
	city varchar(50),
	state varchar(50),
	zip varchar(10),
	email varchar(100),
	phone varchar(15),
	fax varchar(15),
	type varchar(50),
	frequency varchar(50),
	url varchar(250),
	network varchar(250),
	specialty varchar(100),
	status varchar(15),
	start varchar(15),
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS account_providers_idx;
CREATE INDEX account_providers_idx ON hopetrust.account_providers(account_id);


/* events */
DROP TABLE IF EXISTS hopetrust.events;
CREATE TABLE hopetrust.events
(
	id integer DEFAULT nextval('evt'),
	cognito_id varchar(100) NOT NULL,
	account_id varchar(100) NOT NULL,
	start_time varchar(25),
	end_time varchar(25),
	day_of_the_week varchar(25),
	days_of_the_week varchar(255),
	title varchar(100),
	assistance bool,
	series_id varchar(100),
	location varchar(255),
	assistant varchar(255),
	type varchar(25),
	note varchar(255),
	frequency varchar(50),
	duration varchar(50),
	has_set_date bool,
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS events_idx;
CREATE INDEX events_idx ON hopetrust.events(account_id);


/* medications */
DROP TABLE IF EXISTS hopetrust.medications;
CREATE TABLE hopetrust.medications
(
	id integer DEFAULT nextval('med'),
	cognito_id varchar(100) NOT NULL,
	account_id varchar(100) NOT NULL,
	name varchar(512),
	detailed_name varchar(512),
	dosage_form varchar(100),
	route varchar(100),
	unit varchar(100),
	strength float,
	dose float,
	otc bool,
	frequency varchar(50),
	dosage_interval integer,
	has_set_times bool,
	is_search bool DEFAULT false,
	daily_times varchar(512),
	has_set_dates bool,
	days_of_the_week varchar(512),
	physician varchar(255),
	physician_id integer,
	assistance bool,
	assistant varchar(255),
	side_effects varchar(512),
	note varchar(255),
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS medications_idx;
CREATE INDEX medications_idx ON hopetrust.medications(account_id);


/* security questions */
DROP TABLE IF EXISTS hopetrust.security_questions;
CREATE TABLE hopetrust.security_questions
(
	id integer DEFAULT nextval('sec_q_seq'),
	cognito_id varchar(100) NOT NULL,
	question varchar(255) NOT NULL,
	category varchar(100) NOT NULL,
	created_at timestamp,
	updated_at timestamp
);


DROP INDEX IF EXISTS security_questions_idx;
CREATE INDEX security_questions_idx ON hopetrust.security_questions(cognito_id);

/* security question responses */
DROP TABLE IF EXISTS hopetrust.security_question_responses;
CREATE TABLE hopetrust.security_question_responses
(
	id integer DEFAULT nextval('sec_q_r_seq'),
	cognito_id varchar(100) NOT NULL, /* This is the user that is a member of the aforementioned group that you have access */
	account_id varchar(100) NOT NULL,
	answer varchar(255) NOT NULL,
	question_id integer NOT NULL,
	created_at timestamp,
	updated_at timestamp,
	valid_from timestamp,
	valid_to timestamp,
	version integer
);


DROP INDEX IF EXISTS security_question_responses_idx;
CREATE INDEX security_question_responses_idx ON hopetrust.security_question_responses(cognito_id);

/* user notification settings */
DROP TABLE IF EXISTS hopetrust.user_notification_settings;
CREATE TABLE hopetrust.user_notification_settings
(
	id integer DEFAULT nextval('user_notification_settings_seq'),
	cognito_id varchar(100) NOT NULL, /* The user these settings belong to */
	account_id varchar(100) NOT NULL, /* The account these settings refer to */
	money_distribution_email bool DEFAULT false,
	service_scheduled_email bool DEFAULT false,
	appointment_upcoming_email bool DEFAULT false,
	money_distribution_sms bool DEFAULT false,
	service_scheduled_sms bool DEFAULT false,
	appointment_upcoming_sms bool DEFAULT false,
	money_distribution_push bool DEFAULT false,
	service_scheduled_push bool DEFAULT false,
	appointment_upcoming_push bool DEFAULT false
);


DROP INDEX IF EXISTS user_notification_settings_idx;
CREATE INDEX user_notification_settings_idx ON hopetrust.user_notification_settings(cognito_id);


/* Service request */
DROP TABLE IF EXISTS hopetrust.service_requests;
CREATE TABLE hopetrust.service_requests
(
	id integer DEFAULT nextval('serv_req_seq'),
	cognito_id varchar(100) NOT NULL, /* the user who made the request */
	account_id varchar(100) NOT NULL, /* the account who owns the request */
	request_type varchar(50),
	tags text[],
	notes text,
	title varchar(255),
	address varchar(100),
	address2 varchar(100),
	city varchar(50),
	state varchar(50),
	permission varchar(50),
	permission_status varchar(50),
	zip varchar(10),
	request_amount float,
	hubspot_ticket_id varchar(100),
	status varchar(50),
	assignee varchar(50),
	request_subcategory varchar(100),
	decline_reason text,
	provider varchar(100),
	date timestamp,
	pickup_date timestamp,
	dropoff_date timestamp,
	date_choices date[],
	store varchar(256),
	items text[],
	note text,
	destination varchar(256),
	attachment text,
	domain varchar(256),
	domain_approved bool DEFAULT false,
	organization varchar(512),
	body text,
	comments jsonb DEFAULT '[]' NOT NULL,
	priority varchar(50),
	created_at timestamp,
	updated_at timestamp
);

DROP INDEX IF EXISTS service_requests_idx;
CREATE INDEX service_requests_idx ON hopetrust.service_requests(account_id);

/* myto simulations */
DROP TABLE IF EXISTS hopetrust.myto_simulations;
CREATE TABLE hopetrust.myto_simulations
(
	id integer DEFAULT nextval('sec_myto_sim'),
	cognito_id varchar(100) NOT NULL,
	account_id varchar(100) NOT NULL,
	grantor_assets text,
	benefits text,
	budgets text,
	income text,
	beneficiary_age integer,
	concierge_services integer,
	annual_management_costs float,
	portfolio_risk_weighting float,
	desired_life_of_fund integer,
	children_total integer,
	total_benefits_value float,
	final_average float,
	final_average_without_benefits float,
	current_available float,
	trust_funding_gap float,
	trust_fund_gap_without_benefits float,
	assets_needed_with_benefits float,
	nassets_needed_without_benefits float,
	total_available_assets float,
	details varchar(250),
	simulation_name varchar(100),
	is_actual bool,
	status varchar(100),
	default_simulation bool,
	created_at timestamp,
	updated_at timestamp,
	valid_from timestamp,
	valid_to timestamp,
	version integer
);


DROP INDEX IF EXISTS myto_simulations_idx;
CREATE INDEX myto_simulations_idx ON hopetrust.myto_simulations(account_id);

/* ce config settings */
DROP TABLE IF EXISTS hopetrust.ce_configurations;
CREATE TABLE hopetrust.ce_configurations
(
	id integer DEFAULT nextval('ce_configurations_seq'),
	cognito_id varchar(100) NOT NULL, /* the user who created this record */
	coordinator_number varchar(50),
	instructor_number varchar(50),
	provider_number varchar(50),
	course_number varchar(50),
	student_attestation varchar(1250),
	student_attestation_note varchar(256),
	proctor_required bool DEFAULT false,
	virtual_proctor bool DEFAULT false,
	introduction_statement_link varchar (256),
	proctor_language varchar(1250),
	course_product varchar (256),
	credits_value integer DEFAULT 0,
	course_name varchar (256),
	coordinator_signature text,
	instructor_signature text,
	has_coordinator bool DEFAULT false,
	has_instructor bool DEFAULT false,
	coordinator_name varchar(100),
	instructor_name varchar(100),
	coordinator_info varchar(256),
	instructor_info varchar(256),
	state varchar(256) NOT NULL,
	status varchar(100),
	created_at timestamp,
	updated_at timestamp
);


DROP INDEX IF EXISTS ce_configurations_idx;
CREATE INDEX ce_configurations_idx ON hopetrust.ce_configurations(course_name);


CREATE OR REPLACE FUNCTION update_row()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';


CREATE OR REPLACE FUNCTION create_row()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';


CREATE OR REPLACE FUNCTION update_versioned_row()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    NEW.valid_to = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION create_versioned_row()
RETURNS TRIGGER AS $$
BEGIN
	NEW.created_at = coalesce(NEW.created_at, now());
	NEW.updated_at = now();
	NEW.valid_from = now();
	NEW.valid_to = '9999-01-01 00:00:00';
	RETURN NEW;
END;
$$ language 'plpgsql';

create or replace function jsonb_remove_array_element(arr jsonb, element jsonb)
returns jsonb language sql immutable as $$
    select arr- (
        select ordinality- 1
        from jsonb_array_elements(arr) with ordinality
        where value = element)::int
$$;

CREATE TRIGGER update_modtime_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_versioned_row();
CREATE TRIGGER update_modtime_partners BEFORE UPDATE ON partners FOR EACH ROW EXECUTE PROCEDURE update_versioned_row();
CREATE TRIGGER update_modtime_accounts BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE PROCEDURE update_versioned_row();
CREATE TRIGGER update_modtime_user_bank_accounts BEFORE UPDATE ON user_bank_accounts FOR EACH ROW EXECUTE PROCEDURE update_versioned_row();
CREATE TRIGGER update_modtime_account_grantor_assets BEFORE UPDATE ON account_grantor_assets FOR EACH ROW EXECUTE PROCEDURE update_versioned_row();
CREATE TRIGGER update_modtime_account_beneficiary_assets BEFORE UPDATE ON account_beneficiary_assets FOR EACH ROW EXECUTE PROCEDURE update_versioned_row();
CREATE TRIGGER update_modtime_account_benefits BEFORE UPDATE ON account_benefits FOR EACH ROW EXECUTE PROCEDURE update_versioned_row();
CREATE TRIGGER update_modtime_account_income BEFORE UPDATE ON account_income FOR EACH ROW EXECUTE PROCEDURE update_versioned_row();
CREATE TRIGGER update_modtime_account_budgets BEFORE UPDATE ON account_budgets FOR EACH ROW EXECUTE PROCEDURE update_versioned_row();
CREATE TRIGGER update_modtime_security_question_responses BEFORE UPDATE ON security_question_responses FOR EACH ROW EXECUTE PROCEDURE update_versioned_row();
CREATE TRIGGER update_modtime_account_memberships BEFORE UPDATE ON account_memberships FOR EACH ROW EXECUTE PROCEDURE update_versioned_row();
CREATE TRIGGER update_modtime_survey_responses BEFORE UPDATE ON survey_responses FOR EACH ROW EXECUTE PROCEDURE update_versioned_row();
CREATE TRIGGER update_modtime_myto_simulations BEFORE UPDATE ON myto_simulations FOR EACH ROW EXECUTE PROCEDURE update_versioned_row();

CREATE TRIGGER update_modtime_service_requests BEFORE UPDATE ON service_requests FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_documents BEFORE UPDATE ON documents FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_account_providers BEFORE UPDATE ON account_providers FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_account_events BEFORE UPDATE ON events FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_account_medications BEFORE UPDATE ON medications FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_security_questions BEFORE UPDATE ON security_questions FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_ax_credentials BEFORE UPDATE ON ax_authorization_credentials FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_survey_sessions BEFORE UPDATE ON survey_sessions FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_quiz_responses BEFORE UPDATE ON quiz_responses FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_referral_configurations BEFORE UPDATE ON referral_configurations FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_subscriptions BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_account_features BEFORE UPDATE ON account_features FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_user_plans BEFORE UPDATE ON user_plans FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_partner_plans BEFORE UPDATE ON partner_plans FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_transactions BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_products BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_system_settings BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_messages BEFORE UPDATE ON messages FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_retailers BEFORE UPDATE ON retailers FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_agents BEFORE UPDATE ON agents FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_groups BEFORE UPDATE ON groups FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_teams BEFORE UPDATE ON teams FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_wholesaler BEFORE UPDATE ON wholesalers FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_benefits_config BEFORE UPDATE ON benefits_config FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_benefits_client_config BEFORE UPDATE ON benefits_client_config FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_ce_config BEFORE UPDATE ON ce_configurations FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_group_connections BEFORE UPDATE ON group_connections FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_wholesale_connections BEFORE UPDATE ON wholesale_connections FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_ce_courses BEFORE UPDATE ON ce_courses FOR EACH ROW EXECUTE PROCEDURE update_row();
CREATE TRIGGER update_modtime_surveys BEFORE UPDATE ON surveys FOR EACH ROW EXECUTE PROCEDURE update_row();

CREATE TRIGGER update_created_and_valid_time_users BEFORE INSERT ON users FOR EACH ROW EXECUTE PROCEDURE create_versioned_row();
CREATE TRIGGER update_created_and_valid_time_partners BEFORE INSERT ON partners FOR EACH ROW EXECUTE PROCEDURE create_versioned_row();
CREATE TRIGGER update_created_and_valid_time_accounts BEFORE INSERT ON accounts FOR EACH ROW EXECUTE PROCEDURE create_versioned_row();
CREATE TRIGGER update_created_and_valid_time_user_bank_accounts BEFORE INSERT ON user_bank_accounts FOR EACH ROW EXECUTE PROCEDURE create_versioned_row();
CREATE TRIGGER update_created_and_valid_time_account_grantor_assets BEFORE INSERT ON account_grantor_assets FOR EACH ROW EXECUTE PROCEDURE create_versioned_row();
CREATE TRIGGER update_created_and_valid_time_account_beneficiary_assets BEFORE INSERT ON account_beneficiary_assets FOR EACH ROW EXECUTE PROCEDURE create_versioned_row();
CREATE TRIGGER update_created_and_valid_time_account_benefits BEFORE INSERT ON account_benefits FOR EACH ROW EXECUTE PROCEDURE create_versioned_row();
CREATE TRIGGER update_created_and_valid_time_account_income BEFORE INSERT ON account_income FOR EACH ROW EXECUTE PROCEDURE create_versioned_row();
CREATE TRIGGER update_created_and_valid_time_account_budgets BEFORE INSERT ON account_budgets FOR EACH ROW EXECUTE PROCEDURE create_versioned_row();
CREATE TRIGGER update_created_and_valid_time_security_questions BEFORE INSERT ON security_questions FOR EACH ROW EXECUTE PROCEDURE create_versioned_row();
CREATE TRIGGER update_created_and_valid_time_security_question_responses BEFORE INSERT ON security_question_responses FOR EACH ROW EXECUTE PROCEDURE create_versioned_row();
CREATE TRIGGER update_created_and_valid_time_account_memberships BEFORE INSERT ON account_memberships FOR EACH ROW EXECUTE PROCEDURE create_versioned_row();
CREATE TRIGGER update_created_and_valid_time_survey_responses BEFORE INSERT ON survey_responses FOR EACH ROW EXECUTE PROCEDURE create_versioned_row();
CREATE TRIGGER update_created_and_valid_time_myto_simulations BEFORE INSERT ON myto_simulations FOR EACH ROW EXECUTE PROCEDURE create_versioned_row();

CREATE TRIGGER update_created_and_valid_time_service_requests BEFORE INSERT ON service_requests FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_documents BEFORE INSERT ON documents FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_account_providers BEFORE INSERT ON account_providers FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_security_questions BEFORE INSERT ON security_questions FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_account_events BEFORE INSERT ON events FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_account_medications BEFORE INSERT ON medications FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_ax_credentials BEFORE INSERT ON ax_authorization_credentials FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_survey_sessions BEFORE INSERT ON survey_sessions FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_quiz_responses BEFORE INSERT ON quiz_responses FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_referral_configurations BEFORE INSERT ON referral_configurations FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_subscriptions BEFORE INSERT ON subscriptions FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_account_features BEFORE INSERT ON account_features FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_user_plans BEFORE INSERT ON user_plans FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_partner_plans BEFORE INSERT ON partner_plans FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_transactions BEFORE INSERT ON transactions FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_products BEFORE INSERT ON products FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_system_settings BEFORE INSERT ON system_settings FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_messages BEFORE INSERT ON messages FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_retailers BEFORE INSERT ON retailers FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_agents BEFORE INSERT ON agents FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_groups BEFORE INSERT ON groups FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_teams BEFORE INSERT ON teams FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_wholesaler BEFORE INSERT ON wholesalers FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_benefits_config BEFORE INSERT ON benefits_config FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_benefits_client_config BEFORE INSERT ON benefits_client_config FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_ce_config BEFORE INSERT ON ce_configurations FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_group_connections BEFORE INSERT ON group_connections FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_wholesale_connections BEFORE INSERT ON wholesale_connections FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_ce_courses BEFORE INSERT ON ce_courses FOR EACH ROW EXECUTE PROCEDURE create_row();
CREATE TRIGGER update_created_and_valid_time_surveys BEFORE INSERT ON surveys FOR EACH ROW EXECUTE PROCEDURE create_row();
