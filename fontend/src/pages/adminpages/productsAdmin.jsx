import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';




const ProductAdmin = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false)


    const [products, setProducts] = useState([]);
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const { authenticatedFetch } = useAuth()


    // Product form state
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        quantity: '',
        category_id: '',
        image: ''
    });



    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8080/product");
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("Failed to fetch products:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);


    useEffect(() => {
        fetch("http://localhost:8080/category")
            .then((res) => res.json())
            .then((data) => setCategories(data))
            .catch((err) => console.error("Failed to fetch categories:", err));
    }, []);

    // Product CRUD operations
    const handleProductSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                ...productForm,
                price: parseFloat(productForm.price),
                quantity: parseInt(productForm.quantity),
            };

            console.log(payload)

            if (editingProduct) {
                const response = await authenticatedFetch(`http://localhost:8080/api/admin/product/${editingProduct.ID}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });

                if (!response.ok) throw new Error("Failed to update");

            } else {
                const response = await authenticatedFetch('http://localhost:8080/api/admin/product', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });

                if (!response.ok) throw new Error("Failed to create");
            }

            await fetchProducts();
            resetProductForm();

        } catch (error) {
            console.error("Error saving product:", error);
            alert("Something went wrong.");
        }
    };

    const resetProductForm = () => {
        setProductForm({
            name: '',
            description: '',
            price: '',
            quantity: '',
            category_id: '',
            image: ''
        });
        setShowProductForm(false);
        setEditingProduct(null);
    };

    const editProduct = (product) => {
        setProductForm({
            ...product,
            price: product.price.toString(),
            quantity: product.quantity.toString()
        });
        setEditingProduct(product);
        setShowProductForm(true);
    };


    const deleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await authenticatedFetch(`http://localhost:8080/api/admin/product/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) throw new Error("Failed to delete");

                await fetchProducts();
            } catch (error) {
                console.error("Delete error:", error);
                alert("Error deleting product.");
            }
        }
    };



    // Filter functions
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );




    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
                    <button
                        onClick={() => setShowProductForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                        <Plus size={16} />
                        <span>Add Product</span>
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.map((product) => (
                                <tr key={product.ID}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                            <div className="text-sm text-gray-500">{product.description}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {product.category.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ฿{product.price.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {product.quantity}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => editProduct(product)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteProduct(product.ID)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* Product Form Modal */}
            {showProductForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h3>
                            <button
                                onClick={resetProductForm}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    value={productForm.description}
                                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={productForm.price}
                                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <input
                                    type="number"
                                    required
                                    value={productForm.quantity}
                                    onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    required
                                    value={productForm.category_id}
                                    onChange={(e) => setProductForm({ ...productForm, category_id: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category) => (
                                        <option key={category.ID} value={category.ID}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="url"
                                    value={productForm.image}
                                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>


                            <div className="flex space-x-2 pt-4">
                                <button
                                    onClick={handleProductSubmit}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2"
                                >
                                    <Save size={16} />
                                    <span>{editingProduct ? 'Update' : 'Create'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={resetProductForm}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductAdmin