import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ActionState } from "@/types";

type FormMessageProps = {
  state: ActionState;
};

export function FormMessage({ state }: FormMessageProps) {
  if (!state.message) {
    return null;
  }

  return (
    <Alert variant={state.success ? "success" : "destructive"}>
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  );
}
