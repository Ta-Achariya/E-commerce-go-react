import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Button } from "../components/ui/button"

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const [categories, setCategories] = useState([])
  
  const[selectcategory,setSelectcategory] = useState(null)
  const[filterproducts,setFilterProducts] = useState([])




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
    if(selectcategory === null){
      setFilterProducts(products)
    } else {
      const filterprod = products.filter(product => 
        product.category.ID === selectcategory
      )
      setFilterProducts(filterprod)
    }
  }, [products,selectcategory])


  if (loading) {
    return <p className="text-center mt-8">Loading products...</p>
  }





  return (
    <>
      <Button
        key="all"
        variant={selectcategory === null? "default" : "outline"}
        onClick={()=>{setSelectcategory(null)}}
      >
        All
      </Button>


      {categories.map((category) => (
        <Button 
          key={category.ID}
          variant={selectcategory === category.ID ? "default" : "outline"}
          onClick={() => {setSelectcategory(category.ID)}} 
        >
          {console.log(category.ID)}
          {category.name}
          </Button>
      ))}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">All Products</h2>

        {filterproducts.length === 0 ? (
          <p>No products available.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {filterproducts.map((product) => (
              <div key={product.ID} className="group relative">
                <img
                  alt={product.image}
                  src={product.images?.[0] || product.image}
                  className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
                />
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700">
                      <Link to={product.href}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">฿{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </>
  )
}

export default Products
