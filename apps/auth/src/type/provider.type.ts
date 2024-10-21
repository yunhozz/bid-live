export const PROVIDER = {
	local: 'LOCAL',
	google: 'GOOGLE',
	kakao: 'KAKAO',
	naver: 'NAVER'
} as const;

export type Provider = (typeof PROVIDER)[keyof typeof PROVIDER];
