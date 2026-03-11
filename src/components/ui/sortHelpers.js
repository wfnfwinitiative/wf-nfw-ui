import { SORT_OPTIONS } from './SortDropdown';

/**
 * Sort a list for admin tile cards. Works with search/filter result.
 * getLabel: (item) => string for name sort
 * getIdOrDate: (item) => string|number for recent/oldest (e.g. item.id or item.createdAt)
 */
export function sortList(list, sortBy, getLabel = (item) => item.name || '', getIdOrDate = (item) => item.id || 0) {
  if (!sortBy || list.length === 0) return list;
  const arr = [...list];
  switch (sortBy) {
    case SORT_OPTIONS.NAME_ASC:
      return arr.sort((a, b) => (getLabel(a) || '').localeCompare(getLabel(b) || '', undefined, { sensitivity: 'base' }));
    case SORT_OPTIONS.NAME_DESC:
      return arr.sort((a, b) => (getLabel(b) || '').localeCompare(getLabel(a) || '', undefined, { sensitivity: 'base' }));
    case SORT_OPTIONS.RECENT:
      return arr.sort((a, b) => {
        const va = getIdOrDate(a);
        const vb = getIdOrDate(b);
        return String(vb).localeCompare(String(va), undefined, { numeric: true });
      });
    case SORT_OPTIONS.OLDEST:
      return arr.sort((a, b) => {
        const va = getIdOrDate(a);
        const vb = getIdOrDate(b);
        return String(va).localeCompare(String(vb), undefined, { numeric: true });
      });
    default:
      return arr;
  }
}
