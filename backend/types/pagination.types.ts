export interface IPaginationQuery {
  /** Page number, starting at 1. */
  page?: number;
  /** Items per page. */
  limit?: number;
}

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;
