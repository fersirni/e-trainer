import {
  Box,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
  Wrap,
  WrapItem,
  Center,
  Button,
  useToast,
  Spinner,
  Flex,
  Select,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Heading,
} from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
import { useRouter } from "next/router";
import React from "react";
import {
  Exercise,
  useExerciseQuery,
  useUpdateExerciseMutation,
} from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";

interface StepsAccordionProps {
  exerciseId: number;
}

export const StepsAccordion: React.FC<StepsAccordionProps> = ({
  exerciseId,
}) => {
  const toast = useToast();
  const router = useRouter();

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

  let accordion = null;
  accordion = (
    <>
      <Box maxW={40}>
        <Center>
        <Heading pb={4} size="md">
          Steps
        </Heading>
        </Center>
        <Accordion defaultIndex={[0]} allowMultiple>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Section 1 title
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Section 2 title
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
    </>
  );
  return <>{accordion || spinner}</>;
};
