import React from "react";
import { Button } from "@chakra-ui/react";
import Router from "next/router";

interface GoBackButtonProps {
    route?: string
}

export const GoBackButton: React.FC<GoBackButtonProps> = ({ route=''}) => {
  return (
    <Button onClick={() => {
        Router.replace(`/${route}`);
    }}>
      Back
    </Button>
  );
};
