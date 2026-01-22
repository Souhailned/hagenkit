# Agency Components

Components for displaying real estate agency information and agents.

## Components

### AgentCard

Display an agent profile in a card format.

```tsx
import { AgentCard } from "@/components/agency/agent-card";

<AgentCard agent={agentProfile} />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `agent` | `AgentProfile` | required | The agent data to display |
| `className` | `string` | - | Additional CSS classes |

## Types

Agency components use types from `@/types/agency`:

- `Agency` - Agency organization data
- `AgentProfile` - Individual agent profile
- `AgencyWithDetails` - Agency with related agents
