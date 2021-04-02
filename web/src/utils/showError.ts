const NOT_AUTHENTICATED_MESSAGE = "Not authenticated";


export const showError = (error: any, toast: any, router: any) => {
  if (error) {
    console.log(error.message);
    if (error.message.includes(NOT_AUTHENTICATED_MESSAGE)) {
      router.push("/");
    }
    toast({
      title: "Ups! Something went wrong :(",
      description: error.message,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }
};
