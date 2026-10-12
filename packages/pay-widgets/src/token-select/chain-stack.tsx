import type { PayChain } from "./types";

export function ChainStack(props: { chains: readonly PayChain[]; logoClassName: string }) {
  const { chains, logoClassName } = props;
  return (
    <span className="grid grid-cols-2 gap-0.5">
      {chains.slice(0, 4).map((chain) => (
        <img
          key={chain.blockchain}
          src={chain.logo}
          alt=""
          className={logoClassName}
        />
      ))}
    </span>
  );
}
