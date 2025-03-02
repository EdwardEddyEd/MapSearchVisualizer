type RangeProps = {
  value: number;
  min: number | string;
  max: number | string;
  step: number | string;
  onChange: (value: number) => void;
};

export function Range(props: RangeProps) {
  return (
    <div className="w-full max-w-xs text-black">
      <input
        type="range"
        min={props.min}
        max={props.max}
        value={props.value}
        step={props.step}
        className="range range-neutral"
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </div>
  );
}
