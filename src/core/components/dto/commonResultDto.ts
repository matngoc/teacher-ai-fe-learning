export class CommonResultDto<T> {
    isSuccessful: boolean | undefined;
    message: string | undefined;
    data: T | undefined;
}