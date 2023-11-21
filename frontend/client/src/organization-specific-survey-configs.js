import { isSurveyComplete, isPartner, isOrganization, isPaidTier, canGetPregnant, planGetsTrust } from "./utilities";
import { store } from "./store";

export const organization_specific_surveys = {
  "National Care Advisors": [
    {
      title: "NCA Cover Page",
      survey_id: 6158617,
      survey_slug: "National-Care-Advisors-Partner-Survey",
      permissions: ["health-and-life-edit", "account-admin-edit"],
      project_ids: ["216958c8-00d7-4bb8-abf4-0503da3e6d29"],
      collection_ids: [59119],
      icon: "comment-edit",
      conditions: [
        () => isSurveyComplete(5509385, store.getState()),
        () => isPartner(store.getState()),
        () => isOrganization("National Care Advisors", store.getState())
      ],
      tags: ["health", "plan"],
      no_access_message: "You must be a National Care Advisors partner to view this survey",
      action: false,
      admin_override: false
    }
  ],
  "AX Semantics": [
    {
      title: "Mental Health without loops",
      survey_id: 5509443,
      survey_slug: "MentalHealth",
      permissions: ["health-and-life-edit"],
      project_ids: ["c5e02658-33d7-47c7-bf4b-1f64e0ea2de8"],
      collection_ids: [61681],
      icon: "head-side-brain",
      conditions: [
        () => isPaidTier(store.getState()),
        () => isSurveyComplete(5509385, store.getState())
      ],
      tags: ["health", "plan"],
      no_access_message: "",
      action: false,
      admin_override: true
    },
    {
      title: "Pregnancy without loops",
      survey_id: 5509419,
      survey_slug: "Pregnancy",
      permissions: ["health-and-life-edit"],
      project_ids: ["0cc5c523-7c1c-4115-8e31-a6d14cab1eaa"],
      collection_ids: [61685],
      icon: "baby",
      conditions: [
        () => canGetPregnant(store.getState()),
        () => isPaidTier(store.getState()),
        () => isSurveyComplete(5509385, store.getState())
      ],
      tags: ["health", "plan"],
      no_access_message: "",
      action: false,
      admin_override: true
    },
    {
      title: "Infectious Diseases & Neurological Issues without loops",
      survey_id: 5509421,
      survey_slug: "InfectiousDiseasesNeurologicalIssues",
      permissions: ["health-and-life-edit"],
      project_ids: ["a1a154c8-6a5f-4782-a9fb-5eab691bf839"],
      collection_ids: [61687],
      icon: "brain",
      conditions: [
        () => isPaidTier(store.getState()),
        () => isSurveyComplete(5509385, store.getState())
      ],
      tags: ["health", "plan"],
      no_access_message: "",
      action: false,
      admin_override: true
    },
    {
      title: "Lung, Genetic, & Orthopedic Issues without loops",
      survey_id: 5509424,
      survey_slug: "LungGeneticOrthopedicIssues",
      permissions: ["health-and-life-edit"],
      project_ids: ["dc6f98db-65e6-4b2d-aa2a-d4df8e394817"],
      collection_ids: [61689],
      icon: "lungs",
      conditions: [
        () => isPaidTier(store.getState()),
        () => isSurveyComplete(5509385, store.getState())
      ],
      tags: ["health", "plan"],
      no_access_message: "",
      action: false,
      admin_override: true
    },
    {
      title: "Endocrine, Kidney, & Stomach Issues without loops",
      survey_id: 5509425,
      survey_slug: "EndocrineKidneyStomachIssues",
      permissions: ["health-and-life-edit"],
      project_ids: ["072862be-cf77-4cc7-b7e0-4807e6f5eac4"],
      collection_ids: [61691],
      icon: "stomach",
      conditions: [
        () => isPaidTier(store.getState()),
        () => isSurveyComplete(5509385, store.getState())
      ],
      tags: ["health", "plan"],
      no_access_message: "",
      action: false,
      admin_override: true
    },
    {
      title: "Heart, Hematology, Autoimmune, & Inflammatory Issues without loops",
      survey_id: 5509429,
      survey_slug: "HeartHematologyAutoimmuneInflammatoryIssues",
      permissions: ["health-and-life-edit"],
      project_ids: ["e5fac5d1-8782-492b-a5d0-007bb858cf3e"],
      collection_ids: [61693],
      icon: "heartbeat",
      conditions: [
        () => isPaidTier(store.getState()),
        () => isSurveyComplete(5509385, store.getState())
      ],
      tags: ["health", "plan"],
      no_access_message: "",
      action: false,
      admin_override: true
    },
    {
      title: "Oncology Diagnoses without loops",
      survey_id: 5509430,
      survey_slug: "OncologyDiagnoses",
      permissions: ["health-and-life-edit"],
      project_ids: ["4b444245-c705-4da8-bcbb-153b800839e1"],
      collection_ids: [61695],
      icon: "disease",
      conditions: [
        () => isPaidTier(store.getState()),
        () => isSurveyComplete(5509385, store.getState())
      ],
      tags: ["health", "plan"],
      no_access_message: "",
      action: false,
      admin_override: true
    },
    {
      title: "Other Medical Issues without loops",
      survey_id: 5509432,
      survey_slug: "OtherMedicalIssues",
      permissions: ["health-and-life-edit"],
      project_ids: ["1a587729-d15a-4a6a-ba19-ec5f4bfb7c4d"],
      collection_ids: [61697],
      icon: "user-md",
      conditions: [
        () => isPaidTier(store.getState()),
        () => isSurveyComplete(5509385, store.getState())
      ],
      tags: ["health", "plan"],
      no_access_message: "",
      action: false,
      admin_override: true
    },
    {
      title: "Trust-Duplicate",
      survey_id: 6556901,
      survey_slug: "Trust-Duplicate",
      permissions: ["finance-edit"],
      project_ids: ["04695fbb-2640-41df-ac0c-d618dbd89ee6"],
      collection_ids: [77850],
      icon: "scroll",
      conditions: [
        () => planGetsTrust(store.getState()),
        () => isSurveyComplete(5509385, store.getState())
      ],
      tags: ["trust"],
      no_access_message: "",
      action: "CLEAR_TRUST_SURVEY",
      admin_override: true
    }
  ]
};