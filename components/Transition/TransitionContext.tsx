// components/TransitionContext.tsx
import { createContext } from 'react';

interface TransitionContextType {
  navigateWithAnimation: (path: string) => void;
  isTransitioning: boolean;
}

export const TransitionContext = createContext<TransitionContextType>({
  navigateWithAnimation: () => {},
  isTransitioning: false,
});
