import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Portal({ children }) {
  const el = useRef(document.createElement("div"));

  useEffect(() => {
    const root = document.body;
    root.appendChild(el.current);
    return () => root.removeChild(el.current);
  }, []);

  return createPortal(children, el.current);
}
