/**
 * Azure DevOps Work Item Field Types
 * 
 * Auto-generated from project: HN Commercial Division
 * Generated: 2026-01-21T00:47:56.007Z
 * 
 * DO NOT EDIT MANUALLY - Run: npm run devops:generate-types
 */

// ============================================
// SYSTEM FIELDS (Built-in Azure DevOps fields)
// ============================================

export interface SystemFields {
  'System.AreaId'?: number;
  /** The area of the product with which this bug is associated */
  'System.AreaPath'?: string;
  /** The person currently working on this bug */
  'System.AssignedTo'?: string;
  'System.AttachedFileCount'?: number;
  'System.AuthorizedAs'?: string;
  'System.AuthorizedDate'?: string;
  'System.BoardColumn'?: string;
  'System.BoardColumnDone'?: boolean;
  'System.BoardLane'?: string;
  'System.ChangedBy'?: string;
  'System.ChangedDate'?: string;
  'System.CommentCount'?: number;
  'System.CreatedBy'?: string;
  'System.CreatedDate'?: string;
  /** Description or acceptance criteria for this epic to be considered complete */
  'System.Description'?: string;
  'System.ExternalLinkCount'?: number;
  /** Discussion thread plus automatic record of changes */
  'System.History'?: string;
  'System.HyperLinkCount'?: number;
  'System.Id'?: number;
  'System.IterationId'?: number;
  /** The iteration within which this bug will be fixed */
  'System.IterationPath'?: string;
  'System.NodeName'?: string;
  'System.Parent'?: number;
  /** The reason why the bug is in the current state */
  'System.Reason'?: string;
  'System.RelatedLinkCount'?: number;
  'System.RemoteLinkCount'?: number;
  'System.Rev'?: number;
  'System.RevisedDate'?: string;
  /** New = for triage; Active = not yet fixed; Resolved = fixed not yet verified; Closed = fix verified. */
  'System.State'?: string;
  'System.Tags'?: string;
  'System.TeamProject'?: string;
  /** Stories affected and how */
  'System.Title'?: string;
  'System.Watermark'?: number;
  'System.WorkItemType'?: string;
}

// ============================================
// MICROSOFT FIELDS (Microsoft extensions)
// ============================================

