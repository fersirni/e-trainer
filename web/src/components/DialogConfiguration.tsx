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
  Flex,
  Select,
} from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { toErrorMap } from "../utils/toErrorMap";
import { DefaultDialog } from "./DefaultDialog";
import { InteractiveDialog } from "./InteractiveDialog";

interface DialogConfigurationProps {
  dialog: any;
  stepId: number;
  stepType: string;
}

export const DialogConfiguration: React.FC<DialogConfigurationProps> = ({ dialog, stepId, stepType }) => {
  const toast = useToast();
  const router = useRouter();
  let dialogConfiguration = null;
  switch (stepType) {
    case 'interactive':
      dialogConfiguration = (
        <InteractiveDialog stepId={stepId} dialog={dialog} />
      );
      break;
    default:
      dialogConfiguration = (
        <DefaultDialog stepId={stepId} dialog={dialog} />
      );
      break;
  }
  return (<>{dialogConfiguration}</>);
};
