import { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


export default function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authenticatedFetch, isAuthenticated } = useAuth();

    // Fetch cart data from API
    useEffect(() => {
        const fetchCart = async () => {
            if (!isAuthenticated) {
                setError('Please login to view your cart');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await authenticatedFetch('http://localhost:8080/api/cart');

                if (!response.ok) {
                    if (response.status === 404) {
                        // Cart not found - show empty cart
                        setCartItems([]);
                    } else {
                        throw new Error(`HTTP error! status: ฿{response.status}`);
                    }
                } else {

                    const cartData = await response.json();
                    console.log(cartData)

                    // Transform API data to match component structure
                    const transformedItems = cartData.CartItems?.map(item => ({
                        id: item.ID,
                        name: item.Product.name,
                        price: item.Product.price,
                        quantity: item.Quantity,
                        image: item.Product.ImageURL || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&crop=center",
                    })) || [];

                    setCartItems(transformedItems);
                    console.log(cartItems)

                }
            } catch (err) {
                console.error('Error fetching cart:', err);
                setError(err.message || 'Failed to load cart');
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [authenticatedFetch, isAuthenticated]);

    const updateQuantity = async (id, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            // Optimistically update UI
            setCartItems(items =>
                items.map(item =>
                    item.id === id ? { ...item, quantity: newQuantity } : item
                )
            );

            // TODO: Make API call to update quantity
            //const response = await authenticatedFetch(`http://localhost:8080/api/cart/updatequantity`, {
            //   method: 'PUT',
            //   body: JSON.stringify({ item_id: id, quantity: newQuantity })
            // });

        } catch (error) {
            console.error('Error updating quantity:', error);
            // Revert optimistic update on error
            // You might want to refresh the cart or show an error message
        }
    };

    const removeItem = async (id) => {
        try {
            // Optimistically update UI
            setCartItems(items => items.filter(item => item.id !== id));

            // TODO: Make API call to remove item
            // await authenticatedFetch(`http://localhost:8080/api/cart/removeitem`, {
            //   method: 'DELETE',
            //   body: JSON.stringify({ item_id: id })
            // });

        } catch (error) {
            console.error('Error removing item:', error);
            // Revert optimistic update on error
            // You might want to refresh the cart or show an error message
        }
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal;


    const handleCheckout = async () => {
        try {
            const response = await authenticatedFetch('http://localhost:8080/api/checkout', {
                method: 'POST'
            });

            if (response.ok) {
                const data = await response.json();
                window.location.href = data.checkout_url;
            }
        } catch (error) {
            console.error('Checkout error:', error);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your cart...</p>
                </div>
            </div>
        );
    }



    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Cart</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                    {/* Cart Items */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                            </div>

                            {cartItems.length === 0 ? (
                                <div className="px-6 py-12 text-center">
                                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                                    <p className="text-gray-500">Add some items to get started!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="p-6">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                                                        {item.name}
                                                    </h3>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
                                                            >
                                                                <Minus className="w-4 h-4 text-gray-600" />
                                                            </button>
                                                            <span className="text-lg font-medium text-gray-900 min-w-[2rem] text-center">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
                                                            >
                                                                <Plus className="w-4 h-4 text-gray-600" />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center space-x-4">
                                                            <p className="text-xl font-semibold text-gray-900">
                                                                ฿{(item.price * item.quantity).toFixed(2)}
                                                            </p>
                                                            <button
                                                                onClick={() => removeItem(item.id)}
                                                                className="text-red-500 hover:text-red-700 transition-colors p-1"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-5 mt-8 lg:mt-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-8">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex justify-between text-base">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-gray-900">฿{subtotal.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between text-base">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="text-gray-900">
                                        Free
                                    </span>
                                </div>




                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between text-xl font-semibold">
                                        <span className="text-gray-900">Total</span>
                                        <span className="text-gray-900">฿{total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button onClick={handleCheckout} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 mt-6">
                                    <CreditCard className="w-5 h-5" />
                                    <span>Proceed to Checkout</span>
                                </button>

                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
}