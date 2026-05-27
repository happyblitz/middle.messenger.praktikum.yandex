export const isEventInForm = (
  event: Event,
  form: HTMLElement | null,
): boolean => {
  return form?.contains(event.target as Node) ?? false;
};

export const isSubmitRelatedTarget = (
  event: FocusEvent,
  form: HTMLElement | null,
) => {
  const target = event.relatedTarget as HTMLElement | null;
  return target?.getAttribute("type") === "submit" && form?.contains(target);
};
