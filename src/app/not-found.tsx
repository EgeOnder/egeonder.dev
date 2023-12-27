import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4">
      <Link href="/" className="text-sm text-muted-foreground">
        {"<-"} Back to home
      </Link>
      <h1 className="text-xl font-bold">
        Not here, but there is a lot of other stuff to discover!
      </h1>
      <p className="text-sm text-muted-foreground">
        I couldn&apos;t find the place you are looking for, but there is a lot
        of other stuff to discover!
      </p>
    </div>
  );
}
