# Onboarding Components

Components for the user onboarding flow.

## Components

### `OnboardingFlow`

Main multi-step onboarding wizard that guides users through:

1. Introduction & role selection
2. Use case & discovery source
3. Workspace creation
4. Success confirmation

### `RoleSelection`

Two-card selection component for choosing user role in the horeca platform.

**Props:**

| Prop           | Type                          | Description                              |
| -------------- | ----------------------------- | ---------------------------------------- |
| `selectedRole` | `"seeker" \| "agent" \| null` | Currently selected role                  |
| `onSelect`     | `(role: RoleValue) => void`   | Callback when a role card is clicked     |

**Role Options:**

- `seeker` - "Ik zoek horeca ruimte" - For users looking for hospitality spaces
- `agent` - "Ik ben makelaar" - For real estate agents managing listings

**Usage:**

```tsx
import { RoleSelection } from "@/components/onboarding/role-selection";

function MyComponent() {
  const [role, setRole] = useState<"seeker" | "agent" | null>(null);

  return <RoleSelection selectedRole={role} onSelect={setRole} />;
}
```

**Features:**

- Responsive grid layout (stacked on mobile, side-by-side on desktop)
- Keyboard accessible (Enter/Space to select)
- Visual feedback with hover and selected states
- Primary border highlight for selected card

## Testing

When a test framework (Vitest + React Testing Library) is set up, the following test cases should be implemented for `RoleSelection`:

1. **Renders both role cards** - Verify "Ik zoek horeca ruimte" and "Ik ben makelaar" are displayed
2. **Renders descriptions** - Verify both description texts appear
3. **Calls onSelect on click** - Verify clicking seeker card calls `onSelect("seeker")`
4. **Calls onSelect for agent** - Verify clicking agent card calls `onSelect("agent")`
5. **Shows selected state** - Verify `aria-pressed="true"` on selected card
6. **Keyboard: Enter key** - Verify Enter triggers selection
7. **Keyboard: Space key** - Verify Space triggers selection
8. **Single selection** - Verify only one card can be selected at a time
