import React from "react";

type SelectProps<T extends string | number> = {
  defaultValue: string;
  value: T;
  onChange: (value: T) => void;
  items: {
    key: string;
    value: T;
  }[];
};

export const Select = React.memo(function Select<T extends string | number>({
  defaultValue,
  value,
  onChange,
  items,
}: SelectProps<T>) {
  return (
    <select
      data-theme="light"
      className="select"
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
    >
      <option disabled={true}>{defaultValue}</option>
      {items.map(({ key, value }) => (
        <option key={`select-option-${defaultValue}-${key}`} value={value}>
          {key}
        </option>
      ))}
    </select>
  );
});
