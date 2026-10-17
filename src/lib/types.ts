export interface Project {
  id: string;
  code: string;
  title: string;
  courseTitle?: string;
  department: string;
  venue: string;
  instructors: string;
  dateDisplay?: string;
  startDate: string;
  endDate: string;
  targetAttendees: number;
  status: "active" | "completed" | "draft";
}

export interface Cohort {
  id: string;
  projectId: string;
  cohortNumber: number;
  title: string;
  startDate: string;
  endDate: string;
}

export interface QuestionItem {
  id: number;
  dimensionId: number;
  dimensionTitle: string;
  text: string;
}

export interface FeedbackFieldItem {
  id: string;
  label: string;
  placeholder: string;
}

export interface DemographicFieldItem {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export interface Questionnaire {
  id: string;
  title: string;
  courseTitle: string;
  instructors: string;
  department: string;
  dateDisplay: string;
  venue: string;
  targetAttendees?: number;
  // Section 1 - General Respondent Info / Demographics
  enableSection1?: boolean;
  section1Title?: string;
  respondentNameLabel?: string;
  respondentNamePlaceholder?: string;
  respondentNameRequired?: boolean;
  enableGovId?: boolean;
  govIdLabel?: string;
  govIdPlaceholder?: string;
  govIdRequired?: boolean;
  demographicCustomFields?: DemographicFieldItem[];
  // Section 2 Questions
  questions: QuestionItem[];
  enableSection3?: boolean;
  section3Title?: string;
  feedbackItems?: FeedbackFieldItem[];
  enableSection4?: boolean;
  section4Title?: string;
  section4Description?: string;
  section4Label?: string;
  section4HelperText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationResponseInput {
  projectId: string;
  cohortId?: string;
  respondentName: string;
  govId?: string;
  positionLevel: string;
  scores: Record<string, number>; // "q1": 5, "q2": 4, ... "q20": 5
  feedbackStrength?: string;
  feedbackImprove?: string;
  feedbackTopics?: string;
  feedbackOthers?: string;
  feedbackValues?: Record<string, string>;
  demographicValues?: Record<string, string>;
  attachments?: {
    fileName: string;
    r2Key: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    category: string;
  }[];
}

export interface EvaluationResponseRecord extends EvaluationResponseInput {
  id: string;
  scoreMean: number;
  isDraft: boolean;
  createdAt: string;
}

export interface DimensionStat {
  dimensionId: number;
  dimensionTitle: string;
  questionsRange: string;
  icon: string;
  mean: number;
  percentage: number;
  sd: number;
  qualityLevel: string;
  isTopRanked?: boolean;
}

export interface QuestionStat {
  id: number;
  dimensionId: number;
  dimensionTitle: string;
  text: string;
  mean: number;
  sd: number;
  percentage: number;
  qualityLevel: string;
}

export interface FeedbackCardStat {
  id: string;
  index: number;
  label: string;
  comments: { text: string }[];
  count: number;
}

export interface RawRespondentItem {
  id: string;
  index: number;
  respondentName: string;
  govId?: string;
  positionLevel: string;
  positionLabel: string;
  cohortId?: string;
  cohortTitle: string;
  scores: Record<string, number>;
  scoreMean: number;
  feedbackValues: Record<string, string>;
  demographicValues?: Record<string, string>;
  createdAt: string;
}

export interface DashboardSummary {
  project: Project;
  cohorts: Cohort[];
  activeCohortId: string; // 'all' or cohortId
  totalRespondents: number;
  targetAttendees: number;
  responseRate: number;
  compositeMean: number;
  compositeSd: number;
  compositePercentage: number;
  compositeQuality: string;
  roiIndex: number;
  continuationRate: number;
  dimensions: DimensionStat[];
  questions: QuestionStat[];
  enableSection1?: boolean;
  section1Title?: string;
  respondentNameLabel?: string;
  enableGovId?: boolean;
  govIdLabel?: string;
  demographicCustomFields?: DemographicFieldItem[];
  enableSection3?: boolean;
  section3Title?: string;
  rawResponses?: RawRespondentItem[];
  qualitative: {
    strengths: { text: string; category?: string }[];
    improvements: { text: string; category?: string }[];
    futureTopics: { topic: string; votes: number }[];
    generalComments: { text: string; authorNote?: string }[];
    feedbackCards?: FeedbackCardStat[];
    npsScore: number;
    feedbackRate: number;
  };
}

export interface R2FileItem {
  id: string;
  fileName: string;
  r2Key: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: "document" | "speaker" | "gallery" | "certificate" | "report";
  uploadedAt: string;
}
