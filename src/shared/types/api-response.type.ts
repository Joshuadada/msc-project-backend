export type ApiResponse<T = void> = {
    data?: T;
    isSuccessful: boolean;
    error: string;
    responseStatus: '00' | '99' | string;
    responseCode?: any;
    statusCode: string;
    message: string;
};
