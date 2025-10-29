import { network } from "hardhat";

async function main() {
  const conn = await network.connect();
  const contract = await conn.viem.deployContract("DocNotary");
  console.log("Contrato desplegado en:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
