import { create } from 'zustand';

interface Option {
  _id: string;
  name: string;
  price: number;
}

interface OptionState {
    selectedOptions: { [productId: string]: Option };
    selectOption: (product: any, option: Option) => void; // product 타입을 any로 설정, 실제 프로젝트에서는 구체적인 타입을 사용하는 것이 좋습니다.
    resetOptions: () => void;
  }

const useOptionsStore = create<OptionState>((set) => ({
  selectedOptions: {},
  selectOption: (product, option) =>
    set((state) => ({
      selectedOptions: {
        ...state.selectedOptions,
        [product._id]: option, // product_id를 key로 사용
      },
    })),
  resetOptions: () => set(() => ({ selectedOptions: {} })), // Implement the reset method
}));

export default useOptionsStore;