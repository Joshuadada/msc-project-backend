export interface ILLMProvider {
    complete(prompt: string, model?: string): Promise<{
        text: string;
        model: string;
        rawResponse: any;
        processingTime: number;
    }>;
}