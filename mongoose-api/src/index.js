//import mongooseAdapter from "./mongoose-adapter";
import configs from "./common/configs";
import app from "./app";
const server = app.listen(configs.server.port, () => {
  console.log(
    `Node Server started at ${configs.server.protocol}://${configs.server.host}:${configs.server.port}`
  );
});

const closeResources = () => {};
process.on("beforeExit", (code) => {
  closeResources();
  // Can make asynchronous calls
  setTimeout(() => {
    console.log(`Process will exit with code: ${code}`);
    process.exit(code);
  }, 100);
});

process.on("exit", (code) => {
  closeResources();
  // Only synchronous calls
  console.log(`Process exited with code: ${code}`);
});

process.on("SIGTERM", (signal) => {
  closeResources();
  console.log(`Process ${process.pid} received a SIGTERM signal`);
  process.exit(0);
});

process.on("SIGINT", (signal) => {
  closeResources();
  console.log(`Process ${process.pid} has been interrupted`);
  process.exit(0);
});
