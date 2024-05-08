"use server";
import { createClient } from "@/utils/supabase/server";
const supabase = createClient();

export async function GetUser() {
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();
	return user?.id;
}

export async function AddCart(
	productId: string,
	optionId: string,
	quantity: number,
) {
	const user = await GetUser();
	const { data: cart, error: cartError } = await supabase.from("cart").insert([
		{
			users_id: user,
			product_id: productId,
			option_id: optionId,
			quantity: quantity,
		},
	]);
}

export async function GetCart() {
	const user = await GetUser();
	const { data: cart, error: cartError } = await supabase
		.from("cart")
		.select(`
            quantity,
            product_id,
            option_id,
            product(
                name,
                booth(
					booth_id,
                    name,
                    locations,
					event(event_id, name),
					date
                )
            ),
            p_option(
                name,
                price
            )
        `)
		.eq("users_id", user);

	if (cartError) {
		return [];
	}
	return cart.map((item) => ({
		...item,
		productName: item.product.name,
		optionName: item.p_option.name,
		price: item.p_option.price,
		boothName: item.product.booth.name,
		boothLocation: item.product.booth.locations,
		boothId: item.product.booth.booth_id,
		eventName: item.product.booth.event.name,
		eventId: item.product.booth.event.event_id,
		date: item.product.booth.date,
	}));
}

export async function AddOrUpdateCart(
	productId: string,
	optionId: string,
	quantity: number,
) {
	const user = await GetUser();
	// Check if the cart item already exists
	const { data: existingCartItem, error: existingCartItemError } =
		await supabase
			.from("cart")
			.select("*")
			.eq("users_id", user)
			.eq("product_id", productId)
			.eq("option_id", optionId)
			.single();

	if (existingCartItem) {
		// If it exists, directly update its quantity to the new value
		const { data: updatedCartItem, error: updateError } = await supabase
			.from("cart")
			.update({ quantity: quantity }) // Set quantity to the new value
			.eq("users_id", user)
			.eq("product_id", productId)
			.eq("option_id", optionId);
		if (updateError) {
		}
	} else {
		// If it doesn't exist, add a new cart item
		const { data: newCartItem, error: newCartError } = await supabase
			.from("cart")
			.insert([
				{
					users_id: user,
					product_id: productId,
					option_id: optionId,
					quantity: quantity,
				},
			]);
		if (newCartError) {
		}
	}
}

export async function DeleteCart(productId: string, optionId: string) {
	const user = await GetUser();
	const { data: cart, error: cartError } = await supabase
		.from("cart")
		.delete()
		.eq("users_id", user)
		.eq("product_id", productId)
		.eq("option_id", optionId);
}

export async function GetBookmarks() {
	const supabase = createClient();
	const user = await GetUser();
	const { data: wishlist, error: wishlistError } = await supabase
	  .from("b_wishlists")
	  .select("booth_id, booth(name, locations, event(event_id, name), date)")
	  .eq("users_id", user);
	if (wishlistError) {
		return [];
	}
	if (!wishlist) {
	  return [];
	}
	return wishlist;
  }

export async function SetBookmark(boothId: string, action: boolean) {
	try {
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();
		if (userError) {

		}

		// The rest of your SetBookmark logic...
		if (action) {
			// Add bookmark
			const { error } = await supabase.from("b_wishlists").insert([
				{
					booth_id: boothId,
					users_id: user?.id,
				},
			]);
		} else {
			// Remove bookmark
			const { error } = await supabase
				.from("b_wishlists")
				.delete()
				.eq("users_id", user?.id)
				.eq("booth_id", boothId);
		}
	} catch (error) {

	}
}
