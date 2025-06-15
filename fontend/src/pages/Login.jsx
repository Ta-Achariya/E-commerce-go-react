import React ,{ useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router"




const Login = () => {

    const {login , loading} = useAuth()

    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")

    const navigate = useNavigate()

    const handlelogin = async(e) => {
        e.preventDefault()
        
        const result = await login(email,password)
        if (result.success){
            navigate("/")
            console.log(email + " " + password)
        } else {
            alert(result.error || "Login failed")
        }
    }
    



    return (
        <>
            <h1 className="text-center mt-10 text-4xl font-medium mb-5">Login</h1>
            <hr />
            <div className="flex items-center justify-center mt-10">


                <form className="w-md" onSubmit={handlelogin}>
                    <div className="mb-6">
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email address</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="john.doe@company.com" required />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="•••••••••" required />
                    </div>
                    <div className="flex items-center justify-center">
                        <button type="submit" disabled={loading} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"> {loading? "Logging in..." : "login"}</button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default Login