import {
  Box,
  Center,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from "@chakra-ui/react";
import React from "react";
import { Step } from "../generated/graphql";

interface StepsAccordionProps {
  steps: Step[];
  handleStepOrDialogChange: any;
  handleAddStep: any;
}

const compareFunction = (first: any, second: any) => {
  // Either steps and dialogs have the order property inside so...
  const a = first?.order;
  const b = second?.order;
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  // a debe ser igual b
  return 0;
};

export const StepsAccordion: React.FC<StepsAccordionProps> = ({
  steps,
  handleStepOrDialogChange: handleStepOrDialogChange,
  handleAddStep,
}) => {
  const getDialogs = (step: any) => {
    if (!step.dialogs || step.dialogs.length === 0) {
      return (
        <Box
          key="emptyDialogs"
          pt={2}
          pb={2}
          borderBottom="solid"
          flex="1"
          textAlign="center"
          borderBottomColor="gray.700"
          color="tomato"
        >
          No dialogs found
        </Box>
      );
    }
    return step.dialogs.sort(compareFunction).map((d: any) => (
      <Box
        onClick={() => {
          handleStepOrDialogChange({
            type: "dialog",
            stepId: step.id,
            dialogId: d.id,
          });
        }}
        key={d.id}
        pt={2}
        pb={2}
        name={d.id}
        borderBottom="solid"
        flex="1"
        textAlign="left"
        borderBottomColor="gray.700"
        onMouseOver={(e: any) => {
          e.target.style.color = "teal";
        }}
        onMouseLeave={(e: any) => {
          e.target.style.color = "white";
        }}
        cursor="pointer"
      >
        {d.order} - {d.name}
      </Box>
    ));
  };

  const accordionSteps = steps.sort(compareFunction).map((s: any) => (
    <AccordionItem key={s.id}>
      <h2
        key={`${s.id}-h2`}
        onClick={() => {
          handleStepOrDialogChange({
            type: "step",
            stepId: s.id,
          });
        }}
      >
        <AccordionButton key={`${s.id}-ab`} bg="teal" color="white">
          <Box key={`${s.id}-button`} flex="1" textAlign="left">
            {`${s.order} - ${s.name}`}
          </Box>
          <AccordionIcon key={`${s.id}-icon`} />
        </AccordionButton>
      </h2>
      <AccordionPanel key={`${s.id}-dialogs`} pb={4}>
        {getDialogs(s)}
      </AccordionPanel>
    </AccordionItem>
  ));

  const addStep = (
    <AccordionItem key="new-step">
      <h2
        onClick={() => {
          handleAddStep();
        }}
        key="new-step-h2"
      >
        <AccordionButton key="add-step-button">
          <Box
            color="gray.800"
            fontWeight="semibold"
            key="add-button"
            flex="1"
            textAlign="center"
          >
            Add Step
          </Box>
        </AccordionButton>
      </h2>
    </AccordionItem>
  );

  const accordion = (
    <Box mt={8} key="steps-box">
      <Accordion
        key="steps-accordion"
        border="solid"
        borderColor="gray.700"
        maxH={96}
        overflowY="auto"
        defaultIndex={[0]}
        allowMultiple
      >
        {accordionSteps}
      </Accordion>
      <Accordion
        key="add-step-accordion"
        border="solid"
        borderColor="gray.700"
        borderRadius={10}
        bg="teal.200"
        mt={8}
      >
        {addStep}
      </Accordion>
      <Center>
        <Box key="steps-counter" pt={2} size="md">
          {accordionSteps.length} steps
        </Box>
      </Center>
      <Center>
        <Box key="dialogs-counter" pt={2} size="md">
          {steps.reduce((acc, step: any) => {
            const d = step?.dialogs || [];
            return acc + d.length;
          }, 0)}{" "}
          dialogs
        </Box>
      </Center>
    </Box>
  );

  const emptySteps = null;

  return <>{accordion || emptySteps}</>;
};
