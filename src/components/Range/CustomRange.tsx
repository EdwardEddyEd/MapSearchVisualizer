import { useState } from "react";

type CustomRangeProps = {
  steps: {
    label: string;
    value: number;
  }[];
  onChange: (value: number) => void;
};

export function CustomRange(props: CustomRangeProps) {
  const [index, setIndex] = useState<number>(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIndex(Number(e.target.value));
    props.onChange(props.steps[Number(e.target.value)].value);
  };

  return (
    <div className="w-full max-w-xs">
      <input
        type="range"
        min="0"
        max={props.steps.length - 1}
        value={index}
        step="1"
        className="range w-64 [--range-thumb:white]"
        onChange={handleChange}
      />
      <div className="flex justify-between px-2.5 mt-0.5 text-xs">
        {props.steps.map((step, i) => (
          <div
            key={`custom-range-tick-${i}-${step.label}`}
            className="flex flex-col justify-center items-center"
          >
            <span key={`custom-range-tick-${i}-${step.label}`}>|</span>
            <span key={`custom-range-tick-${i}-${step.label}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
