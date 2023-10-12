import { Loader2, type LucideProps } from "lucide-react";

const Spinner = (props: LucideProps) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2 text-center">
      <Loader2 className="animate-spin" {...props} />
    </div>
  );
};

export { Spinner };
