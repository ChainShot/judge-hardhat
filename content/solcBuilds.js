const { 
    TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD,
    TASK_COMPILE_SOLIDITY_LOG_COMPILATION_RESULT
} = require("hardhat/builtin-tasks/task-names");
const path = require("path");

const COMPILERS_LOCATION = path.join(__dirname, "cache", "compilers");

const COMPILER_LONG_VERSIONS = {
  "0.6.12": "v0.6.12+commit.27d51765",
  "0.7.5": "v0.7.5+commit.eb77ed08",
  "0.8.4": "v0.8.4+commit.c7e474f2"
}

subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async (args) => {
  const longVersion = COMPILER_LONG_VERSIONS[args.solcVersion];
  const compilerPath = path.join(COMPILERS_LOCATION, `solc-${longVersion}`);

  return {
    compilerPath,
    isSolcJs: false,
    version: args.solcVersion,
    longVersion
  }
});

subtask(TASK_COMPILE_SOLIDITY_LOG_COMPILATION_RESULT, async () => {});