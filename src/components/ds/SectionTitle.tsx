import { ReactNode } from "react";

interface SectionTitleProps {
  children: ReactNode;
  action?: ReactNode;
}

const SectionTitle = ({ children, action }: SectionTitleProps) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold font-display">{children}</h3>
      {action}
    </div>
  );
};

export default SectionTitle;
