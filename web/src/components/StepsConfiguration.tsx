import { Box, Center, Flex, Spinner } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Step, useCompleteExerciseQuery } from "../generated/graphql";
import { DialogConfiguration } from "./DialogConfiguration";
import { StepConfiguration } from "./StepConfiguration";
import { StepsAccordion } from "./StepsAccordion";

interface StepsConfigurationProps {
  exerciseId: number;
}

export const StepsConfiguration: React.FC<StepsConfigurationProps> = ({
  exerciseId,
}) => {
  const [{ data, fetching }] = useCompleteExerciseQuery({
    variables: {
      id: exerciseId,
    },
  });
  const [configuration, setConfiguration] = useState({} as any);

  const spinner = (
    <Center mt={32}>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    </Center>
  );

  const getSelectedItemComponent = (config: any, selected?: any) => {
    const steps = config?.exercise?.steps || [];
    const selectedItem = selected || config.selectedItem || {};
    const selectedStep = steps.find((s: any) => s.id === selectedItem?.stepId);
    if (!selectedStep) {
      // TODO: should handle error
      return null;
    }
    if (selectedItem?.type === "step") {
      return (
        <StepConfiguration key={selectedItem.stepId} step={selectedStep} />
      );
    } else if (selectedItem?.type === "dialog") {
      const dialogs: any[] = selectedStep.dialogs || [];
      const selectedDialog = dialogs.find(
        (d: any) => d.id === selectedItem.dialogId
      );
      return (
        <DialogConfiguration
          key={selectedItem.dialogId}
          stepId={selectedStep.id}
          stepType={selectedStep.type}
          dialog={selectedDialog}
          onDialogAdded={onDialogAdded}
        />
      );
    }
    return null;
  };

  const getEmptyStepComponent = () => {
    if (exerciseId) {
      return (
        <StepConfiguration
          key="newStepConfiguration"
          onStepAdded={onStepAdded}
          exerciseId={exerciseId}
        />
      );
    }
    return null;
  };

  const getEmptyDialogComponent = (step: any) => {
    return (
      <DialogConfiguration
        key={`${step?.id}-newDialog`}
        stepId={step?.id}
        stepType={step?.type}
        onDialogAdded={onDialogAdded}
      />
    );
  };

  const getDefaultComponent = (steps: any[] = []) => {
    if (steps.length > 0) {
      return (
        <StepConfiguration key="defaultStepConfiguration" step={steps[0]} />
      );
    }
    return null;
  };

  const getSelectedOrDefault = (exercise: any) => {
    if (configuration?.selectedItem) {
      return getSelectedItemComponent(configuration);
    }
    return getDefaultComponent(exercise.steps);
  };

  const getSelectedItem = (exercise: any) => {
    if (configuration?.selectedItem) {
      return { ...configuration.selectedItem };
    }
    const steps = exercise.steps || [];
    const stepId = steps.length > 0 ? steps[0].id : undefined;
    return {
      type: "step",
      stepId,
    };
  };

  useEffect(() => {
    if (!fetching && data?.exercise) {
      const newConfiguration = {
        selectedComponent: getSelectedOrDefault(data.exercise),
        exercise: data.exercise,
        selectedItem: getSelectedItem(data.exercise),
      };
      setConfiguration(newConfiguration);
    }
  }, [fetching, data]);

  const handleStepOrDialogChange = (newSelected: any) => {
    if (!configuration) {
      return;
    }
    const newConfiguration = {
      selectedComponent: getSelectedItemComponent(configuration, newSelected),
      exercise: { ...configuration.exercise },
      selectedItem: newSelected,
    };
    setConfiguration(newConfiguration);
  };

  const handleAddStep = () => {
    if (!configuration) {
      return;
    }
    const newConfiguration = {
      selectedComponent: getEmptyStepComponent(),
      exercise: { ...configuration.exercise },
      selectedItem: {
        type: "newStep",
      },
    };
    setConfiguration(newConfiguration);
  };

  const handleAddDialog = (step: any) => {
    if (!configuration) {
      return;
    }
    const newConfiguration = {
      selectedComponent: getEmptyDialogComponent(step),
      exercise: { ...configuration.exercise },
      selectedItem: {
        type: "newDialog",
      },
    };
    setConfiguration(newConfiguration);
  };

  const onStepAdded = (newStep: any) => {
    const newConfiguration = { ...configuration };
    if (newConfiguration?.exercise?.steps) {
      newConfiguration.exercise.steps.push(newStep);
    }
    setConfiguration(newConfiguration);
  };

  const onDialogAdded = (newDialog: any, stepId: number) => {
    const newConfiguration = { ...configuration };
    if (newConfiguration?.exercise?.steps) {
      const index = newConfiguration.exercise.steps.findIndex((s: any) => (s.id === stepId));
      const stepDialogs = newConfiguration.exercise.steps[index]?.dialogs || [];
      stepDialogs.push(newDialog);
      newConfiguration.exercise.steps[index].dialogs = stepDialogs;
    }
    setConfiguration(newConfiguration);
  };

  const steps = configuration?.exercise?.steps || [];
  const selected = configuration?.selectedComponent || null;
  const body = (
    <Flex>
      <Box flex="1" pr={10}>
        <StepsAccordion
          key={`steps-${exerciseId}`}
          steps={steps as Step[]}
          handleStepOrDialogChange={handleStepOrDialogChange}
          handleAddStep={handleAddStep}
          handleAddDialog={handleAddDialog}
        />
      </Box>
      <Box flex="4">{selected}</Box>
    </Flex>
  );

  return <>{body || spinner}</>;
};
