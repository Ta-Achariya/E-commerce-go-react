import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Button } from "../components/ui/button"
import { ShoppingCart } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null); //state for showing error
  const [successMessage, setSuccessMessage] = useState(null); //for render after add to cart success


  const [categories, setCategories] = useState([])

  const [selectedCategory, setSelectedCategory] = useState(null)

  const [filteredProducts, setFilterProducts] = useState([])


  const { authenticatedFetch, isAuthenticated } = useAuth();





  useEffect(() => {
    fetch("http://localhost:8080/product")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err)
        setLoading(false)
      })
  }, [])

  /*-----------------fetch category----------*/

  useEffect(() => {
    fetch("http://localhost:8080/category")
      .then((res) => {
        return res.json()
      })
      .then((data) => {
        setCategories(data)
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err)
      })
  }, [])

  useEffect(() => {
    if (selectedCategory === null) {
      setFilterProducts(products)
    } else {
      const filterprod = products.filter(product =>
        product.category.ID === selectedCategory
      )
      setFilterProducts(filterprod)
    }
  }, [products, selectedCategory])



  const handleAddToCart = async (product_id) => {
    setError(null); // Clear previous errors
    if (!isAuthenticated) {
      setError('Please log in before you add items to your cart.');
      return;
    }

    try {
      const response = await authenticatedFetch('http://localhost:8080/api/cart/item', {
        method: 'POST',
        body: JSON.stringify({ quantity: 1, product_id: product_id }),
      });

      if (response.ok) {
        console.log('Product added to cart successfully!');
        setSuccessMessage('Product added to cart successfully!');
        // Clear the success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);




      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Failed to add item to cart.';
        setError(errorMessage);
        console.error('Add to cart failed:', errorMessage);
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      setError('An error occurred while adding to cart. Please try again.');
    }
  };



  if (loading) {
    return <p className="text-center mt-8">Loading products...</p>
  }


  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/*<h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Our Products</h2> */}

      {/* --- Category Filters --- */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center">
        <Button
          key="all"
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className="px-6 py-2 rounded-lg text-lg"
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category.ID}
            variant={selectedCategory === category.ID ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.ID)}
            className="px-6 py-2 rounded-lg text-lg"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* --- Error Display --- */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline ml-2">{successMessage}</span>
        </div>
      )}

      {/* --- Product Grid --- */}
      {filteredProducts.length === 0 && !loading ? (
        <p className="text-center text-xl text-gray-600 mt-12">No products available in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {filteredProducts.map((product) => (
            <div key={product.ID} className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <Link to={product.href} className="block"> {/* Added block to Link for proper layout */}
                <div className="aspect-square w-full bg-gray-100 overflow-hidden rounded-t-lg">
                  <img
                    alt={product.name}
                    src={product.images?.[0] || product.image || 'https://via.placeholder.com/400'}
                    className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{product.description}</p>
                </div>
              </Link>

              {/* Price and Add to Cart button*/}
              <div className="p-4 pt-0 flex items-center justify-between border-t border-gray-100">
                <p className="text-xl font-bold text-gray-900">฿{product.price}</p>
                <Button
                  onClick={() => handleAddToCart(product.ID)}
                  className="flex items-center gap-2 px-4 py-2 text-sm"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products
