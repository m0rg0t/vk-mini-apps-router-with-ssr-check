export const getHrefWithoutHash = () => {
  if (typeof window === 'undefined') return '';
  const url = window.location.href;
  const hashIndex = url.indexOf('#');
  return hashIndex === -1 ? url : url.slice(0, hashIndex);
};