export interface MicrosoftFields {
  'Microsoft.VSTS.Common.AcceptanceCriteria'?: string;
  'Microsoft.VSTS.CodeReview.AcceptedBy'?: string;
  'Microsoft.VSTS.CodeReview.AcceptedDate'?: string;
  'Microsoft.VSTS.Common.ActivatedBy'?: string;
  'Microsoft.VSTS.Common.ActivatedDate'?: string;
  /** Type of work involved */
  'Microsoft.VSTS.Common.Activity'?: string;
  /** Instructions to launch the specified application */
  'Microsoft.VSTS.Feedback.ApplicationLaunchInstructions'?: string;
  /** The path to execute the application */
  'Microsoft.VSTS.Feedback.ApplicationStartInformation'?: string;
  /** The type of application on which to give feedback */
  'Microsoft.VSTS.Feedback.ApplicationType'?: string;
  'Microsoft.VSTS.CodeReview.Context'?: string;
  'Microsoft.VSTS.CodeReview.ContextCode'?: number;
  'Microsoft.VSTS.CodeReview.ContextOwner'?: string;
  'Microsoft.VSTS.CodeReview.ContextType'?: string;
  /** The ID of the test that automates this test case */
  'Microsoft.VSTS.TCM.AutomatedTestId'?: string;
  /** The name of the test that automates this test case */
  'Microsoft.VSTS.TCM.AutomatedTestName'?: string;
  /** The assembly containing the test that automates this test case */
  'Microsoft.VSTS.TCM.AutomatedTestStorage'?: string;
  /** The type of the test that automates this test case */
  'Microsoft.VSTS.TCM.AutomatedTestType'?: string;
  'Microsoft.VSTS.TCM.AutomationStatus'?: string;
  /** The business value for the customer when the epic is released */
  'Microsoft.VSTS.Common.BusinessValue'?: number;
  'Microsoft.VSTS.Common.ClosedBy'?: string;
  'Microsoft.VSTS.Common.ClosedDate'?: string;
  'Microsoft.VSTS.CodeReview.ClosedStatus'?: string;
  'Microsoft.VSTS.CodeReview.ClosedStatusCode'?: number;
  'Microsoft.VSTS.CodeReview.ClosingComment'?: string;
  /** The number of units of work that have been spent on this bug */
  'Microsoft.VSTS.Scheduling.CompletedWork'?: number;
  /** The date by which this issue needs to be closed */
  'Microsoft.VSTS.Scheduling.DueDate'?: string;
  /** The estimated effort to implemented the epic */
  'Microsoft.VSTS.Scheduling.Effort'?: number;
  /** The date to finish the task */
  'Microsoft.VSTS.Scheduling.FinishDate'?: string;
  /** The build in which the bug was found */
  'Microsoft.VSTS.Build.FoundIn'?: string;
  /** The build in which the bug was fixed */
  'Microsoft.VSTS.Build.IntegrationBuild'?: string;
  /** Used to highlight the shared step, e.g., to mark it as an issue */
  'Microsoft.VSTS.Common.Issue'?: string;
  'Microsoft.VSTS.TCM.LocalDataSource'?: string;
  /** Initial value for Remaining Work - set once, when work begins */
  'Microsoft.VSTS.Scheduling.OriginalEstimate'?: number;
  'Microsoft.VSTS.TCM.Parameters'?: string;
  /** Business importance. 1=must fix; 4=unimportant. */
  'Microsoft.VSTS.Common.Priority'?: number;
  'Microsoft.VSTS.TCM.QueryText'?: string;
  /** Overall rating provided as part of feedback response */
  'Microsoft.VSTS.Common.Rating'?: string;
  /** An estimate of the number of units of work remaining to complete this bug */
  'Microsoft.VSTS.Scheduling.RemainingWork'?: number;
  /** How to see the bug. End by contrasting expected with actual behavior. */
  'Microsoft.VSTS.TCM.ReproSteps'?: string;
  'Microsoft.VSTS.Common.ResolvedBy'?: string;
  'Microsoft.VSTS.Common.ResolvedDate'?: string;
  /** The reason why the bug was resolved */
  'Microsoft.VSTS.Common.ResolvedReason'?: string;
  'Microsoft.VSTS.Common.ReviewedBy'?: string;
  /** Uncertainty in epic */
  'Microsoft.VSTS.Common.Risk'?: string;
  /** Assessment of the effect of the bug on the project */
  'Microsoft.VSTS.Common.Severity'?: string;
  /** Work first on items with lower-valued stack rank. Set in triage. */
  'Microsoft.VSTS.Common.StackRank'?: number;
  /** The date to start the task */
  'Microsoft.VSTS.Scheduling.StartDate'?: string;
  'Microsoft.VSTS.Common.StateChangeDate'?: string;
  'Microsoft.VSTS.Common.StateCode'?: number;
  /** Steps required to perform the test */
  'Microsoft.VSTS.TCM.Steps'?: string;
  /** The size of work estimated for fixing the bug */
  'Microsoft.VSTS.Scheduling.StoryPoints'?: number;
  /** Test context, provided automatically by test infrastructure */
  'Microsoft.VSTS.TCM.SystemInfo'?: string;
  /** The target date for completing the epic */
  'Microsoft.VSTS.Scheduling.TargetDate'?: string;
  /** Captures the test suite audit trail. */
  'Microsoft.VSTS.TCM.TestSuiteAudit'?: string;
  /** Specifies the category of the test suite. */
  'Microsoft.VSTS.TCM.TestSuiteType'?: string;
  'Microsoft.VSTS.TCM.TestSuiteTypeId'?: number;
  /** How does the business value decay over time. Higher values make the epic more time critical */
  'Microsoft.VSTS.Common.TimeCriticality'?: number;
  /** The type should be set to Business primarily to represent customer-facing issues. Work to change the architecture should be added as a User Story */
  'Microsoft.VSTS.Common.ValueArea'?: string;
}

