export const buildQuery = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== "" && value !== null)
  ).toString();
  return qs ? `?${qs}` : "";
};
