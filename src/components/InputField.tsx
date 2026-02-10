interface InputFieldProps {
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export function InputField({
  label,
  value,
  onChange,
  unit,
  min = 0,
  max,
  step = 1,
  placeholder
}: InputFieldProps) {
  return (
    <div className="input-field">
      <label>{label}</label>
      <div className="input-wrapper">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
        />
        <span className="unit">{unit}</span>
      </div>
    </div>
  );
}
