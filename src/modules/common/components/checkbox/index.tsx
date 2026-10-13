import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import React from "react";

type CheckboxProps = {
  checked?: boolean;
  onChange?: () => void;
  label: string;
  name?: string;
  "data-testid"?: string;
};

const CheckboxWithLabel: React.FC<CheckboxProps> = ({
  checked = true,
  onChange,
  label,
  name,
  "data-testid": dataTestId,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="checkbox"
        checked={checked}
        onCheckedChange={() => onChange?.()}
        name={name}
        data-testid={dataTestId}
      />
      <Label htmlFor="checkbox" className="!transform-none !txt-medium">
        {label}
      </Label>
    </div>
  );
};

export default CheckboxWithLabel;
