const FRONTMATTER_LINE_REGEX = /^[a-zA-Z_][a-zA-Z0-9_-]*\s*:\s*.+$/;

function looksLikeFrontmatterHeading(value) {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.length > 0 && lines.every((line) => FRONTMATTER_LINE_REGEX.test(line));
}

export default function stripYamlFrontmatter() {
  return (tree) => {
    if (!Array.isArray(tree.children) || tree.children.length < 2) {
      return;
    }

    const [firstNode, secondNode] = tree.children;
    if (firstNode?.type !== "thematicBreak") {
      return;
    }

    if (secondNode?.type !== "heading" || secondNode.depth !== 2 || !Array.isArray(secondNode.children)) {
      return;
    }

    const headingText = secondNode.children
      .map((child) => (typeof child.value === "string" ? child.value : ""))
      .join("");

    if (!looksLikeFrontmatterHeading(headingText)) {
      return;
    }

    tree.children.splice(0, 2);
  };
}
