export const Provider = {
	local: 'LOCAL',
	google: 'GOOGLE',
	kakao: 'KAKAO',
	naver: 'NAVER'
} as const;

export type TProvider = (typeof Provider)[keyof typeof Provider];
