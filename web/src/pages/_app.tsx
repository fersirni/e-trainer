import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "../theme";
import { AppProps } from "next/app";
import React from "react";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider resetCSS theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
    </>
  );
}

export default MyApp;
