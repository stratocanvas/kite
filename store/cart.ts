import { create } from 'zustand';
import { AddCart, UpdateCart, DeleteCart, GetCart } from '../app/api/auth/booth/buttons/actions'; // actions.ts에서 함수들을 import

interface CartItem {
    product: any; // 상품 객체
    optionName: string; // 옵션 이름
    optionId: string; // 옵션 ID를 추가합니다.
    quantity: number;
    price: number;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    increaseQuantity: (productId: string, optionId: string) => void;
    decreaseQuantity: (productId: string, optionId: string) => void;
    removeItem: (productId: string, optionId: string) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    fetchCart: async (boothId: string) => {
        const cartItems = await GetCart(boothId);
        set(() => ({ items: cartItems }));
    },

    addItem: async (newItem) => set((state) => {
        const existingItemIndex = state.items.findIndex(item =>
            item.product._id === newItem.product._id &&
            item.optionId === newItem.optionId);

        if (existingItemIndex >= 0) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
                ...updatedItems[existingItemIndex],
                quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
            };
            // 데이터베이스에 수량 업데이트
            UpdateCart(updatedItems[existingItemIndex].product._id, updatedItems[existingItemIndex].optionId, updatedItems[existingItemIndex].quantity);
            return { items: updatedItems };
        } else {
            // 데이터베이스에 새 항목 추가
            AddCart(newItem.product._id, newItem.optionId, newItem.quantity);
            return { items: [...state.items, newItem] };
        }
    }),

    increaseQuantity: async (productId, optionId) => set((state) => {
        const itemIndex = state.items.findIndex(item => item.product._id === productId && item.optionId === optionId);
        if (itemIndex >= 0) {
            const updatedItems = [...state.items];
            updatedItems[itemIndex].quantity += 1;
            // 데이터베이스에 수량 업데이트
            UpdateCart(productId, optionId, updatedItems[itemIndex].quantity);
            return { items: updatedItems };
        }
    }),
    decreaseQuantity: async (productId, optionId) => set((state) => {
        const itemIndex = state.items.findIndex(item => item.product._id === productId && item.optionId === optionId && item.quantity > 1);
        if (itemIndex >= 0) {
            const updatedItems = [...state.items];
            updatedItems[itemIndex].quantity -= 1;
            // 데이터베이스에 수량 업데이트
            UpdateCart(productId, optionId, updatedItems[itemIndex].quantity);
            return { items: updatedItems };
        }
    }),
    removeItem: async (productId, optionId) => set((state) => {
        const updatedItems = state.items.filter(item => !(item.product._id === productId && item.optionId === optionId));
        // 데이터베이스에서 항목 제거
        DeleteCart(productId, optionId);
        return { items: updatedItems };
    }),
}));
export default useCartStore;