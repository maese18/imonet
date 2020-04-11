export default function() {
  function callback(msg) {
    console.log(msg);
  }
  utilFunction('param 1 value', callback);

  function utilFunction(param1, callbackFunction) {
    console.log(param1);

    callbackFunction('Hello World');
  }
}
