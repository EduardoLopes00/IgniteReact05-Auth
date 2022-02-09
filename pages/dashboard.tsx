import { useContext, useEffect } from "react"
import { AuthContext, signOut } from "../contexts/AuthContext"
import { api } from "../services/api";

export default function Dashboard() {
    const { user } = useContext(AuthContext);


    useEffect(() => {
            api.get('/me').then(response => {
                const { email, permissions, roles } = response.data

                console.log(email, permissions, roles)
            }).catch(error => {
                signOut();
            })
        

    }, [])

    return (
        <h1>Dashboard: {user?.email}</h1>
    )
}