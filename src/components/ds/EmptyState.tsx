import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  image?: string;
  title: string;
  description: string;
  children?: ReactNode;
}

const EmptyState = ({ icon: Icon, image, title, description, children }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      {image && (
        <img
          src={image}
          alt={title}
          className="h-24 w-24 object-contain drop-shadow-[0_0_20px_hsl(142_71%_45%/0.3)]"
        />
      )}
      {Icon && !image && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Icon className="h-8 w-8 text-primary" />
        </div>
      )}
      <div>
        <h2 className="font-display text-title-lg">{title}</h2>
        <p className="mt-2 text-description text-muted-foreground max-w-xs mx-auto">{description}</p>
      </div>
      {children && <div className="flex w-full max-w-xs flex-col gap-3">{children}</div>}
    </div>
  );
};

export default EmptyState;
