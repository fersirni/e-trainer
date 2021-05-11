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
  showConfiguration?: any;
}

export const InteractiveDialog: React.FC<InteractiveDialogProps> = ({
  dialog,
  stepId,
  onDialogAdded,
  showConfiguration
}) => {
  const router = useRouter();
  const [answers, setAnswers] = useState((dialog?.answers || []) as any);
  const [selectedAnswer, setSelectedAnswer] = useState(answers[0] as any);

  const handleSubmit = async (values: any, { setErrors }: any) => {
    console.log({ values, setErrors });
    // delete fakeid prop
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
    let newAnswers = [...answers];
    // Added but not saved to DB answer
    if (!newAnswer?.id && !newAnswer?.fakeId) {
      // this fake id is to identify tyhe new ones in case the user wants to change somenthing before saving
      newAnswer.fakeId = Date.now().toString();
      newAnswers.push(newAnswer);
      setAnswers(newAnswers);
      const lastIndex: number = answers.length - 1;
      setSelectedAnswer(answers[lastIndex]);
    } else {
      let modifiedIndex;
      if (newAnswer?.id) {
        modifiedIndex = answers.findIndex((a: any) => a?.id === newAnswer?.id);
      } else {
        modifiedIndex = answers.findIndex(
          (a: any) => a?.fakeId === answers?.fakeId
        );
      }
      newAnswers[modifiedIndex] = newAnswer;
      setAnswers(newAnswers);
      setSelectedAnswer(answers[modifiedIndex]);
    }
  };

  const handleAddAnswer = () => {
    setSelectedAnswer(undefined);
  };

  const handleRemoveAnswer = (answer: any) => {
    return () => {
      console.log(answer);
      let index: number = 0;
      if (answer?.id) {
        console.log("entre 1");
        index = answers.findIndex((a: any) => a?.id === answer?.id);
      } else if (answer?.fakeId) {
        console.log("entre 2");
        index = answers.findIndex((a: any) => a?.fakeId === answer?.fakeId);
      } else {
        return;
      }
      console.log(index);
      const newAnswers = [...answers];
      newAnswers.splice(index, 1);
      setAnswers(newAnswers);
    };
  };

  const emptyAnswers = (
    <Center>
      <Box p={2} color="tomato">
        No answers configured yet
      </Box>
    </Center>
  );

  const answersList = answers.map((a: any) => (
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
            aria-label="Delete"
            colorScheme="red"
            boxSize={6}
            size="sm"
            variant="outline"
            icon={
              <Icon as={TiTrash} boxSize={6} onClick={handleRemoveAnswer(a)} />
            }
          />
        </Box>
      </Flex>
    </Box>
  ));
  const data = dialog?.data;
  const form = (
    <>
      <Flex>
        <Box ml="auto">
          <Button onClick={() => showConfiguration()}>Configuration</Button>
        </Box>
      </Flex>
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
                    {answers.length > 0 ? answersList : emptyAnswers}
                  </Box>
                  <Center>
                    <Box mt={8} size="md">
                      <Button colorScheme="teal" onClick={handleAddAnswer}>
                        Add Answer
                      </Button>
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
  return <>{form}</>;
};
