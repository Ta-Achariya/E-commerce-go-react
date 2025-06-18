import { BrowserRouter, Routes, Route } from "react-router"

import Layout from "../layouts/Layout"
import Product from "../pages/Product"
import Cart from "../pages/Cart"
import Checkout from "../pages/Checkout"
import Register from "../pages/Register"
import Login from "../pages/Login"

import LayoutAdmin from "../layouts/LayoutAdmin"
import ProductAdmin from "../pages/adminpages/productsAdmin"
import HomeAdmin from "../pages/adminpages/homeAdmin"
import CategoryAdmin from "../pages/adminpages/categoryAdmin"
import Success from "../pages/payment/success"

const AppRoutes = () => {

    return (
        <BrowserRouter>
            <Routes>
                {/*pulic */}
                <Route element={<Layout />}>
                    <Route path="/" element={<Product />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="register" element={<Register />} />
                    <Route path="login" element={<Login />} />
                    <Route path="success" element={<Success />} />
                </Route>




                {/*private*/}
                <Route path="admin" element={<LayoutAdmin />}>
                    <Route index element={<HomeAdmin/>}/>
                    <Route path="category" element={<CategoryAdmin/>} />
                    <Route path="product" element={<ProductAdmin/>} />
                </Route>

                {/*
                <Route path="admin" element={<HomeAdmin/>}/>
                <Route path="category" element={<CategoryAdmin/>} />
                <Route path="product" element={<ProductAdmin/>} />
                */}
                


            </Routes>





        </BrowserRouter>
    )
}
export default AppRoutes