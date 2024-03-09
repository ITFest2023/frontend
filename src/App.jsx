import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import {ToastContainer} from "react-toastify";

import Home from "./pages/Home";
import Admin from "./pages/Admin.jsx";

const queryClient = new QueryClient()

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            {/*<div style={{width: "100dvw", height: "100dvh"}}>*/}
                <Router>
                    <Routes>
                        <Route path='/' element={<Home/>}/>
                        <Route path={"/admin"} element={<Admin/>}></Route>
                    </Routes>
                </Router>
                <ToastContainer position={"bottom-right"}></ToastContainer>
            {/*</div>*/}
        </QueryClientProvider>
    )
}

export default App
