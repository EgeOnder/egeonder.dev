import { ModeToggle } from "./mode-toggle";

const Navbar = () => {
  return (
    <nav className="flex w-full items-center justify-between py-4">
      <a href="/">
        egeonder.<strong>dev</strong>
      </a>
      <ModeToggle />
    </nav>
  );
};

export default Navbar;
