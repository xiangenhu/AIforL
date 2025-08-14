# CAR Framework Integration Architecture Plan

## Current State Analysis
- Basic Express.js app for lesson planning
- Simple LLM integration (OpenAI/Anthropic)
- No xAPI/LRS integration
- No user role management
- Single-purpose application

## Required Architecture Changes

### 1. Core Module Structure (<200 lines each)

```
/modules/
├── auth/               # User authentication & roles
│   ├── roleManager.js  # Admin/Teacher/Learner roles
│   └── session.js      # Stateless JWT sessions
├── projects/           # 4-stage project management
│   ├── stageManager.js # Define→Collect→Create→Present
│   ├── projectApi.js   # Project CRUD operations
│   └── collaboration.js # Team project support
├── ai-tools/           # AI tool integrations
│   ├── toolRegistry.js # Tool configuration
│   ├── elsaSpeak.js    # ELSA Speak integration
│   ├── talkPalAI.js    # TalkPal AI integration
│   └── doubao.js       # Doubao integration
├── xapi/               # xAPI/LRS integration
│   ├── statements.js   # Statement builders
│   ├── lrsClient.js    # LRS connection
│   └── vocabulary.js   # CAR-specific vocabulary
├── assessment/         # Assessment system
│   ├── grading.js      # Weighted grading logic
│   └── reflection.js   # Reflection components
└── analytics/          # Learning analytics
    ├── iloTracking.js  # 5 ILOs progress
    └── dashboards.js   # Role-specific views
```

### 2. Database → xAPI LRS Migration

**Remove**: Traditional database dependencies
**Add**: xAPI LRS as sole data store

```javascript
// xAPI statement pattern for project data
{
  actor: { account: { name: "learner123", homePage: "https://aiforl.edu" }},
  verb: { id: "http://aiforl.edu/verbs/created-project" },
  object: { 
    id: "http://aiforl.edu/projects/proj123",
    definition: {
      type: "http://aiforl.edu/activities/language-project",
      extensions: {
        "http://aiforl.edu/extensions/stage": "define",
        "http://aiforl.edu/extensions/language": "english",
        "http://aiforl.edu/extensions/ai-tools": ["elsaSpeak", "talkPal"]
      }
    }
  }
}
```

### 3. Frontend Architecture Updates

**jQuery Components Required**:
- `$.carProjectWizard()` - 4-stage project creation
- `$.aiToolSelector()` - AI tool recommendation widget
- `$.promptEngineer()` - Prompt practice interface
- `$.reflectionJournal()` - Reflection documentation
- `$.iloProgress()` - ILO achievement tracker
- `$.bilingualEditor()` - English/Chinese content editor

### 4. API Endpoints Restructure

```
/api/v2/
├── /auth
│   ├── POST /login
│   └── GET /profile
├── /projects
│   ├── GET / (list by role)
│   ├── POST / (create new)
│   ├── PUT /:id/stage (advance stage)
│   └── GET /:id/xapi (get statements)
├── /ai-tools
│   ├── GET /recommended (by proficiency)
│   ├── POST /integrate (add to project)
│   └── POST /prompt (test prompts)
├── /assessment
│   ├── POST /submit
│   ├── GET /rubric
│   └── POST /peer-review
└── /analytics
    ├── GET /ilo-progress
    ├── GET /usage-stats
    └── GET /class-overview (teacher only)
```

### 5. Configuration Updates

```javascript
// config/car-config.js
module.exports = {
  car: {
    stages: ['define', 'collect', 'create', 'present'],
    languages: ['english', 'chinese'],
    assessment: {
      weights: {
        englishProject: 0.20,
        englishReflection: 0.30,
        chineseProject: 0.30,
        chineseReflection: 0.20
      }
    },
    ilos: [
      'use-explain-evaluate',
      'apply-ethical-guidelines',
      'design-refine-prompts',
      'critically-assess-output',
      'integrate-personalized-learning'
    ],
    aiTools: {
      recommended: ['elsaSpeak', 'talkPalAI', 'doubao'],
      categories: ['pronunciation', 'conversation', 'translation', 'writing']
    }
  },
  xapi: {
    endpoint: process.env.LRS_ENDPOINT,
    auth: process.env.LRS_AUTH,
    version: '1.0.3'
  }
};
```

### 6. Implementation Priority

1. **Phase 1**: Core infrastructure (auth, xAPI, project structure)
2. **Phase 2**: AI tool integrations & prompt engineering
3. **Phase 3**: Assessment system & analytics
4. **Phase 4**: Advanced features (collaboration, peer review)

### 7. Module Size Compliance Strategy

- Each module limited to <200 lines
- Shared utilities extracted to `/lib`
- Heavy logic split into sub-modules
- Configuration externalized
- DRY principle enforced via code reviews

### 8. Performance Targets

- Dashboard load: <2 seconds
- API response: <200ms
- xAPI statement processing: <100ms
- AI tool response streaming: real-time
- Bundle size: <500KB total JS