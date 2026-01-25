import { lazy, Suspense } from 'react';
import { Input } from '@/components/ui/input';

// Lazy load the phone input component
const PhoneInput = lazy(() =>
  import('@/components/phone-input').then((module) => ({
    default: module.PhoneInput,
  }))
);

// Loading fallback - simple input with loading state
function PhoneInputFallback() {
  return (
    <Input
      disabled
      placeholder="Loading..."
      className="animate-pulse"
    />
  );
}

// Wrapper component with Suspense
export function PhoneInputLazy(props: React.ComponentProps<typeof PhoneInput>) {
  return (
    <Suspense fallback={<PhoneInputFallback />}>
      <PhoneInput {...props} />
    </Suspense>
  );
}
