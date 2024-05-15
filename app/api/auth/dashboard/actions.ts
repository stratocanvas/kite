"use server";
import { createClient } from "@/utils/supabase/server";

export async function GetUser() {
	const supabase = createClient();
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
	const supabase = createClient();

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
	const supabase = createClient();

	const user = await GetUser();
	const { data: cart, error: cartError } = await supabase
		.from("cart")
		.select(`
            quantity,
            product_id,
            option_id,
			tag,
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
		tag: item.tag,
	}));
}

export async function AddOrUpdateCart(
	productId: string,
	optionId: string,
	quantity: number,
) {
	const supabase = createClient();

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
	const supabase = createClient();

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
		.select(
			"booth_id, tag, booth(name, locations, event(event_id, name), date)",
		)
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
	const supabase = createClient();

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
	} catch (error) {}
}

export async function SetBookmarkTag(tag: number, boothId: string) {
    const supabase = createClient();
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        if (userError) {
            throw new Error(userError.message);
        }
        // Update bookmark tag
        const { data, error } = await supabase
            .from("b_wishlists")
            .update({tag: tag})
            .eq("users_id", user?.id)
            .eq("booth_id", boothId)
        if (error) {
            throw new Error(error.message);
        }
    } catch (error) {
        console.error("Error setting bookmark tag:", error);
        throw error;
    }
}

export async function SetCartTag(tag: number, productId: number[]) {
    const supabase = createClient();
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        if (userError) {
            throw new Error(userError.message);
        }
        // Update bookmark tag
        const { data, error } = await supabase
            .from("cart")
            .update({tag: tag})
            .eq("users_id", user?.id)
            .in("product_id", productId)
        if (error) {
            throw new Error(error.message);
        }
    } catch (error) {
        console.error("Error setting bookmark tag:", error);
        throw error;
    }
}
