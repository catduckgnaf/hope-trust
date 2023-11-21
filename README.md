#### Coverage
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/2767893f062c452eade5eca939df9f65)](https://www.codacy.com?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=hope-portal-services/HopePortalServices&amp;utm_campaign=Badge_Grade)

#### Production Client
[![buddy pipeline](https://app.buddy.works/hopetrust/hopeportalservices/pipelines/pipeline/224178/badge.svg?token=b6a353906a648cef34b2bfca916f28b7cc38a55c643ecaaee491cd5640353cee "buddy pipeline")](https://app.buddy.works/hopetrust/hopeportalservices/pipelines/pipeline/224178)

#### Production Server
[![buddy pipeline](https://app.buddy.works/hopetrust/hopeportalservices/pipelines/pipeline/224179/badge.svg?token=b6a353906a648cef34b2bfca916f28b7cc38a55c643ecaaee491cd5640353cee "buddy pipeline")](https://app.buddy.works/hopetrust/hopeportalservices/pipelines/pipeline/224179)

# HopePortalServices

- Clone the repository
- Login to Serverless service `serverless login`

# Deployments

#### *Environments*: Development, Staging, Production

`sls` = `serverless` // shorthand command

`—-force` // force an action to occur

#### Usage:
`sls remove --stage dev --force`
`sls client remove --stage dev --force`

### Deployment commands

`sls deploy` // deploy full service for default stage

`sls deploy —-stage ${stage_name}` // deploy full service of a specific stage

`sls client deploy` // deploy full client of default stage (default: `development`)

`sls client deploy --stage ${stage_name}` // deploy full client of a specific stage

### Removal commands

`sls remove` // remove full service for default stage (default: `development`)

`sls remove —-stage ${stage_name}` // remove full service of a specific stage

`sls client remove` // remove full client of default stage (default: `development`)

`sls client remove —-stage ${stage_name}` // remove full client of a specific stage


## Usage:

#### Deploy API to the development S3 Bucket and Serverless environment
`sls deploy --stage development`

#### Deploy Client to the development S3 Bucket and Serverless environment
`sls client deploy --stage development`

#### Remove development Client S3 Bucket and Serverless environment from Northern Virginia Region
`sls client remove --stage development --region us-east-1`

#### Remove development Server S3 Bucket and Serverless environment
`sls remove --stage development`

## Development Flow

1.  Local Branch
2.  Feature or Hot Fix Branch (ie: features/hope-101 or hot-fix/hope-97)
3.  :computer: Development
4.  :white_check_mark: Review & Approve
5.  :mag_right: Staging
6.  :white_check_mark: Review & Approve
7.  :shipit: Production


## Slack Commands:

#### Running any pipeline will trigger its subsequent pipelines and approval process
##### For example running the Development Client will trigger the Staging approval process, etc..

### Run Development Client Deployment Pipeline
`/client-development`

### Run Production Client Deployment Pipeline
`/client-production`

### Run Staging Client Deployment Pipeline
`/client-staging`

### Run Development Server Deployment Pipeline
`/server-development`

### Run Production Server Deployment Pipeline
`/server-production`

### Run Staging Server Deployment Pipeline
`/server-staging`

### Run Development Client Deployment Pipeline for Github branch features/hope-210
`/client-development run features/hope-210`

### Run Development Server Deployment Pipeline for Github branch hot-fix/hope-333
`/server-development run hot-fix/hope-333`

## Working:

```
git checkout -b features/hope-42 development // checkout new feature branch off of development branch
git add ${file or folder path | . to stage all branch changes}
git commit -m "A new feature for the frontend" // Add commit message
git push -u origin features/hope-42 // push new branch to remote
```

#### Pull request to development Branch
##### Pull requests should have:
- **Title** `hope-22 - Add new button to specific widget`
- **Description** `Should contain bullet points of work completed`
- **Label** `Frontend, Junior, CSS, Javascript`
- **Reviewers** `Be assigned to a competent engineer for review`
