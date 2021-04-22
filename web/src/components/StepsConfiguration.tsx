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
} from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { Exercise, useExerciseQuery, useUpdateExerciseMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { StepsAccordion } from "./StepsAccordion";

interface StepsConfigurationProps {
  exerciseId: number;
}

export const StepsConfiguration: React.FC<StepsConfigurationProps> = ({
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

  let form = null;
  form = (
    <>
      <StepsAccordion exerciseId={exerciseId} />
    </>
  );
  return <>{form || spinner}</>;
};
