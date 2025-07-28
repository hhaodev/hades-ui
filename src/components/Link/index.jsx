import "./index.css";
import { cn } from "../../utils";

function Link({ href, target, rel, className, children, disabled, ...rest }) {
  const isExternal =
    typeof href === "string" &&
    (href.startsWith("http") || target === "_blank");

  const finalRel = isExternal ? rel || "noopener noreferrer" : rel;

  if (disabled) {
    return (
      <span
        className={cn("link", "disabled", className)}
        aria-disabled="true"
        {...rest}
        onClick={() => undefined}
      >
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      target={target}
      rel={finalRel}
      className={cn("link", className)}
      {...rest}
    >
      {children}
    </a>
  );
}

export default Link;
