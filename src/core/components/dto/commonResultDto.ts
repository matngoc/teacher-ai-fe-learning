export class CommonResultDto<T> {
    isSuccessful: boolean | undefined;
    message: string | undefined;
    error: string | undefined;
    data: T | undefined;
}