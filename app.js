function app() {
    return {
        loginForm: { email: '', password: '' },
        currentUser: null,
        items: [],
        newItem: { inv_number: '', designation: '', condition: 'Bon', location: '' },
        error: '',

        async login() {
            const res = await fetch('/api/login', {
                method: 'POST',
                body: JSON.stringify(this.loginForm)
            });
            if (res.ok) {
                const data = await res.json();
                this.currentUser = data.user;
                localStorage.setItem('token', data.token);
                this.fetchItems();
            } else {
                this.error = "Erreur de connexion";
            }
        },

        async fetchItems() {
            const res = await fetch('/api/inventory', {
                headers: { 'Authorization': localStorage.getItem('token') }
            });
            if (res.ok) this.items = await res.json();
        },

        async addItem() {
            const res = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 
                    'Authorization': localStorage.getItem('token'),
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(this.newItem)
            });
            if (res.ok) {
                alert('Enregistré !');
                this.newItem = { inv_number: '', designation: '', condition: 'Bon', location: '' };
                this.fetchItems();
            }
        },

        logout() {
            localStorage.clear();
            location.reload();
        }
    }
}
