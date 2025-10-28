import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

// 从环境变量获取 WalletConnect Project ID
// 在项目根目录创建 .env 文件，添加：VITE_WALLETCONNECT_PROJECT_ID=你的项目ID
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

if (!projectId) {
  console.warn('WalletConnect Project ID 未配置，请在 .env 文件中设置 VITE_WALLETCONNECT_PROJECT_ID');
}

// 配置 RainbowKit 和 Wagmi
export const config = getDefaultConfig({
  appName: 'FHE Mental Health Checker',
  projectId, // 从环境变量读取
  chains: [sepolia], // 只支持 Sepolia
  ssr: false,
});

// Sepolia 链 ID
export const SEPOLIA_CHAIN_ID = 11155111;

