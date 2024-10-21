import { CookieOptions, Request, Response } from 'express';
import * as process from 'node:process';

const cookieOptions: CookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'lax'
};

export const setCookie = async (
	res: Response,
	name: string,
	value: string,
	options?: CookieOptions
) => res.cookie(name, value, { ...cookieOptions, ...options });

export const getCookie = async (req: Request, name: string): Promise<string | undefined> =>
	req.cookies?.[name];

export const removeCookie = async (res: Response, name: string, options?: CookieOptions) =>
	res.clearCookie(name, { ...cookieOptions, ...options });
