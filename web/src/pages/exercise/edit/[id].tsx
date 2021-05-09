import React from "react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { NextPage } from "next";
import { Wrapper } from "../../../components/Wrapper";
import { AdminBar } from "../../../components/AdminBar";
import { useRouter } from "next/router";
import { useIsAuth } from "../../../utils/useIsAuth";
import { Tabs, Tab, TabList, TabPanel, TabPanels, Icon } from "@chakra-ui/react";
import { ExerciseConfiguration } from "../../../components/ExerciseConfiguration";
import { TiCogOutline, TiEyeOutline, TiThListOutline } from "react-icons/ti";
import { StepsConfiguration } from "../../../components/StepsConfiguration";
import { ExercisePreview } from "../../../components/ExercisePreview";

const EditCategory: NextPage = () => {
  useIsAuth();
  const router = useRouter();
  const { id } = router.query || {};
  const exerciseId: number = id
    ? typeof id === "string"
      ? parseInt(id)
      : -1
    : -1;

  return (
    <>
      <AdminBar goBack="exercises" />
      <Wrapper variant="big">
        <Tabs isFitted colorScheme="teal" isLazy>
          <TabList mb="1em">
            <Tab>Configuration <Icon ml={4} as={TiCogOutline} boxSize={4} /></Tab>
            <Tab>Steps and Dialogs <Icon ml={4} as={TiThListOutline} boxSize={4} /></Tab>
            <Tab>Preview <Icon ml={4} as={TiEyeOutline} boxSize={4} /></Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <ExerciseConfiguration exerciseId={exerciseId} />
            </TabPanel>
            <TabPanel>
              <StepsConfiguration exerciseId={exerciseId} />
            </TabPanel>
            <TabPanel>
              <ExercisePreview exerciseId={exerciseId} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Wrapper>
    </>
  );
};

export default withUrqlClient(createUrqlClient)(EditCategory as any);
