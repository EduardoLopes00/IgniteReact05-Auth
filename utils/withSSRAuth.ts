import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";

// this function aims to redirect users who are not logged to login page

export function withSSRAuth<P>(fn: GetServerSideProps<P>) {

    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
        const cookies = parseCookies(ctx); //Now i'm passing the context to the Nookies func instead of undefined.

        if (!cookies['nextauth.token']) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false
                }
            }
        }

        try {
            return await fn(ctx);
        } catch (err) {
            if (err instanceof AuthTokenError) {
                destroyCookie(ctx, 'nextauth.token')
                destroyCookie(ctx, 'nextauth.refreshToken')

                return {
                    redirect: {
                        destination: '/',
                        permanent: false
                    }
                }
            }
        }

    }
}