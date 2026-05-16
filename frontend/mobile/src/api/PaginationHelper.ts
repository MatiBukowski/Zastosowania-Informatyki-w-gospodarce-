import { IPaginatedResponse } from '../context/interfaces';

export const fetchAll = async <T>(
  fetchPage: (page: number, size: number) => Promise<IPaginatedResponse<T>>,
  pageSize: number = 50
): Promise<T[]> => {
  let allItems: T[] = [];
  let currentPage = 1;
  let totalPages = 1;

  do {
    const response = await fetchPage(currentPage, pageSize);
    allItems = [...allItems, ...response.items];
    totalPages = response.pages;
    currentPage++;
  } while (currentPage <= totalPages);

  return allItems;
};

export const fetchNext = async <T>(
  fetchPage: (page: number, size: number) => Promise<IPaginatedResponse<T>>,
  currentPage: number,
  pageSize: number = 10
): Promise<IPaginatedResponse<T>> => {
  return await fetchPage(currentPage, pageSize);
};
