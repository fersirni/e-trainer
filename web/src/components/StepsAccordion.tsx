import {
  Box,
  Center,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Heading,
  Button,
  Flex,
} from "@chakra-ui/react";
import React from "react";
import { Step } from "../generated/graphql";

interface StepsAccordionProps {
  steps: Step[];
}

export const StepsAccordion: React.FC<StepsAccordionProps> = ({ steps }) => {
  const getDialogs = (step: any) => {
    if (!step.dialogs) {
      return "No dialogs found";
    }
    return step.dialogs.map((d: any) => (
      <>
        <Box
          key={d.id}
          pt={2}
          pb={2}
          name={d.id}
          borderBottom="solid"
          flex="1"
          textAlign="center"
          borderBottomColor="gray.700"
          onMouseOver={(e: any) => {
            e.target.style.background = "#0080807a";
          }}
          onMouseLeave={(e: any) => {
            e.target.style.background = "transparent";
          }}
        >
          {d.name}
        </Box>
      </>
    ));
  };

  const accordionSteps = steps.map((s: any) => (
    <AccordionItem key={s.id}>
      <h2>
        <AccordionButton _expanded={{ bg: "teal", color: "white" }} >
          <Box flex="1" textAlign="left">
            {s.name}
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={4}>{getDialogs(s)}</AccordionPanel>
    </AccordionItem>
  ));

  const addStep = (
    <AccordionItem key="new">
      <h2>
        <AccordionButton>
          <Box flex="1" textAlign="center">
            Add Step
          </Box>
        </AccordionButton>
      </h2>
    </AccordionItem>
  );

  const accordion = (
    <>
      <Box>
        <Center>
          <Heading pb={4} size="md">
            Steps
          </Heading>
        </Center>
        <Accordion
          border="solid"
          borderColor="gray.700"
          maxH={96}
          overflowY="auto"
          defaultIndex={[0]}
          allowMultiple
        >
          {accordionSteps}
        </Accordion>
        <Accordion border="solid"
          borderColor="gray.700">{addStep}</Accordion>
        <Center>
          <Box pt={2} size="md">
            {accordionSteps.length} steps
          </Box>
        </Center>
      </Box>
    </>
  );

  const emptySteps = null;

  return <>{accordion || emptySteps}</>;
};
