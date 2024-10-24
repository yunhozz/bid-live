import { CookieOptions, Request, Response } from 'express';
import * as process from 'node:process';

export const CookieName = {
	accessToken: 'Access-Token'
} as const;

export type TCookieName = (typeof CookieName)[keyof typeof CookieName];

const defaultOptions: CookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'lax'
};

export const setCookie = async (
	res: Response,
	name: TCookieName,
	value: string,
	options?: CookieOptions
) => res.cookie(name, value, { ...defaultOptions, ...options });

export const getCookie = async (req: Request, name: TCookieName): Promise<string | undefined> =>
	req.cookies?.[name];

export const removeCookie = async (res: Response, name: TCookieName, options?: CookieOptions) =>
	res.clearCookie(name, { ...defaultOptions, ...options });
