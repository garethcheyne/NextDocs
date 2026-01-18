import { type MarkdownTemplate } from '@/components/markdown/markdown-templates'

// Templates for Release Notes
export const releaseTemplates: MarkdownTemplate[] = [
  {
    name: 'Standard Release Notes',
    content: `## What's New

- **New Feature**: Description of the new feature
- **Improvement**: What was improved

## Bug Fixes

- Fixed issue with...
- Resolved problem with...

## Notes

For questions, contact the support team.`
  },
  {
    name: 'Major Release',
    content: `## 🎉 Major Release

### New Features
- **Feature Name**: Detailed description
- **Another Feature**: What it does

### Improvements
- Enhanced performance
- Better user experience

### Breaking Changes
- ⚠️ Important change that may affect existing functionality

### Bug Fixes
- Fixed critical issues

### Migration Guide
Steps to upgrade from previous version...`
  },
  {
    name: 'Bug Fix Release',
    content: `## Bug Fixes & Improvements

### Fixed Issues
- 🐛 Fixed issue with [describe issue]
- 🐛 Resolved problem with [describe problem]
- 🐛 Corrected behavior of [describe behavior]

### Performance Improvements
- ⚡ Optimized loading times
- ⚡ Reduced memory usage

### Notes
No breaking changes in this release.`
  }
]

// Templates for Feature Requests
export const featureRequestTemplates: MarkdownTemplate[] = [
  {
    name: 'Feature Request',
    content: `## Problem Statement
Describe the problem you're trying to solve or the need you're trying to address.

## Proposed Solution
Explain your proposed solution or feature idea.

## Use Case
Describe how you would use this feature in your workflow.

## Additional Context
Add any other context, screenshots, or examples that would help explain your request.`
  },
  {
    name: 'Bug Report',
    content: `## Description
A clear description of the bug.

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- Browser: 
- OS: 
- Version: 

## Screenshots
If applicable, add screenshots to help explain the problem.`
  },
  {
    name: 'Enhancement Request',
    content: `## Current Functionality
Describe how the feature currently works.

## Proposed Enhancement
Explain what you'd like to improve or change.

## Benefits
- Who would benefit from this change?
- What problems does it solve?
- How does it improve the user experience?

## Alternatives Considered
Other approaches you've thought about.`
  }
]

// Templates for Comments
export const commentTemplates: MarkdownTemplate[] = [
  {
    name: 'Support Comment',
    content: `👍 I support this request!

**Why this is important to me:**
[Explain your use case]

**Additional thoughts:**
[Any suggestions or related ideas]`
  },
  {
    name: 'Detailed Feedback',
    content: `## My Experience
[Share your perspective on this request]

## Suggestions
- [Suggestion 1]
- [Suggestion 2]

## Concerns
[Any potential issues or considerations]`
  },
  {
    name: 'Alternative Approach',
    content: `I have an alternative approach to consider:

## Proposal
[Describe your alternative solution]

## Pros
- [Advantage 1]
- [Advantage 2]

## Cons
- [Disadvantage 1]
- [Disadvantage 2]`
  }
]

// Templates for Work Items / Tasks
export const workItemTemplates: MarkdownTemplate[] = [
  {
    name: 'Task Template',
    content: `## Objective
[What needs to be accomplished]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Notes
[Any technical details or considerations]

## Dependencies
[Related tasks or blockers]`
  },
  {
    name: 'Investigation Task',
    content: `## Investigation Goal
[What we need to research or investigate]

## Questions to Answer
1. [Question 1]
2. [Question 2]
3. [Question 3]

## Resources
- [Link or reference 1]
- [Link or reference 2]

## Findings
[To be filled in during investigation]`
  }
]

// Empty template for general use
export const noTemplates: MarkdownTemplate[] = []
