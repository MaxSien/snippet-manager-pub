export interface Snippet {
    id: number;
    title: string;
    command: string;
    category: string;
    description?: string;
    created_at?: string;
}

export interface CreateSnippetDTO {
    title: string;
    command: string;
    category: string;
    description?: string;
}