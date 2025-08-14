# Learning Platform Multi-Agent Team

This directory contains the configuration for a multi-agent team designed to develop a lightweight, modular learning platform with xAPI LRS integration and LLM capabilities.

## Team Structure

### Orchestrator
- **Role**: Main coordinator for all agents
- **Config**: `orchestrator-agent.yaml`
- **Responsibilities**: Task distribution, conflict resolution, progress monitoring

### Specialist Agents

1. **Product Manager Agent**
   - Defines learning objectives and user requirements
   - Creates user stories for Admin, Teacher, and Learner roles
   - Prioritizes LLM-enhanced learning features

2. **Technical Lead Agent**
   - Enforces architecture standards and DRY principles
   - Ensures modules stay under 200 lines
   - Designs xAPI and LLM integration patterns

3. **Frontend Developer Agent**
   - Builds jQuery-based dashboards
   - Creates reusable UI components
   - Implements xAPI tracking for user interactions

4. **Backend Developer Agent**
   - Develops Node.js APIs with Express
   - Integrates xAPI LRS as sole datastore
   - Implements LLM API connections

5. **QA Engineer Agent**
   - Tests all three user role dashboards
   - Validates xAPI compliance
   - Ensures code quality standards

6. **UX/UI Designer Agent**
   - Designs user interfaces for three roles
   - Creates jQuery-compatible designs
   - Plans LLM interaction patterns

7. **DevOps Engineer Agent**
   - Manages lightweight deployments
   - Configures minimal infrastructure
   - Handles LRS initialization

8. **Data Engineer Agent**
   - Optimizes xAPI data management
   - Engineers LLM prompts
   - Creates learning analytics

## Communication Protocol

The team uses a structured communication protocol defined in `communication-protocol.yaml`:

- **Message Types**: task_request, status_update, collaboration_request, data_sharing
- **Workflows**: feature_development, xapi_compliance, llm_integration, code_quality
- **Escalation**: Three-level escalation matrix for issues

## Key Features

- **Modular Architecture**: All code modules limited to 200 lines
- **DRY Principles**: Enforced code reusability
- **xAPI Only**: No traditional database, only Learning Record Store
- **LLM Integration**: AI-enhanced learning features
- **Three Dashboards**: Admin, Teacher, and Learner interfaces
- **Lightweight Stack**: Node.js + jQuery only

## Usage

1. Configure environment variables:
   ```bash
   export LRS_ENDPOINT="your-lrs-endpoint"
   export LRS_AUTH="your-lrs-auth"
   export LLM_PROVIDER="your-llm-provider"
   export LLM_API_KEY="your-api-key"
   ```

2. Initialize the team:
   ```bash
   node agent-team-launcher.js
   ```

3. The orchestrator will coordinate all agents to build the learning platform

## Success Metrics

- Module size compliance: 100%
- Code duplication: <5%
- Dashboard load time: <2 seconds
- xAPI validation: 100%
- Monthly infrastructure cost: <$50

## Files

- `orchestrator-agent.yaml` - Main coordinator configuration
- `subagents/` - Individual agent configurations
- `communication-protocol.yaml` - Inter-agent communication rules
- `team-config.json` - Team initialization configuration