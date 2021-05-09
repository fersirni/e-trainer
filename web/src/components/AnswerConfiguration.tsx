import {
  Box,
  Input,
  Textarea,
  Wrap,
  WrapItem,
  Center,
  Button,
  Switch,
  Heading,
} from "@chakra-ui/react";

import React, { useEffect, useState } from "react";
import { getBase64 } from "../utils/getBase64";

interface AnswerConfigurationProps {
  answer?: any;
  type?: string;
  onAnswerAddedOrUpdated?: any;
}

export const AnswerConfiguration: React.FC<AnswerConfigurationProps> = ({
  answer,
  type = "text",
  onAnswerAddedOrUpdated,
}) => {
  const [isCorrect, setIsCorrect] = useState(
    (answer?.isCorrect || false) as boolean
  );
  const [dataTextValue, setDataTextValue] = useState("" as string);
  const [dataFileValue, setDataFileValue] = useState(
    undefined as File | undefined
  );
  const handleIsCorrectChange = () => {
    setIsCorrect(!isCorrect);
  };
  const handleDataTextChange = (event: any) => {
    setDataTextValue(event.target.value);
  };
  const handleDataFileChange = (event: any) => {
    setDataFileValue(event.target.files[0]);
  };
  const handleSubmit = async () => {
    const file: string = getBase64(dataFileValue) || "";
    const fileName = dataFileValue?.name;
    const data = JSON.stringify({
      text: dataTextValue,
      file,
      fileName,
    });
    const callbackAnswer = {
      ...answer,
      data,
      isCorrect,
    };
    onAnswerAddedOrUpdated(callbackAnswer);
  };

  let data = answer?.data;
  try {
    if (data) {
      data = JSON.parse(data);
    }
  } catch (error) {
    console.error("Data could not be parse to json:", data);
  }
  const { text, fileName } = data || {};
  useEffect(() => {
    setDataTextValue(text);
  }, []);

  const fileTypes = ["image", "audio", "video"];
  const form = (
    <>
      <Heading size="md">{answer ? "Answer" : "New Answer"}</Heading>
      <Box mt={8}>
        {type === "text" ? (
          <Box>
            <Textarea
              id="dataText"
              name="dataText"
              value={dataTextValue}
              placeholder="Insert the text here..."
              variant="flushed"
              onChange={handleDataTextChange}
            />
          </Box>
        ) : fileTypes.includes(type) ? (
          <Box>
            <Input
              mt={4}
              mb={2}
              id="dataFile"
              type="file"
              placeholder="Load a new file..."
              variant="flushed"
              onChange={handleDataFileChange}
            />
            {fileName ? (
              <Center backgroundColor="teal" borderRadius={6}>
                {fileName} saved
              </Center>
            ) : (
              <Center color="tomato">No file saved yet</Center>
            )}
          </Box>
        ) : (
          <Center borderRadius={6} bgColor="tomato" m={8}>
            <Box>Not implemented yet </Box>
          </Center>
        )}
      </Box>
      <Box mt={8}>
        <Box>
          Is correct
          <Switch
            ml={4}
            key={answer?.id || `new`}
            id="isCorrect"
            onChange={handleIsCorrectChange}
            checked={isCorrect}
            defaultChecked={isCorrect}
            colorScheme="teal"
          />
        </Box>
      </Box>
      <Wrap mt={4} spacing="30px" justify="center">
        <WrapItem>
          <Center>
            <Button mt={4} colorScheme="teal" onClick={handleSubmit}>
              {answer ? "Update" : "Add"}
            </Button>
          </Center>
        </WrapItem>
      </Wrap>
    </>
  );
  return <>{form}</>;
};
