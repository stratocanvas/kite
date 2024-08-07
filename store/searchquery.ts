'use client'
import { create } from "zustand";

export interface BaseInfo {
  _id: string;
  name: string;
}

export interface InputItem {
  id: string;
  chainMode: boolean;
  character?: BaseInfo;
  category?: BaseInfo;
  artist?: BaseInfo;
  exhibition?: BaseInfo;
  genre?: BaseInfo;
  [key: string]: any;
}

interface QueryStore {
  queryInput: InputItem[];
  setQueryInput: React.Dispatch<React.SetStateAction<InputItem[]>>;
}

const useQueryStore = create<QueryStore>((set) => ({
  queryInput: [],
  setQueryInput: (input) =>
    set((state) => {
      const newQueryInput =
        typeof input === "function" ? input(state.queryInput) : input;
      return { queryInput: newQueryInput };
    }),
}));

export default useQueryStore;