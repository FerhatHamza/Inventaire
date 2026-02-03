// app.js
function app() {
    return {
        loading: false,
        error: '',
        currentUser: null,
        items: [],
        showProfile: false,
        loginForm: { email: '', password: '' },
        passForm: { new: '' },
        newItem: { inv_number: '', designation: '', condition: 'Bon', location: '', category: 'Informatique', observations: '' },

        async init() {
            const token = localStorage.getItem('epsp_token');
            const user = localStorage.getItem('epsp_user');
            if (token && user) {
                this.currentUser = JSON.parse(user);
                await this.fetchItems();
            }
        },

        async login() {
            this.loading = true; this.error = '';
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.loginForm)
                });
                if (res.ok) {
                    const data = await res.json();
                    this.currentUser = data.user;
                    localStorage.setItem('epsp_token', data.token);
                    localStorage.setItem('epsp_user', JSON.stringify(data.user));
                    await this.fetchItems();
                } else {
                    const err = await res.json();
                    this.error = err.error || "Erreur de connexion";
                }
            } catch(e) { this.error = "Erreur réseau"; }
            this.loading = false;
        },

        async fetchItems() {
            try {
                const res = await fetch('/api/inventory', {
                    headers: { 'Authorization': localStorage.getItem('epsp_token') }
                });
                if (res.status === 401 || res.status === 403) this.logout();
                if (res.ok) this.items = await res.json();
            } catch(e) { console.error(e); }
        },

        async addItem() {
            if(!this.newItem.inv_number || !this.newItem.designation) return alert('Champs manquants');
            
            const res = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 
                    'Authorization': localStorage.getItem('epsp_token'),
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(this.newItem)
            });
            if (res.ok) {
                this.newItem.inv_number = ''; 
                this.newItem.designation = '';
                this.newItem.observations = '';
                this.fetchItems();
            }
        },

        async changePassword() {
            if(this.passForm.new.length < 4) return alert('Trop court');
            const res = await fetch('/api/password', {
                method: 'POST',
                headers: { 'Authorization': localStorage.getItem('epsp_token'), 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword: this.passForm.new })
            });
            if(res.ok) { alert('Mot de passe changé !'); this.showProfile = false; }
        },

        logout() {
            fetch('/api/logout', { headers: { 'Authorization': localStorage.getItem('epsp_token') }});
            localStorage.clear();
            this.currentUser = null;
            this.items = [];
            this.loginForm = { email: '', password: '' };
        }
    }
}
