import clsx from "clsx";
import React from "react";
import styles from "./button.module.css";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button className={clsx(styles.button, className)} {...props}>
      {children}
    </button>
  );
}
