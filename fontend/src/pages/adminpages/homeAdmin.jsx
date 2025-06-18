import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Save, X } from 'lucide-react';
import ProductAdmin from './productsAdmin';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showProductForm, setShowProductForm] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Product form state
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '',
        imageUrl: '',
        featured: false
    });

    // Category form state
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        description: ''
    });

    // Initialize with sample data
    useEffect(() => {
        setCategories([
            { id: 1, name: 'Electronics', description: 'Electronic devices and accessories' },
            { id: 2, name: 'Clothing', description: 'Fashion and apparel' },
            { id: 3, name: 'Books', description: 'Books and literature' }
        ]);

        setProducts([
            { id: 1, name: 'Laptop', description: 'High-performance laptop', price: 999.99, stock: 10, categoryId: 1, imageUrl: '', featured: true },
            { id: 2, name: 'T-Shirt', description: 'Cotton t-shirt', price: 29.99, stock: 50, categoryId: 2, imageUrl: '', featured: false },
            { id: 3, name: 'Novel', description: 'Bestselling novel', price: 15.99, stock: 25, categoryId: 3, imageUrl: '', featured: false }
        ]);
    }, []);

    // Product CRUD operations
    const handleProductSubmit = (e) => {
        e.preventDefault();

        if (editingProduct) {
            setProducts(products.map(p =>
                p.id === editingProduct.id
                    ? { ...productForm, id: editingProduct.id, price: parseFloat(productForm.price), stock: parseInt(productForm.stock) }
                    : p
            ));
        } else {
            const newProduct = {
                ...productForm,
                id: Date.now(),
                price: parseFloat(productForm.price),
                stock: parseInt(productForm.stock)
            };
            setProducts([...products, newProduct]);
        }

        resetProductForm();
    };

    const resetProductForm = () => {
        setProductForm({
            name: '',
            description: '',
            price: '',
            stock: '',
            categoryId: '',
            imageUrl: '',
            featured: false
        });
        setShowProductForm(false);
        setEditingProduct(null);
    };

    const editProduct = (product) => {
        setProductForm({
            ...product,
            price: product.price.toString(),
            stock: product.stock.toString()
        });
        setEditingProduct(product);
        setShowProductForm(true);
    };

    const deleteProduct = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    // Category CRUD operations
    const handleCategorySubmit = (e) => {
        e.preventDefault();

        if (editingCategory) {
            setCategories(categories.map(c =>
                c.id === editingCategory.id
                    ? { ...categoryForm, id: editingCategory.id }
                    : c
            ));
        } else {
            const newCategory = {
                ...categoryForm,
                id: Date.now()
            };
            setCategories([...categories, newCategory]);
        }

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

    const deleteCategory = (id) => {
        const hasProducts = products.some(p => p.categoryId === id);
        if (hasProducts) {
            alert('Cannot delete category with existing products. Please remove products first.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this category?')) {
            setCategories(categories.filter(c => c.id !== id));
        }
    };

    // Filter functions
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : 'Unknown';
    };

    return (

        <ProductAdmin></ProductAdmin>


    );
};

export default AdminDashboard;