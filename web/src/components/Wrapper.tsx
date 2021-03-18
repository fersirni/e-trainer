import React from "react";
import { Box } from "@chakra-ui/react";

interface WrapperProps {
    variant?: 'small' | 'regular' | 'big'
}

export const Wrapper: React.FC<WrapperProps> = ({ children, variant='regular'}) => {
  const v = variant === 'big'? "1200px": variant === 'regular'? "800px" : "400px";
  return (
    <Box maxW={v} w="100%" p={8} mx="auto">
      {children}
    </Box>
  );
};
