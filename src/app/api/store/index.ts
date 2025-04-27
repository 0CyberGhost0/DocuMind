// Global store for PDF content
const pdfStore = {
  content: '',
  setContent(text: string) {
    this.content = text;
  },
  getContent() {
    return this.content;
  }
};

export { pdfStore }; 