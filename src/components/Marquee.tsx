type Props = {
  items: string[];
  fast?: boolean;
  className?: string;
  separator?: string;
};

export default function Marquee({ items, fast, className = '', separator = '///' }: Props) {
  const row = [...items, ...items];
  return (
    <div className={`overflow-hidden mask-fade-x ${className}`}>
      <div
        className={`flex w-max ${fast ? 'animate-marquee-fast' : 'animate-marquee'}`}
        aria-hidden="true"
      >
        {row.map((item, i) => (
          <span key={i} className="flex items-center whitespace-nowrap">
            <span className="px-5">{item}</span>
            <span className="accent-text px-1 opacity-60">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
