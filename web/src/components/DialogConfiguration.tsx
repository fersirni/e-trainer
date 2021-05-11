import React, { useState } from "react";
import { DefaultDialog } from "./DefaultDialog";
import { InteractiveDialog } from "./InteractiveDialog";

interface DialogConfigurationProps {
  dialog?: any;
  stepId: number;
  stepType: string;
  onDialogAdded: any;
}

export const DialogConfiguration: React.FC<DialogConfigurationProps> = ({
  dialog,
  stepId,
  stepType,
  onDialogAdded,
}) => {
  const [showAnswers, setShowAnswers] = useState(false as boolean);
  const onToggleShowAnswers = () => {
    setShowAnswers(!showAnswers);
  };

  const answers = <InteractiveDialog stepId={stepId} dialog={dialog} showConfiguration={onToggleShowAnswers} />;

  const dialogConfiguration = (
    <DefaultDialog
      stepId={stepId}
      dialog={dialog}
      stepType={stepType}
      showAnswers={onToggleShowAnswers}
      onDialogAdded={onDialogAdded}
    />
  );
  return <>{showAnswers? answers: dialogConfiguration}</>;
};
