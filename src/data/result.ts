export default class Result<T>
{
    success : boolean;
    data : T | null;
    errorMessage: string;

    constructor(success : boolean, data : T | null = null, errorMessage : string = "")
    {
        this.success = success;
        this.data = data;
        this.errorMessage = errorMessage;
    }
}