export default function Container({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <div className="container mx-auto max-w-screen-md">{children}</div>;
}