// ============================================
// CUSTOM FIELDS (Organization-specific fields)
// ============================================

export interface CustomFields {
  'Custom.AddtoPMOReport'?: boolean;
  'Custom.MajorProject'?: string;
  'Custom.MicroChannelDevOps#'?: number;
  /** Describe the completion progress of the item */
  'Custom.Percentagecompletion'?: number;
  'Custom.Requestor'?: string;
  'Custom.ServiceNow'?: string;
  'Custom.TheHive'?: string;
}

// ============================================
// COMBINED TYPE
// ============================================

export type WorkItemFields = SystemFields & MicrosoftFields & CustomFields;

// ============================================
// COMMONLY USED FIELDS BY WORK ITEM TYPE
// ============================================

export interface WorkItemTypeFields {
  'User Story': {
    'System.Title': string;
    'System.Description'?: string;
    'System.AreaPath'?: string;
    'System.IterationPath'?: string;
    'System.State'?: string;
    'System.Reason'?: string;
    'System.AssignedTo'?: string;
    'System.Tags'?: string;
    'Microsoft.VSTS.Common.Priority'?: number;
    'Microsoft.VSTS.Common.Severity'?: string;
    'Microsoft.VSTS.Scheduling.StoryPoints'?: number;
    'Microsoft.VSTS.Common.AcceptanceCriteria'?: string;
  };
  'Bug': {
    'System.Title': string;
    'System.Description'?: string;
    'System.AreaPath'?: string;
    'System.State'?: string;
    'System.AssignedTo'?: string;
    'System.Tags'?: string;
    'Microsoft.VSTS.Common.Priority'?: number;
    'Microsoft.VSTS.Common.Severity'?: string;
    'Microsoft.VSTS.TCM.ReproSteps'?: string;
  };
  'Task': {
    'System.Title': string;
    'System.Description'?: string;
    'System.AreaPath'?: string;
    'System.State'?: string;
    'System.AssignedTo'?: string;
    'Microsoft.VSTS.Common.Activity'?: string;
    'Microsoft.VSTS.Scheduling.RemainingWork'?: number;
  };
  'Feature': {
    'System.Title': string;
    'System.Description'?: string;
    'System.AreaPath'?: string;
    'System.State'?: string;
    'Microsoft.VSTS.Scheduling.TargetDate'?: string;
    'Microsoft.VSTS.Common.BusinessValue'?: number;
  };
  'Epic': {
    'System.Title': string;
    'System.Description'?: string;
    'System.AreaPath'?: string;
    'System.State'?: string;
    'Microsoft.VSTS.Scheduling.TargetDate'?: string;
    'Microsoft.VSTS.Common.BusinessValue'?: number;
  };
}

// ============================================
// FIELD METADATA
// ============================================

export interface FieldMetadata {
  referenceName: string;
  name: string;
  type: string;
  description?: string;
  isPicklist: boolean;
  picklistValues?: string[];
}

