
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";



const Checkout = () => {
  const [loading,setLoading] = useState(false)
  const {authenticatedFetch } = useAuth()



  const handleCheckout = async () => {
    setLoading(true)

    const res = await authenticatedFetch("http://localhost:8080/api/checkout", {
      method: "POST",
    });

    /*console.log(email + " " + password)*/

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error:", errorData);
      alert(`Error: ${errorData.error}`);
      setLoading(false)
      return;
    }

    const data = await res.json();
    console.log(data)

    if (data?.checkout_url) {
      window.location.href = data.checkout_url;
      
    } else {
      alert("Error: Cannot redirect to Stripe");
    }

    setLoading(false)
  };

  return (
    <div>
      <h2>Checkout</h2>
      <button className="bg-sky-200" onClick={handleCheckout} disabled={loading}>{loading? "Processing" : "Pay with Stripe"}</button>
    </div>
  );
};

export default Checkout