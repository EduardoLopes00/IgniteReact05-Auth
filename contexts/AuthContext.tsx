import { createContext, ReactNode, useEffect, useState } from 'react';
import { api } from '../services/apiClient';
import Router from 'next/router'
import { destroyCookie, parseCookies, setCookie } from 'nookies'

type User = {
    email: string;
    permissions: string[];
    roles: string[];
}

type SignInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    signIn: (credentials: SignInCredentials) => Promise<void>;
    signOut: () => void
    isAuthenticated: boolean;
    user: User ;
}

type AuthProviderProps = {
    children: ReactNode
}

type AuthBroadcastData = {    
    data: string;    
}


export const AuthContext = createContext({} as AuthContextData)
let authChannel: BroadcastChannel;

export function signOut() {
    destroyCookie(undefined, 'nextauth.token')    
    destroyCookie(undefined, 'nextauth.refreshToken')

    authChannel.postMessage('signOut');

    Router.push('/')
}

export function AuthProvider({children}: AuthProviderProps) {
    
    const [user, setUser] = useState<User>()
    const isAuthenticated = !!user;

    useEffect(() => {
        authChannel = new BroadcastChannel('auth')
        
        authChannel.onmessage = (message: AuthBroadcastData) => {
            console.log(message)

            switch (message.data) {
                case 'signOut': 
                    signOut();
                    authChannel.close()
                    
                    break;
                case 'signIn': 
                    window.location.replace("http://localhost:3000/dashboard");
                    break;
                default: 
                    break;
            }
        }
    }, [])

    useEffect(() => {
        const { 'nextauth.token': token } = parseCookies();

        if (token)  {
            api.get('/me').then(response => {
                const { email, permissions, roles } = response.data

                setUser({email, permissions, roles});
            }).catch(error => {
                signOut();
            })
        }
    }, [])

    async function signIn({email, password}: SignInCredentials): Promise<void> {
        try {
            const response = await api.post('sessions', {
                email,
                password
            })

            const { token, refreshToken, permissions, roles } = response.data;

            setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/' //this propertie indicates what routes the cookie will be avaiable. When the value is just a slash, it means that all the routes in the app wll have access.
            })
            
            setCookie(undefined, 'nextauth.refreshToken', refreshToken, { //the params is: context (usefull when tke cookie is filled in serverSide), cookieName, cookieValue, cookieOptions
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/' //this propertie indicates what routes the cookie will be avaiable. When the value is just a slash, it means that all the routes in the app wll have access.
            })

            setUser({
                email,
                permissions,
                roles
            })

            api.defaults.headers['Authorization'] = `Bearer ${token}`

            Router.push('/dashboard')
            authChannel.postMessage('signIn')

        } catch (err) {
            console.log(err)
        }
    }

    return (
        <AuthContext.Provider value={{signIn, signOut, isAuthenticated, user}}>
            {children}
        </AuthContext.Provider>
    )
}