import { create } from "zustand";

interface EditModeStore {
	editMode: boolean;
	setEditMode: (editMode: boolean) => void;
}

const useEditModeStore = create<EditModeStore>((set) => ({
	editMode: false,
	setEditMode: (mode: boolean) => set({ editMode: mode }),
}));

enum TabValue {
	Basic = "basic",
	Info = "info",
	Goods = "goods",
	Etc = "etc",
	Management = "management",
}

interface ActiveTabStore {
	activeTab: TabValue;
	setActiveTab: (tab: TabValue) => void;
}

const useActiveTabStore = create<ActiveTabStore>((set) => ({
	activeTab: TabValue.Basic,
	setActiveTab: (tab: TabValue) => set({ activeTab: tab }),
}));

export { useEditModeStore, useActiveTabStore };
