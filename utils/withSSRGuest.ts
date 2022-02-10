import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";



// This function is called by ServerSideRendering method (GetServerSideProps), which pass a function as param.
// Therefore, it will try, by default, execute the function returned above, and if it goes wrong, it execute the function sent as param.
// Is important mention that the ctx received by the returning function, comes from the SSR method who is calling it.
// The generic 'P' below, comes from the SSR either. It specify that the function returned by the method itself shall be a GetServerSideProps return.

// this function aims to redirect users who are already logged in to the dashboard page

export function withSSRGuest<P>(fn: GetServerSideProps<P>) {

    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
        const cookies = parseCookies(ctx); //Now i'm passing the context to the Nookies func instead of undefined.

        if (cookies['nextauth.token']) {
            return {
                redirect: {
                    destination: '/dashboard',
                    permanent: false
                }
            }
        }

        return await fn(ctx);

    }
}