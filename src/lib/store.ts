// Global store for PDF content
export const pdfStore = {
  content: '',
  setContent(text: string) {
    this.content = text;
  },
  getContent() {
    return this.content;
  }
}; 