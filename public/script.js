class BookForm extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <h1>Form</h1>
            <form id="bookForm">
                <input type="hidden" id="bookId" name="bookId">
                <div class="form-group">
                    <label for="title">Title:</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="author">Author:</label>
                    <input type="text" id="author" name="author" required>
                </div>
                <div class="form-group">
                    <label for="publishedDate">Published Date:</label>
                    <input type="date" id="publishedDate" name="publishedDate" required>
                </div>
                <div class="form-group">
                    <label for="pages">Pages:</label>
                    <input type="number" id="pages" name="pages" required>
                </div>
                <div class="form-group">
                    <label for="genre">Genre:</label>
                    <input type="text" id="genre" name="genre" required>
                </div>
                <button type="submit">Submit</button>
            </form>
        `;

        this.querySelector('#bookForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const formData = new FormData(event.target);
            const bookId = formData.get('bookId');
            const bookData = {
                title: formData.get('title'),
                author: formData.get('author'),
                publishedDate: formData.get('publishedDate'),
                pages: formData.get('pages'),
                genre: formData.get('genre')
            };

            if (bookId) {
                await fetch(`/books/${bookId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bookData)
                });
            } else {
                const response = await fetch('/books', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bookData)
                });

                const newBook = await response.json();
                document.querySelector('book-list').addBookToList(newBook);
            }

            event.target.reset();
            document.getElementById('bookId').value = '';
        });
    }

    setBook(book) {
        document.getElementById('bookId').value = book._id;
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('publishedDate').value = book.publishedDate;
        document.getElementById('pages').value = book.pages;
        document.getElementById('genre').value = book.genre;
    }
}

class BookList extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <h2>Submitted Books</h2>
            <ul id="bookList"></ul>
        `;
        this.loadBooks();

        this.addEventListener('editBook', async (event) => {
            const bookId = event.detail;
            const response = await fetch(`/books/${bookId}`);
            const book = await response.json();
            document.querySelector('book-form').setBook(book);
        });
    }

    async loadBooks() {
        const response = await fetch('/books');
        const books = await response.json();
        const bookList = this.querySelector('#bookList');
        bookList.innerHTML = '';
        books.forEach(book => this.addBookToList(book));
    }

    addBookToList(book) {
        const bookItem = document.createElement('li');
        bookItem.id = `book-${book._id}`;
        bookItem.innerHTML = `
            <div><strong>Title:</strong> ${book.title}</div>
            <div><strong>Author:</strong> ${book.author}</div>
            <div><strong>Published on:</strong> ${book.publishedDate}</div>
            <div><strong>Pages:</strong> ${book.pages}</div>
            <div><strong>Genre:</strong> ${book.genre}</div>
            <button class="btn">Delete</button>
            <button class="btn">Edit</button>
        `;
        this.querySelector('#bookList').appendChild(bookItem);

        bookItem.querySelector('button:nth-child(2)').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('editBook', { detail: book._id }));
        });
    }
}

customElements.define('book-form', BookForm);
customElements.define('book-list', BookList);