export const FIELD_METADATA: Record<string, FieldMetadata> = {
  'System.AreaId': {
    referenceName: 'System.AreaId',
    name: 'Area ID',
    type: 'integer',
    description: undefined,
    isPicklist: false,
  },
  'System.AreaPath': {
    referenceName: 'System.AreaPath',
    name: 'Area Path',
    type: 'treePath',
    description: 'The area of the product with which this bug is associated',
    isPicklist: false,
  },
  'System.AssignedTo': {
    referenceName: 'System.AssignedTo',
    name: 'Assigned To',
    type: 'string',
    description: 'The person currently working on this bug',
    isPicklist: false,
  },
  'System.AttachedFileCount': {
    referenceName: 'System.AttachedFileCount',
    name: 'Attached File Count',
    type: 'integer',
    description: undefined,
    isPicklist: false,
  },
  'System.AuthorizedAs': {
    referenceName: 'System.AuthorizedAs',
    name: 'Authorized As',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'System.AuthorizedDate': {
    referenceName: 'System.AuthorizedDate',
    name: 'Authorized Date',
    type: 'dateTime',
    description: undefined,
    isPicklist: false,
  },
  'System.BoardColumn': {
    referenceName: 'System.BoardColumn',
    name: 'Board Column',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'System.BoardColumnDone': {
    referenceName: 'System.BoardColumnDone',
    name: 'Board Column Done',
    type: 'boolean',
    description: undefined,
    isPicklist: false,
  },
  'System.BoardLane': {
    referenceName: 'System.BoardLane',
    name: 'Board Lane',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'System.ChangedBy': {
    referenceName: 'System.ChangedBy',
    name: 'Changed By',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'System.ChangedDate': {
    referenceName: 'System.ChangedDate',
    name: 'Changed Date',
    type: 'dateTime',
    description: undefined,
    isPicklist: false,
  },
  'System.CommentCount': {
    referenceName: 'System.CommentCount',
    name: 'Comment Count',
    type: 'integer',
    description: undefined,
    isPicklist: false,
  },
  'System.CreatedBy': {
    referenceName: 'System.CreatedBy',
    name: 'Created By',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'System.CreatedDate': {
    referenceName: 'System.CreatedDate',
    name: 'Created Date',
    type: 'dateTime',
    description: undefined,
    isPicklist: false,
  },
  'System.Description': {
    referenceName: 'System.Description',
    name: 'Description',
    type: 'html',
    description: 'Description or acceptance criteria for this epic to be considered complete',
    isPicklist: false,
  },
  'System.ExternalLinkCount': {
    referenceName: 'System.ExternalLinkCount',
    name: 'External Link Count',
    type: 'integer',
    description: undefined,
    isPicklist: false,
  },
  'System.History': {
    referenceName: 'System.History',
    name: 'History',
    type: 'history',
    description: 'Discussion thread plus automatic record of changes',
    isPicklist: false,
  },
  'System.HyperLinkCount': {
    referenceName: 'System.HyperLinkCount',
    name: 'Hyperlink Count',
    type: 'integer',
    description: undefined,
    isPicklist: false,
  },
  'System.Id': {
    referenceName: 'System.Id',
    name: 'ID',
    type: 'integer',
    description: undefined,
    isPicklist: false,
  },
  'System.IterationId': {
    referenceName: 'System.IterationId',
    name: 'Iteration ID',
    type: 'integer',
    description: undefined,
    isPicklist: false,
  },
  'System.IterationPath': {
    referenceName: 'System.IterationPath',
    name: 'Iteration Path',
    type: 'treePath',
    description: 'The iteration within which this bug will be fixed',
    isPicklist: false,
  },
  'System.NodeName': {
    referenceName: 'System.NodeName',
    name: 'Node Name',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'System.Parent': {
    referenceName: 'System.Parent',
    name: 'Parent',
    type: 'integer',
    description: undefined,
    isPicklist: false,
  },
  'System.Reason': {
    referenceName: 'System.Reason',
    name: 'Reason',
    type: 'string',
    description: 'The reason why the bug is in the current state',
    isPicklist: false,
  },
  'System.RelatedLinkCount': {
    referenceName: 'System.RelatedLinkCount',
    name: 'Related Link Count',
    type: 'integer',
    description: undefined,
    isPicklist: false,
  },
  'System.RemoteLinkCount': {
    referenceName: 'System.RemoteLinkCount',
    name: 'Remote Link Count',
    type: 'integer',
    description: undefined,
    isPicklist: false,
  },
  'System.Rev': {
    referenceName: 'System.Rev',
    name: 'Rev',
    type: 'integer',
    description: undefined,
    isPicklist: false,
  },
  'System.RevisedDate': {
    referenceName: 'System.RevisedDate',
    name: 'Revised Date',
    type: 'dateTime',
    description: undefined,
    isPicklist: false,
  },
  'System.State': {
    referenceName: 'System.State',
    name: 'State',
    type: 'string',
    description: 'New = for triage; Active = not yet fixed; Resolved = fixed not yet verified; Closed = fix verified.',
    isPicklist: false,
  },
  'System.Tags': {
    referenceName: 'System.Tags',
    name: 'Tags',
    type: 'plainText',
    description: undefined,
    isPicklist: false,
  },
  'System.TeamProject': {
    referenceName: 'System.TeamProject',
    name: 'Team Project',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'System.Title': {
    referenceName: 'System.Title',
    name: 'Title',
    type: 'string',
    description: 'Stories affected and how',
    isPicklist: false,
  },
  'System.Watermark': {
    referenceName: 'System.Watermark',
    name: 'Watermark',
    type: 'integer',
    description: undefined,
    isPicklist: false,
  },
  'System.WorkItemType': {
    referenceName: 'System.WorkItemType',
    name: 'Work Item Type',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.AcceptanceCriteria': {
    referenceName: 'Microsoft.VSTS.Common.AcceptanceCriteria',
    name: 'Acceptance Criteria',
    type: 'html',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.CodeReview.AcceptedBy': {
    referenceName: 'Microsoft.VSTS.CodeReview.AcceptedBy',
    name: 'Accepted By',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.CodeReview.AcceptedDate': {
    referenceName: 'Microsoft.VSTS.CodeReview.AcceptedDate',
    name: 'Accepted Date',
    type: 'dateTime',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.ActivatedBy': {
    referenceName: 'Microsoft.VSTS.Common.ActivatedBy',
    name: 'Activated By',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.ActivatedDate': {
    referenceName: 'Microsoft.VSTS.Common.ActivatedDate',
    name: 'Activated Date',
    type: 'dateTime',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.Activity': {
    referenceName: 'Microsoft.VSTS.Common.Activity',
    name: 'Activity',
    type: 'string',
    description: 'Type of work involved',
    isPicklist: false,
  },
  'Microsoft.VSTS.Feedback.ApplicationLaunchInstructions': {
    referenceName: 'Microsoft.VSTS.Feedback.ApplicationLaunchInstructions',
    name: 'Application Launch Instructions',
    type: 'html',
    description: 'Instructions to launch the specified application',
    isPicklist: false,
  },
  'Microsoft.VSTS.Feedback.ApplicationStartInformation': {
    referenceName: 'Microsoft.VSTS.Feedback.ApplicationStartInformation',
    name: 'Application Start Information',
    type: 'plainText',
    description: 'The path to execute the application',
    isPicklist: false,
  },
  'Microsoft.VSTS.Feedback.ApplicationType': {
    referenceName: 'Microsoft.VSTS.Feedback.ApplicationType',
    name: 'Application Type',
    type: 'string',
    description: 'The type of application on which to give feedback',
    isPicklist: false,
  },
  'Microsoft.VSTS.CodeReview.Context': {
    referenceName: 'Microsoft.VSTS.CodeReview.Context',
    name: 'Associated Context',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.CodeReview.ContextCode': {
    referenceName: 'Microsoft.VSTS.CodeReview.ContextCode',
    name: 'Associated Context Code',
    type: 'integer',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.CodeReview.ContextOwner': {
    referenceName: 'Microsoft.VSTS.CodeReview.ContextOwner',
    name: 'Associated Context Owner',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.CodeReview.ContextType': {
    referenceName: 'Microsoft.VSTS.CodeReview.ContextType',
    name: 'Associated Context Type',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.TCM.AutomatedTestId': {
    referenceName: 'Microsoft.VSTS.TCM.AutomatedTestId',
    name: 'Automated Test Id',
    type: 'string',
    description: 'The ID of the test that automates this test case',
    isPicklist: false,
  },
  'Microsoft.VSTS.TCM.AutomatedTestName': {
    referenceName: 'Microsoft.VSTS.TCM.AutomatedTestName',
    name: 'Automated Test Name',
    type: 'string',
    description: 'The name of the test that automates this test case',
    isPicklist: false,
  },
  'Microsoft.VSTS.TCM.AutomatedTestStorage': {
    referenceName: 'Microsoft.VSTS.TCM.AutomatedTestStorage',
    name: 'Automated Test Storage',
    type: 'string',
    description: 'The assembly containing the test that automates this test case',
    isPicklist: false,
  },
  'Microsoft.VSTS.TCM.AutomatedTestType': {
    referenceName: 'Microsoft.VSTS.TCM.AutomatedTestType',
    name: 'Automated Test Type',
    type: 'string',
    description: 'The type of the test that automates this test case',
    isPicklist: false,
  },
  'Microsoft.VSTS.TCM.AutomationStatus': {
    referenceName: 'Microsoft.VSTS.TCM.AutomationStatus',
    name: 'Automation status',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.BusinessValue': {
    referenceName: 'Microsoft.VSTS.Common.BusinessValue',
    name: 'Business Value',
    type: 'integer',
    description: 'The business value for the customer when the epic is released',
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.ClosedBy': {
    referenceName: 'Microsoft.VSTS.Common.ClosedBy',
    name: 'Closed By',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.ClosedDate': {
    referenceName: 'Microsoft.VSTS.Common.ClosedDate',
    name: 'Closed Date',
    type: 'dateTime',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.CodeReview.ClosedStatus': {
    referenceName: 'Microsoft.VSTS.CodeReview.ClosedStatus',
    name: 'Closed Status',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.CodeReview.ClosedStatusCode': {
    referenceName: 'Microsoft.VSTS.CodeReview.ClosedStatusCode',
    name: 'Closed Status Code',
    type: 'integer',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.CodeReview.ClosingComment': {
    referenceName: 'Microsoft.VSTS.CodeReview.ClosingComment',
    name: 'Closing Comment',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.Scheduling.CompletedWork': {
    referenceName: 'Microsoft.VSTS.Scheduling.CompletedWork',
    name: 'Completed Work',
    type: 'double',
    description: 'The number of units of work that have been spent on this bug',
    isPicklist: false,
  },
  'Microsoft.VSTS.Scheduling.DueDate': {
    referenceName: 'Microsoft.VSTS.Scheduling.DueDate',
    name: 'Due Date',
    type: 'dateTime',
    description: 'The date by which this issue needs to be closed',
    isPicklist: false,
  },
  'Microsoft.VSTS.Scheduling.Effort': {
    referenceName: 'Microsoft.VSTS.Scheduling.Effort',
    name: 'Effort',
    type: 'double',
    description: 'The estimated effort to implemented the epic',
    isPicklist: false,
  },
  'Microsoft.VSTS.Scheduling.FinishDate': {
    referenceName: 'Microsoft.VSTS.Scheduling.FinishDate',
    name: 'Finish Date',
    type: 'dateTime',
    description: 'The date to finish the task',
    isPicklist: false,
  },
  'Microsoft.VSTS.Build.FoundIn': {
    referenceName: 'Microsoft.VSTS.Build.FoundIn',
    name: 'Found In',
    type: 'string',
    description: 'The build in which the bug was found',
    isPicklist: false,
  },
  'Microsoft.VSTS.Build.IntegrationBuild': {
    referenceName: 'Microsoft.VSTS.Build.IntegrationBuild',
    name: 'Integration Build',
    type: 'string',
    description: 'The build in which the bug was fixed',
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.Issue': {
    referenceName: 'Microsoft.VSTS.Common.Issue',
    name: 'Issue',
    type: 'string',
    description: 'Used to highlight the shared step, e.g., to mark it as an issue',
    isPicklist: false,
  },
  'Microsoft.VSTS.TCM.LocalDataSource': {
    referenceName: 'Microsoft.VSTS.TCM.LocalDataSource',
    name: 'Local Data Source',
    type: 'html',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.Scheduling.OriginalEstimate': {
    referenceName: 'Microsoft.VSTS.Scheduling.OriginalEstimate',
    name: 'Original Estimate',
    type: 'double',
    description: 'Initial value for Remaining Work - set once, when work begins',
    isPicklist: false,
  },
  'Microsoft.VSTS.TCM.Parameters': {
    referenceName: 'Microsoft.VSTS.TCM.Parameters',
    name: 'Parameters',
    type: 'html',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.Priority': {
    referenceName: 'Microsoft.VSTS.Common.Priority',
    name: 'Priority',
    type: 'integer',
    description: 'Business importance. 1=must fix; 4=unimportant.',
    isPicklist: false,
  },
  'Microsoft.VSTS.TCM.QueryText': {
    referenceName: 'Microsoft.VSTS.TCM.QueryText',
    name: 'Query Text',
    type: 'plainText',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.Rating': {
    referenceName: 'Microsoft.VSTS.Common.Rating',
    name: 'Rating',
    type: 'string',
    description: 'Overall rating provided as part of feedback response',
    isPicklist: false,
  },
  'Microsoft.VSTS.Scheduling.RemainingWork': {
    referenceName: 'Microsoft.VSTS.Scheduling.RemainingWork',
    name: 'Remaining Work',
    type: 'double',
    description: 'An estimate of the number of units of work remaining to complete this bug',
    isPicklist: false,
  },
  'Microsoft.VSTS.TCM.ReproSteps': {
    referenceName: 'Microsoft.VSTS.TCM.ReproSteps',
    name: 'Repro Steps',
    type: 'html',
    description: 'How to see the bug. End by contrasting expected with actual behavior.',
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.ResolvedBy': {
    referenceName: 'Microsoft.VSTS.Common.ResolvedBy',
    name: 'Resolved By',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.ResolvedDate': {
    referenceName: 'Microsoft.VSTS.Common.ResolvedDate',
    name: 'Resolved Date',
    type: 'dateTime',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.ResolvedReason': {
    referenceName: 'Microsoft.VSTS.Common.ResolvedReason',
    name: 'Resolved Reason',
    type: 'string',
    description: 'The reason why the bug was resolved',
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.ReviewedBy': {
    referenceName: 'Microsoft.VSTS.Common.ReviewedBy',
    name: 'Reviewed By',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.Risk': {
    referenceName: 'Microsoft.VSTS.Common.Risk',
    name: 'Risk',
    type: 'string',
    description: 'Uncertainty in epic',
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.Severity': {
    referenceName: 'Microsoft.VSTS.Common.Severity',
    name: 'Severity',
    type: 'string',
    description: 'Assessment of the effect of the bug on the project',
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.StackRank': {
    referenceName: 'Microsoft.VSTS.Common.StackRank',
    name: 'Stack Rank',
    type: 'double',
    description: 'Work first on items with lower-valued stack rank. Set in triage.',
    isPicklist: false,
  },
  'Microsoft.VSTS.Scheduling.StartDate': {
    referenceName: 'Microsoft.VSTS.Scheduling.StartDate',
    name: 'Start Date',
    type: 'dateTime',
    description: 'The date to start the task',
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.StateChangeDate': {
    referenceName: 'Microsoft.VSTS.Common.StateChangeDate',
    name: 'State Change Date',
    type: 'dateTime',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.StateCode': {
    referenceName: 'Microsoft.VSTS.Common.StateCode',
    name: 'State Code',
    type: 'integer',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.TCM.Steps': {
    referenceName: 'Microsoft.VSTS.TCM.Steps',
    name: 'Steps',
    type: 'html',
    description: 'Steps required to perform the test',
    isPicklist: false,
  },
  'Microsoft.VSTS.Scheduling.StoryPoints': {
    referenceName: 'Microsoft.VSTS.Scheduling.StoryPoints',
    name: 'Story Points',
    type: 'double',
    description: 'The size of work estimated for fixing the bug',
    isPicklist: false,
  },
  'Microsoft.VSTS.TCM.SystemInfo': {
    referenceName: 'Microsoft.VSTS.TCM.SystemInfo',
    name: 'System Info',
    type: 'html',
    description: 'Test context, provided automatically by test infrastructure',
    isPicklist: false,
  },
  'Microsoft.VSTS.Scheduling.TargetDate': {
    referenceName: 'Microsoft.VSTS.Scheduling.TargetDate',
    name: 'Target Date',
    type: 'dateTime',
    description: 'The target date for completing the epic',
    isPicklist: false,
  },
  'Microsoft.VSTS.TCM.TestSuiteAudit': {
    referenceName: 'Microsoft.VSTS.TCM.TestSuiteAudit',
    name: 'Test Suite Audit',
    type: 'plainText',
    description: 'Captures the test suite audit trail.',
    isPicklist: false,
  },
  'Microsoft.VSTS.TCM.TestSuiteType': {
    referenceName: 'Microsoft.VSTS.TCM.TestSuiteType',
    name: 'Test Suite Type',
    type: 'string',
    description: 'Specifies the category of the test suite.',
    isPicklist: false,
  },
  'Microsoft.VSTS.TCM.TestSuiteTypeId': {
    referenceName: 'Microsoft.VSTS.TCM.TestSuiteTypeId',
    name: 'Test Suite Type Id',
    type: 'integer',
    description: undefined,
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.TimeCriticality': {
    referenceName: 'Microsoft.VSTS.Common.TimeCriticality',
    name: 'Time Criticality',
    type: 'double',
    description: 'How does the business value decay over time. Higher values make the epic more time critical',
    isPicklist: false,
  },
  'Microsoft.VSTS.Common.ValueArea': {
    referenceName: 'Microsoft.VSTS.Common.ValueArea',
    name: 'Value Area',
    type: 'string',
    description: 'The type should be set to Business primarily to represent customer-facing issues. Work to change the architecture should be added as a User Story',
    isPicklist: false,
  },
  'Custom.AddtoPMOReport': {
    referenceName: 'Custom.AddtoPMOReport',
    name: 'Add to PMO Report',
    type: 'boolean',
    description: undefined,
    isPicklist: false,
  },
  'Custom.MajorProject': {
    referenceName: 'Custom.MajorProject',
    name: 'Major Project',
    type: 'string',
    description: undefined,
    isPicklist: true,
  },
  'Custom.MicroChannelDevOps#': {
    referenceName: 'Custom.MicroChannelDevOps#',
    name: 'Micro Channel DevOps #',
    type: 'integer',
    description: undefined,
    isPicklist: false,
  },
  'Custom.Percentagecompletion': {
    referenceName: 'Custom.Percentagecompletion',
    name: 'Percentage completion',
    type: 'integer',
    description: 'Describe the completion progress of the item',
    isPicklist: false,
  },
  'Custom.Requestor': {
    referenceName: 'Custom.Requestor',
    name: 'Requestor',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'Custom.ServiceNow': {
    referenceName: 'Custom.ServiceNow',
    name: 'Service Now',
    type: 'string',
    description: undefined,
    isPicklist: false,
  },
  'Custom.TheHive': {
    referenceName: 'Custom.TheHive',
    name: 'The Hive',
    type: 'string',
    description: undefined,
    isPicklist: false,
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getFieldName(referenceName: string): string {
  return FIELD_METADATA[referenceName]?.name || referenceName;
}

export function getFieldType(referenceName: string): string {
  return FIELD_METADATA[referenceName]?.type || 'String';
}

export function isPicklistField(referenceName: string): boolean {
  return FIELD_METADATA[referenceName]?.isPicklist || false;
}
