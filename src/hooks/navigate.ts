export function navigate(path: string) {
  if (typeof window === "undefined") return;
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = path;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
