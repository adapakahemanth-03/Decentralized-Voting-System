const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const resultDelaySeconds = parseInt(process.env.RESULT_DELAY_SECONDS || "120", 10);
  const ElectionFactory = await hre.ethers.getContractFactory("Election");
  const election = await ElectionFactory.deploy(resultDelaySeconds);
  await election.waitForDeployment();

  const contractAddress = await election.getAddress();
  const outputPath = path.join(__dirname, "../backend/contractAddress.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify({ address: contractAddress }, null, 2)
  );

  const configDir = path.join(__dirname, "../backend/config");
  if (fs.existsSync(configDir)) {
    fs.writeFileSync(
      path.join(configDir, "contractAddress.json"),
      JSON.stringify({ address: contractAddress }, null, 2)
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
