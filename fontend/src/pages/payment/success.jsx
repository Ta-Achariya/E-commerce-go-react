import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';

const Success = () => {
    const [searchParams] = useSearchParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { authenticatedFetch , loading : authenLoading} = useAuth();

    useEffect(() => {
        const sessionId = searchParams.get('session_id');

        if(authenLoading){
            console.log('Auth context still loading...');
            return;
        }

        if (sessionId) {
            const createOrder = async () => {
                setLoading(true);
                try {
                    const response = await authenticatedFetch(`http://localhost:8080/api/payment/success?session_id=${sessionId}`, {
                        method: 'GET'
                    });

                    if (response.ok) {
                        const data = await response.json(); // Added await here
                        setOrder(data.order);
                    } else {
                        setError('Failed to create order');
                    }
                } catch (error) {
                    console.error('Failed to create order:', error);
                    setError('Error processing payment');
                }
                setLoading(false);
            };

            createOrder();
        } else {
            setError('No session ID found');
            setLoading(false);
        }
    }, [searchParams, authenticatedFetch]); 

    if (loading) return <div>Processing your order...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Payment Successful!</h1>
            {order && (
                <div>
                    <h2>Order Details</h2>
                    <p>Order ID: {order.id}</p>
                    <p>Total: ${order.total_amount}</p>
                    <p>Status: {order.status}</p>
                    {/* Display order items */}
                    {order.order_items && order.order_items.map(item => (
                        <div key={item.id}>
                            <p>Product ID: {item.product_id}</p>
                            <p>Quantity: {item.quantity}</p>
                            <p>Price: ${item.price}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Success;