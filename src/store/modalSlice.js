import { writable } from "svelte/store";

export const modal_login = create_modal_login();
/*  */
export const modal_alert = create_modal_alert();
export const modal_alert_txt = writable("");
/*  */
export const modal_confirm = create_modal_confirm();
export const modal_confirm_txt = writable("");
export const modal_confirm_result = writable("");
/*  */
export const modal_apply_detail = create_modal_apply_detail();
export const modal_apply_detail_obj = writable({});
export const modal_apply_detail_result = writable("");
/*  */
export const modal_apply_cancer = create_modal_apply_cancer();
export const modal_apply_cancer_code = writable("");
export const modal_apply_cancer_result = writable("");
/*  */
export const modal_apply_cancer_admin = modal_apply_cancer_admin_cancer();
export const modal_apply_cancer_admin_reason = writable("");

function create_modal_login() {
	const { set, subscribe } = writable(false);
	const open = () => {
		set(true);
	};
	const close = () => set(false);
	return { open, close, subscribe };
}
function create_modal_alert() {
	const { set, subscribe } = writable(false);
	const open = (txt) => {
		set(true);
		modal_alert_txt.set(txt);
	};
	const close = () => set(false);
	return { open, close, subscribe };
}
function create_modal_confirm() {
	const { set, subscribe } = writable(false);
	let setTxt = "";

	const open = (txt, inSetTxt) => {
		set(true);
		modal_confirm_txt.set(txt);
		setTxt = inSetTxt;
		modal_confirm_result.set("");
	};
	const close = () => set(false);
	const check = () => {
		modal_confirm_result.set(setTxt);
		close();
	};

	return {
		subscribe,
		open,
		close,
		check,
	};
}
function create_modal_apply_detail() {
	const { set, subscribe } = writable(false);
	const open = (applyObj) => {
		modal_apply_detail_obj.set({ ...applyObj });
		modal_apply_detail_result.set("");
		set(true);
	};
	const apply = (applyObj) => {
		modal_apply_detail_obj.set({ ...applyObj });
		modal_apply_detail_result.set("apply");
	};
	const close = () => set(false);
	return { open, close, subscribe, apply };
}
function create_modal_apply_cancer() {
	const { set, subscribe } = writable(false);
	const open = (code) => {
		modal_apply_cancer_code.set(code);
		modal_apply_cancer_result.set("");
		set(true);
	};
	const cancel = () => {
		modal_apply_cancer_result.set("cancel");
		close();
	};
	const close = () => {
		set(false);
		modal_apply_cancer_code.set("");
	};
	return { open, close, cancel, subscribe };
}
function modal_apply_cancer_admin_cancer() {
	const { set, subscribe } = writable(false);
	const open = () => {
		set(true);
	};
	const cancel = () => {
		close();
	};
	const close = () => {
		set(false);
	};
	return { open, close, cancel, subscribe };
}
