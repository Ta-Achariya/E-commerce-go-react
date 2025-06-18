import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';




const CategoryAdmin = () => {

    const [products, setProducts] = useState([]);

    const [categories, setCategories] = useState([]);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null); //for edit category

    const [searchTerm, setSearchTerm] = useState('');

    const { authenticatedFetch } = useAuth()

    // Category form state
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("http://localhost:8080/category");
            const data = await res.json();
            setCategories(data);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        }
    };

    useEffect(() => {
        fetch("http://localhost:8080/product")
            .then((res) => res.json())
            .then((data) => setCategories(data))
            .catch((err) => console.error("Failed to fetch categories:", err));
    }, []);




    // Category CRUD operations

    const handleCategorySubmit = async (e) => {
        e.preventDefault();

        if (editingCategory) {
            //update category
            console.log(editingCategory)
            const response = await authenticatedFetch(`http://localhost:8080/api/admin/category/${editingCategory.ID}`, {
                method: "PUT",
                body: JSON.stringify(categoryForm)
            })
            if (!response.ok) throw new Error("Failed to update")

        } else { //create category
            const response = await authenticatedFetch("http://localhost:8080/api/admin/category", {
                method: "POST",
                body: JSON.stringify(categoryForm)
            })

            if (!response.ok) throw new Error("Failed to created")
        }
        fetchCategories()
        resetCategoryForm();
    };


    const resetCategoryForm = () => {
        setCategoryForm({
            name: '',
            description: ''
        });
        setShowCategoryForm(false);
        setEditingCategory(null);
    };

    const editCategory = (category) => {
        setCategoryForm(category);
        setEditingCategory(category);
        setShowCategoryForm(true);
    };


    const deleteCategory = async (id) => {
        console.log(id)
        const hasProducts = products.some(p => p.categoryId === id);
        if (hasProducts) {
            alert('Cannot delete category with existing products. Please remove products first.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                const response = await authenticatedFetch(`http://localhost:8080/api/admin/category/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) throw new Error("Delete failed");

                setCategories(categories.filter(c => c.ID !== id));

            } catch (error) {
                console.error("Delete failed:", error);
                alert("Error deleting category");
            }
        }

    };


    // Filter functions
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Categories Tab */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Categories Management</h2>
                    <button
                        onClick={() => setShowCategoryForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                        <Plus size={16} />
                        <span>Add Category</span>
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Categories Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCategories.map((category) => (
                                <tr key={category.ID}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {category.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {category.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {products.filter(p => p.categoryId === category.id).length}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => editCategory(category)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteCategory(category.ID)}
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



            {/* Category Form Modal */}
            {showCategoryForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingCategory ? 'Edit Category' : 'Add New Category'}
                            </h3>
                            <button
                                onClick={resetCategoryForm}
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
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>

                            <div className="flex space-x-2 pt-4">
                                <button
                                    onClick={handleCategorySubmit}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2"
                                >
                                    <Save size={16} />
                                    <span>{editingCategory ? 'Update' : 'Create'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={resetCategoryForm}
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

export default CategoryAdmin