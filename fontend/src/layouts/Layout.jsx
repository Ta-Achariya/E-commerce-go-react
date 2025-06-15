import { Outlet } from "react-router"
import Nav from "../components/ui/nav"



const Layout = () => {
    return (
        <>


            <Nav></Nav>
            
            <Outlet></Outlet>
        </>
    )
}

export default Layout