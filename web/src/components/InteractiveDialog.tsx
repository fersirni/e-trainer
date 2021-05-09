import {
  Box,
  Wrap,
  WrapItem,
  Center,
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
} from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { TiTrash } from "react-icons/ti";
import { AnswerConfiguration } from "./AnswerConfiguration";

interface InteractiveDialogProps {
  dialog?: any;
  stepId?: number;
  onDialogAdded?: any;
}

export const InteractiveDialog: React.FC<InteractiveDialogProps> = ({
  dialog,
  stepId,
  onDialogAdded,
}) => {
  const router = useRouter();
  const defaultAnswer = dialog?.answers[0] ? dialog.answers[0] : undefined;
  const [selectedAnswer, setSelectedAnswer] = useState(defaultAnswer as any);

  const emptyDialog = <>There is no dialog configured yet.</>;

  const handleSubmit = async (values: any, { setErrors }: any) => {
    console.log({ values, setErrors });
  };

  const handleChange = (answer: any) => {
    return () => {
      setSelectedAnswer(answer);
    };
  };

  const getData = (data: string) => {
    if (!data) return {};
    try {
      return JSON.parse(data) || {};
    } catch (error) {
      console.error("Failed to parse data from answer", data);
    }
  };

  const getShowName = (data: string) => {
    const { text, fileName } = getData(data) || {};
    switch (dialog?.type) {
      case "text":
        return text;
      case "iamge":
      case "audio":
      case "video":
        return fileName;
      default:
        return text;
    }
  };

  const onAnswerAddedOrUpdated = (newAnswer: any) => {
    if (!dialog) {
      return;
    }
    if (!dialog.answers){
      dialog.answers = [];
    }
    // Added but not saved to DB answer
    if (!newAnswer?.id) {
      // this fake id is to odentify tyhe new ones in case the user wants to change somenthing before saving
      if (!newAnswer?.fakeId) {
        newAnswer.fakeId = Date.now().toString();
        dialog.answers.push(newAnswer);
        const lastIndex: number = dialog.answers.length - 1;
        setSelectedAnswer(dialog.answers[lastIndex]);
      } else {
        const modifiedIndex = dialog.answers.findIndex((a: any) => (a?.fakeId === selectedAnswer?.fakeId));
        dialog.answers[modifiedIndex] = newAnswer;
        setSelectedAnswer(dialog.answers[modifiedIndex]);
      }
    } else {
      const modifiedIndex = dialog.answers.findIndex((a: any) => (a?.id === newAnswer?.id));
      dialog.answers[modifiedIndex] = newAnswer;
      setSelectedAnswer(dialog.answers[modifiedIndex]);
    }
  };

  const handleAddAnswer = () => {
    setSelectedAnswer(undefined);
  };

  const answersList = dialog.answers.map((a: any) => (
    <Box
      cursor="pointer"
      key={`row-${a.id}`}
      border="solid"
      borderColor="gray.700"
      p={2}
    >
      <Flex>
        <Box key={`answer-${a.id}`}>
          <Center ml={4}>
            <Box
              key={a.id}
              onMouseOver={(e: any) => {
                e.target.style.color = "teal";
              }}
              onMouseLeave={(e: any) => {
                e.target.style.color = "white";
              }}
              onClick={handleChange(a)}
            >
              {getShowName(a.data)}
            </Box>
          </Center>
        </Box>
        <Box ml="auto">
          <IconButton
            aria-label="Delete permanently"
            colorScheme="red"
            boxSize={6}
            size="sm"
            variant="outline"
            icon={<Icon as={TiTrash} boxSize={6} />}
          />
        </Box>
      </Flex>
    </Box>
  ));
  const data = dialog?.data;
  const form = (
    <>
      <Formik
        initialValues={{
          data,
        }}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box mt={8}>
              <Flex>
                <Box flex={1} pr={10}>
                  <Center>
                    <Heading size="lg">{getShowName(data)}</Heading>
                  </Center>
                  <Box
                    maxH={80}
                    maxW={96}
                    overflowY="auto"
                    mt={8}
                    border="solid"
                    borderColor="gray.700"
                  >
                    {answersList}
                  </Box>
                  <Center>
                    <Box mt={8} size="md">
                      <Button colorScheme="teal" onClick={handleAddAnswer} >Add Answer</Button>
                    </Box>
                  </Center>
                </Box>
                <Box flex={1} pl={10}>
                  <AnswerConfiguration
                    key={selectedAnswer?.id || `${dialog?.id}-newAnswer`}
                    type={dialog.answerType}
                    answer={selectedAnswer}
                    onAnswerAddedOrUpdated={onAnswerAddedOrUpdated}
                  />
                </Box>
              </Flex>
            </Box>
            <Wrap mt={10} spacing="30px" justify="center">
              <WrapItem>
                <Center>
                  <Button
                    mt={4}
                    type="submit"
                    isLoading={isSubmitting}
                    colorScheme="teal"
                  >
                    Save
                  </Button>
                </Center>
              </WrapItem>
              <WrapItem>
                <Center>
                  <Button
                    mt={4}
                    type="reset"
                    colorScheme="gray"
                    onClick={() => {
                      router.push("/exercises");
                    }}
                  >
                    Cancel
                  </Button>
                </Center>
              </WrapItem>
            </Wrap>
          </Form>
        )}
      </Formik>
    </>
  );
  return <>{form || emptyDialog}</>;
};
