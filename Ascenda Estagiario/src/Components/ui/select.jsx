import React from "react";
import { useI18n } from "@estagiario/Components/utils/i18n";

function collectOptions(children, options = []) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === SelectContent) {
      collectOptions(child.props.children, options);
    }
    if (child.type === SelectItem) {
      options.push({ value: child.props.value, label: child.props.children });
    }
  });
  return options;
}

export function Select({ value, onValueChange, children }) {
  const trigger = React.Children.toArray(children).find((child) => React.isValidElement(child) && child.type === SelectTrigger);
  const triggerClassName = trigger?.props?.className ?? "";
  const options = collectOptions(children);
  const { t } = useI18n();

  return (
    <select
      value={value}
      onChange={(event) => onValueChange?.(event.target.value)}
      className={`rounded-md border border-default bg-[var(--sidebar-bg)] px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 ${triggerClassName}`}
    >
      {options.length === 0 && <option value="">{t('selectPlaceholder')}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function SelectTrigger({ children }) {
  return <>{children}</>;
}

export function SelectValue() {
  return null;
}

export function SelectContent({ children }) {
  return <>{children}</>;
}

export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}

export default Select;
