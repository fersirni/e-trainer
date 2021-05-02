export const getBase64 = (file: File): string | undefined => {
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      return reader.result;
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
    return;
 };
