import { Box, Center, Flex, Spinner } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Step, useCompleteExerciseQuery } from "../generated/graphql";
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
  const [selectedItem, setSelectedItem] = useState({
    type: "step",
    stepId: undefined as any,
    dialogId: undefined as any,
  });
  const [exercise, setExercise] = useState(undefined as any);

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

  const getSelectedItemComponent = (steps: any[] = []) => {
    const selectedStep = steps.find((s: any) => s.id === selectedItem.stepId);
    if (!selectedStep) {
      // TODO: should handle error
      return null;
    }
    if (selectedItem?.type === "step") {
      return <StepConfiguration step={selectedStep} />;
    } else if (selectedItem?.type === "dialog") {
      const dialogs: any[] = selectedStep.dialogs || [];
      const selectedDialog = dialogs.find(
        (d: any) => d.id === selectedItem.dialogId
      );
      //  TODO: Return dialog component
      return null;
    }
    return null;
  };

  const setDefaultSelectedItem = (steps: Step[]) => {
    if (selectedItem.type === "step" && steps) {
      setSelectedItem({
        ...selectedItem,
        stepId: steps[0].id
      });
    }
  };
  
  useEffect(() => {
    if (!fetching && data?.exercise) {
      const { steps = [] } = data.exercise || {};
      setDefaultSelectedItem(steps as Step[]);
      setExercise(data.exercise);
    }
  }, [fetching, data]);
  
  let form = null;
  if (exercise) {
    form = (
      <>
        <Flex>
          <Box flex="1" pr={10}>
            <StepsAccordion steps={exercise.steps as Step[]} />
          </Box>
          <Box flex="5">{getSelectedItemComponent(exercise.steps as Step[])}</Box>
        </Flex>
      </>
    );
  }
  return <>{form || spinner}</>;
};
