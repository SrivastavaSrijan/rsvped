---
name: using-effects
description: Guidelines on when to use and when to avoid React useEffect. Use when working with Effects, data fetching, synchronizing with external systems, or when optimizing component performance.
---

# You Might Not Need an Effect

Effects are an escape hatch from the React paradigm. They let you "step outside" of React and synchronize your components with some external system like a non-React widget, network, or the browser DOM. If there is no external system involved (for example, if you want to update a component's state when some props or state change), you shouldn't need an Effect. Removing unnecessary Effects will make your code easier to follow, faster to run, and less error-prone.

Source: https://react.dev/learn/you-might-not-need-an-effect

## Key Principles

- **Transform data during rendering**: Don't use Effects to transform data for rendering
- **Handle user events in event handlers**: Don't use Effects to handle user events
- **Use Effects for external systems**: Effects are for synchronizing with external systems (network, DOM, non-React widgets)
- **Use getAPI() for data fetching**: In this codebase, fetch data server-side with `getAPI()` in RSCs and pass as props — never use `trpc.*.useQuery()` client-side hooks
- **Use Server Actions for mutations**: Via `useActionStateWithError`, not `trpc.*.useMutation()`

## When You Don't Need Effects

### 1. Updating State Based on Props or State

If something can be calculated from existing props or state, don't put it in state. Calculate it during rendering.

#### Don't

```tsx
const MyForm = () => {
  const [firstName, setFirstName] = useState('Taylor');
  const [lastName, setLastName] = useState('Swift');

  // Bad: redundant state and unnecessary Effect
  const [fullName, setFullName] = useState('');
  useEffect(() => {
    setFullName(firstName + ' ' + lastName);
  }, [firstName, lastName]);
};
```

#### Do

```tsx
const MyForm = () => {
  const [firstName, setFirstName] = useState('Taylor');
  const [lastName, setLastName] = useState('Swift');
  // Good: calculated during rendering
  const fullName = firstName + ' ' + lastName;
};
```

### 2. Caching Expensive Calculations

Don't use Effects to cache expensive calculations.

#### Don't

```tsx
const TodoList = ({ todos, filter }: TodoListProps) => {
  const [newTodo, setNewTodo] = useState('');

  // Bad: redundant state and unnecessary Effect
  const [visibleTodos, setVisibleTodos] = useState([]);
  useEffect(() => {
    setVisibleTodos(getFilteredTodos(todos, filter));
  }, [todos, filter]);
};
```

#### Do

```tsx
const TodoList = ({ todos, filter }: TodoListProps) => {
  const [newTodo, setNewTodo] = useState('');
  // Good: compute directly (React Compiler handles memoization)
  const visibleTodos = getFilteredTodos(todos, filter);
};
```

### 3. Resetting All State When a Prop Changes

To reset the state of an entire component tree, pass a different `key` to it.

#### Don't

```tsx
const ProfilePage = ({ userId }: { userId: string }) => {
  const [comment, setComment] = useState('');

  // Bad: Resetting state on prop change in an Effect
  useEffect(() => {
    setComment('');
  }, [userId]);
};
```

#### Do

```tsx
const ProfilePage = ({ userId }: { userId: string }) => {
  return (
    <Profile userId={userId} key={userId} />
  );
};

const Profile = ({ userId }: { userId: string }) => {
  // Good: This and any other state below will reset on key change automatically
  const [comment, setComment] = useState('');
};
```

### 4. Adjusting Some State When a Prop Changes

Sometimes you need to reset or adjust a part of the state on a prop change, but not all of it.

#### Don't

```tsx
const List = ({ items }: ListProps) => {
  const [isReverse, setIsReverse] = useState(false);
  const [selection, setSelection] = useState(null);

  // Bad: Adjusting state on prop change in an Effect
  useEffect(() => {
    setSelection(null);
  }, [items]);
};
```

#### Better (Adjust state during rendering)

```tsx
const List = ({ items }: ListProps) => {
  const [isReverse, setIsReverse] = useState(false);
  const [selection, setSelection] = useState(null);

  const [prevItems, setPrevItems] = useState(items);
  if (items !== prevItems) {
    setPrevItems(items);
    setSelection(null);
  }
};
```

#### Best (Calculate during rendering)

```tsx
const List = ({ items }: ListProps) => {
  const [isReverse, setIsReverse] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  // Best: Calculate everything during rendering
  const selection = items.find(item => item.id === selectedId) ?? null;
};
```

### 5. Sharing Logic Between Event Handlers

If logic needs to run in response to a user event, put it in an event handler, not an Effect.

#### Don't

```tsx
const ProductPage = ({ product, addToCart }: ProductPageProps) => {
  // Bad: Event-specific logic inside an Effect
  useEffect(() => {
    if (product.isInCart) {
      showNotification(`Added ${product.name} to the shopping cart!`);
    }
  }, [product]);

  const handleBuyClick = () => {
    addToCart(product);
  };
};
```

#### Do

```tsx
const ProductPage = ({ product, addToCart }: ProductPageProps) => {
  // Good: Event-specific logic is called from event handlers
  const handleBuyClick = () => {
    addToCart(product);
    showNotification(`Added ${product.name} to the shopping cart!`);
  };
};
```

### 6. Sending a POST Request / Mutations

Put mutations in event handlers or use Server Actions, not Effects.

#### Don't

```tsx
const Form = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jsonToSubmit, setJsonToSubmit] = useState(null);

  // Bad: Event-specific logic inside an Effect
  useEffect(() => {
    if (jsonToSubmit !== null) {
      post('/api/register', jsonToSubmit);
    }
  }, [jsonToSubmit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setJsonToSubmit({ firstName, lastName });
  };
};
```

#### Do (Server Action with useActionStateWithError)

```tsx
import { useActionStateWithError } from "@/hooks/useActionStateWithError";
import { registerAction } from "./actions";

const Form = () => {
  const [state, formAction, isPending] = useActionStateWithError(registerAction);

  return (
    <form action={formAction}>
      <input name="firstName" />
      <input name="lastName" />
      <button type="submit" disabled={isPending}>Register</button>
    </form>
  );
};
```

### 7. Chains of Computations

Avoid chaining Effects that each adjust state based on other state.

#### Don't

```tsx
const Game = () => {
  const [card, setCard] = useState(null);
  const [goldCardCount, setGoldCardCount] = useState(0);
  const [round, setRound] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);

  // Bad: Chains of Effects that adjust state solely to trigger each other
  useEffect(() => {
    if (card !== null && card.gold) {
      setGoldCardCount(c => c + 1);
    }
  }, [card]);

  useEffect(() => {
    if (goldCardCount > 3) {
      setRound(r => r + 1);
      setGoldCardCount(0);
    }
  }, [goldCardCount]);

  useEffect(() => {
    if (round > 5) {
      setIsGameOver(true);
    }
  }, [round]);
};
```

#### Do

```tsx
const Game = () => {
  const [card, setCard] = useState(null);
  const [goldCardCount, setGoldCardCount] = useState(0);
  const [round, setRound] = useState(1);

  // Good: Calculate what you can during rendering
  const isGameOver = round > 5;

  const handlePlaceCard = (nextCard) => {
    if (isGameOver) throw Error('Game already ended.');

    // Good: Calculate all the next state in the event handler
    setCard(nextCard);
    if (nextCard.gold) {
      if (goldCardCount <= 3) {
        setGoldCardCount(goldCardCount + 1);
      } else {
        setGoldCardCount(0);
        setRound(round + 1);
        if (round === 5) alert('Good game!');
      }
    }
  };
};
```

### 8. Notifying Parent Components About State Changes

Avoid using Effects to notify parent components about state changes.

#### Don't

```tsx
const Toggle = ({ onChange }: { onChange: (isOn: boolean) => void }) => {
  const [isOn, setIsOn] = useState(false);

  // Bad: The onChange handler runs too late
  useEffect(() => {
    onChange(isOn);
  }, [isOn, onChange]);

  const handleClick = () => {
    setIsOn(!isOn);
  };
};
```

#### Do

```tsx
const Toggle = ({ onChange }: { onChange: (isOn: boolean) => void }) => {
  const [isOn, setIsOn] = useState(false);

  const handleClick = () => {
    const nextIsOn = !isOn;
    setIsOn(nextIsOn);
    onChange(nextIsOn); // Good: Notify during the event
  };
};
```

## When You DO Need Effects

### Synchronizing with External Systems

Use Effects when you need to synchronize with something outside of React:

- Non-React widgets
- Browser DOM manipulation (focus, scroll, measure)
- External stores/subscriptions
- Timers

### Fetching Data

In this codebase, all data fetching goes through `getAPI()` in React Server Components:

- **Server components (pages, layouts)**: `const api = await getAPI(); const data = await api.domain.action(input);`
- **Client components**: Receive data as props from parent RSCs — never fetch directly
- **Mutations**: Server Actions via `useActionStateWithError`

Never use `trpc.*.useQuery()` or `trpc.*.useMutation()` client-side hooks. See the tRPC routers at `@/server/api/routers/` for available endpoints.

If you must use an Effect for data fetching (e.g., external non-tRPC API), implement cleanup to avoid race conditions:

```tsx
const SearchResults = ({ query }: { query: string }) => {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let ignore = false;
    fetchResults(query, page).then(json => {
      if (!ignore) {
        setResults(json);
      }
    });
    return () => {
      ignore = true;
    };
  }, [query, page]);
};
```

### Subscribing to External Stores

```tsx
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
```

## Recap

| Scenario | Use Effect? | Better Alternative |
|----------|-------------|-------------------|
| Calculate from props/state | No | Calculate during rendering |
| Cache expensive calculations | No | React Compiler handles memoization |
| Reset state when prop changes | No | Use `key` prop |
| Handle user events | No | Event handlers |
| Send POST / mutations | No | Server Actions or `trpc.*.useMutation()` |
| Chain state updates | No | Single event handler |
| Notify parent of state changes | No | Call in event handler |
| Fetch data | No | RSC `getAPI()`, pass as props to client components |
| Sync with external system | Yes | Effect with cleanup |
| Subscribe to external store | Yes | `useSyncExternalStore` or Effect |
