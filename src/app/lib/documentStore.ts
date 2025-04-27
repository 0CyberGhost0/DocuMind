// Create a singleton to store PDF content
export class DocumentStore {
  private static instance: DocumentStore;
  private content: string = '';

  private constructor() {}

  static getInstance() {
    if (!DocumentStore.instance) {
      DocumentStore.instance = new DocumentStore();
    }
    return DocumentStore.instance;
  }

  setContent(content: string) {
    this.content = content;
  }

  getContent() {
    return this.content;
  }
} 