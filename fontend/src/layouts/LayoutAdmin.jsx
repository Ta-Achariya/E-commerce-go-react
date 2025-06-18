import { useState } from "react"
import { Outlet, useNavigate ,useLocation } from "react-router"



const LayoutAdmin = () => {
    //const [activeTab, setActiveTab] = useState('');

    const location = useLocation()
    const navigate = useNavigate()

    const currentPath = location.pathname

    const Menuhandler = (e) => {
        //setActiveTab(e.target.value)
        //navigate(`/${e.target.value}`)
        console.log(e.target.value)
    }



    return (
        <div className="min-h-screen bg-gray-50">

            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <h1 className="text-3xl font-bold text-gray-900"><a href="/admin">Admin Dashboard</a></h1>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => navigate("/admin/product")}
                                className={`px-4 py-2 rounded-lg font-medium ${currentPath === '/admin/product'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Products
                            </button>
                            <button
                                onClick={() => navigate("/admin/category")}
                                className={`px-4 py-2 rounded-lg font-medium ${currentPath === '/admin/category'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Categories
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Outlet></Outlet>


        </div>
    )

}

export default LayoutAdmin