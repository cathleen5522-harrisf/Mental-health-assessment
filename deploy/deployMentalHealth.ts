import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployed = await deploy("FHEMentalHealthChecker", {
    from: deployer,
    log: true,
  });

  console.log(`FHEMentalHealthChecker 合约已部署到: ${deployed.address}`);
};

export default func;
func.id = "deploy_fhe_mental_health_checker";
func.tags = ["FHEMentalHealthChecker"];



