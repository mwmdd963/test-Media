const API = 'https://test-frontend-student.vercel.app/api';

const rowsEl = document.getElementById('product-rows');

const addBtn = document.getElementById('add-btn');
const modal = document.getElementById('modal');
const cancelBtn = document.getElementById('modal-cancel');
const categorySelect = document.getElementById('category-select');
const form = document.getElementById('product-form');

const UPDATE_METHOD = 'PUT';
const modalTitle = document.getElementById('modal-title');

const cellClass =
    'flex justify-between items-center py-2 before:content-[attr(data-label)] before:text-neutral-400 md:table-cell md:px-3 md:py-3 md:before:content-none';

const searchInput = document.getElementById('search');
let allProducts = [];

let currentPage = 1;
let totalPages = 1;
let totalCount = 0;
const PAGE_SIZE = 10;
const pagerEl = document.getElementById('pager');


const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuOpen = document.getElementById('menu-open');
const menuClose = document.getElementById('menu-close');


const pageTitleEl = document.getElementById('page-title');
const VIEW_TITLES = {
    manage: 'Manage Products',
    categories: 'Categories',
};


const catRowsEl = document.getElementById('category-rows');
const catAddBtn = document.getElementById('cat-add-btn');
const catModal = document.getElementById('cat-modal');
const catForm = document.getElementById('cat-form');
const catCancel = document.getElementById('cat-cancel');
const catModalTitle = document.getElementById('cat-modal-title');
const catFormError = document.getElementById('cat-form-error');
const catStatus = document.getElementById('cat-status');
let allCategories = [];

let isModalOpen = false;
let isCatModalOpen = false;


function confirmDelete(what) {
    return Swal.fire({
        title: 'Are you sure?',
        text: `This ${what} will be deleted permanently.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#171717',
        cancelButtonColor: '#a3a3a3',
    }).then((result) => result.isConfirmed);
}

function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: message || 'Something went wrong. Please try again.',
        confirmButtonColor: '#171717',
    });
}


function showSuccess(message) {
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: message,
        showConfirmButton: false,
        timer: 2000,
    });
}



const TOKEN_KEY = 'token';

const authEl = document.getElementById('auth');
const appEl = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');
const logoutBtn = document.getElementById('logout-btn');
let appStarted = false;


loginForm.noValidate = true;
signupForm.noValidate = true;

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function showAuth() {
    appEl.classList.add('hidden');
    authEl.classList.remove('hidden');
}

function showApp() {
    authEl.classList.add('hidden');
    appEl.classList.remove('hidden');

    if (!appStarted) {
        appStarted = true;
        showView('manage');
        loadProducts(true);
        loadCategories();
    }
}

function logout() {
    localStorage.removeItem(TOKEN_KEY);
    appStarted = false;
    loginForm.reset();
    signupForm.reset();
    showAuth();
}

function switchAuthForm(toSignup) {
    loginForm.classList.toggle('hidden', toSignup);
    signupForm.classList.toggle('hidden', !toSignup);
    loginError.classList.add('hidden');
    signupError.classList.add('hidden');
}

document.getElementById('go-signup').addEventListener('click', () => switchAuthForm(true));
document.getElementById('go-login').addEventListener('click', () => switchAuthForm(false));
logoutBtn.addEventListener('click', logout);


loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    localStorage.setItem(TOKEN_KEY, 'fake-token');
    showApp();
});


signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    localStorage.setItem(TOKEN_KEY, 'fake-token');
    showApp();
});


function updateScrollLock() {
    const drawerOpen = overlay && !overlay.classList.contains('hidden');
    const locked = isModalOpen || isCatModalOpen || drawerOpen;

    document.documentElement.classList.toggle('overflow-hidden', locked);
    document.body.classList.toggle('overflow-hidden', locked);
}

function openDrawer() {
    sidebar?.classList.remove('-translate-x-full');
    overlay?.classList.remove('hidden');
    updateScrollLock();
}

function closeDrawer() {
    sidebar?.classList.add('-translate-x-full');
    overlay?.classList.add('hidden');
    updateScrollLock();
}

menuOpen?.addEventListener('click', openDrawer);
menuClose?.addEventListener('click', closeDrawer);
overlay?.addEventListener('click', closeDrawer);

function showView(name) {
    const target = document.getElementById('view-' + name);
    if (!target) return;

    document.querySelectorAll('[id^="view-"]').forEach((v) => v.classList.add('hidden'));
    target.classList.remove('hidden');

    
    if (pageTitleEl) pageTitleEl.textContent = VIEW_TITLES[name] || '';

    document.querySelectorAll('.nav-btn').forEach((link) => {
        const active = link.dataset.view === name;
        link.classList.toggle('bg-neutral-200', active);
        link.classList.toggle('text-purple-700', active);
    });
}


document.querySelectorAll('.nav-btn').forEach((link) => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showView(link.dataset.view);

        setTimeout(closeDrawer, 150);
    });
});


window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => {
    if (e.matches) closeDrawer();
});


function openModal() {
    isModalOpen = true;
    modal.classList.remove('hidden');
    void modal.offsetWidth;
    modal.classList.remove('opacity-0');
    form.classList.remove('scale-95', 'translate-y-2');
    updateScrollLock();
}

function closeModal() {
    isModalOpen = false;
    modal.classList.add('opacity-0');
    form.classList.add('scale-95', 'translate-y-2');
    updateScrollLock();


    setTimeout(() => {
        if (!isModalOpen) modal.classList.add('hidden');
    }, 200);
}


function openCatModal() {
    isCatModalOpen = true;
    catFormError.classList.add('hidden');
    catModal.classList.remove('hidden');
    void catModal.offsetWidth;
    catModal.classList.remove('opacity-0');
    catForm.classList.remove('scale-95', 'translate-y-2');
    updateScrollLock();
}

function closeCatModal() {
    isCatModalOpen = false;
    catModal.classList.add('opacity-0');
    catForm.classList.add('scale-95', 'translate-y-2');
    updateScrollLock();

    setTimeout(() => {
        if (!isCatModalOpen) catModal.classList.add('hidden');
    }, 200);
}

async function loadProducts(reset = false) {
    if (reset) currentPage = 1;

    const response = await fetch(`${API}/products?page=${currentPage}&limit=${PAGE_SIZE}`);
    const json = await response.json();

    const items = json.data.items;
    totalPages = json.data.pagination?.totalPages || 1;
    totalCount = json.data.pagination?.total || items.length;


    if (items.length === 0 && currentPage > 1) {
        currentPage--;
        return loadProducts();
    }

    allProducts = items;

    renderProducts(allProducts);
    renderPager();
}


async function reloadLoadedPages() {
    await loadProducts();
}


function openEditForm(id) {
    const p = allProducts.find((item) => String(item.id) === String(id));
    if (!p) return;

    form.reset();
    form.elements.id.value = p.id;
    form.elements.name.value = p.name ?? '';
    form.elements.description.value = p.description ?? '';
    form.elements.price.value = p.price ?? '';
    form.elements.quantity.value = p.quantity ?? '';
    form.elements.categoryId.value = p.categoryId ?? p.category?.id ?? '';

    modalTitle.textContent = 'Edit product';
    openModal();
}

function getPageList(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push('...');

    pages.push(total);
    return pages;
}

function renderPager() {
    if (!pagerEl) return;

    if (totalPages <= 1) {
        pagerEl.innerHTML = '';
        return;
    }

    const base = 'min-w-8 h-8 px-2 rounded-lg text-sm transition-all';

    let html = `<button data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}
        class="${base} bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 disabled:hover:bg-neutral-100">←</button>`;

    getPageList(currentPage, totalPages).forEach((p) => {
        if (p === '...') {
            html += `<span class="px-1 text-neutral-400">...</span>`;
        } else {
            const style =
                p === currentPage
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-200';
            html += `<button data-page="${p}" class="${base} ${style}">${p}</button>`;
        }
    });

    html += `<button data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}
        class="${base} bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 disabled:hover:bg-neutral-100">→</button>`;

    pagerEl.innerHTML = html;
}

if (pagerEl) {
    pagerEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-page]');
        if (!btn || btn.disabled) return;

        const page = Number(btn.dataset.page);
        if (page < 1 || page > totalPages || page === currentPage) return;

        currentPage = page;
        loadProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


async function loadCategories() {
    catStatus.textContent = 'Loading...';
    catStatus.classList.remove('hidden');

    try {
        const response = await fetch(API + '/categories');
        const json = await response.json();
        const categories = json.data;

        allCategories = categories;

        categorySelect.innerHTML = '<option value="">Choose a category</option>';
        categories.forEach((c) => {
            categorySelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
        });

        renderCategories(categories);

        if (categories.length === 0) {
            catStatus.textContent = 'No categories yet.';
        } else {
            catStatus.classList.add('hidden');
        }
    } catch (err) {
        catStatus.textContent = 'Failed to load categories.';
    }
}


function renderCategories(categories) {
    catRowsEl.innerHTML = '';

    categories.forEach((c) => {
        catRowsEl.innerHTML += `
      <tr class="block md:table-row border border-neutral-200 rounded-xl p-3 mb-3 md:border-0 md:border-b md:rounded-none md:p-0 md:mb-0">
        <td class="block md:table-cell md:py-3">
          <div class="text-base font-medium md:text-sm md:font-normal">${c.name}</div>
        </td>
        <td data-label="Action" class="${cellClass}">
          <div class="relative inline-block">
            <button class="menu-btn w-7 h-7 text-center rounded-full bg-neutral-100 hover:bg-neutral-200">...</button>

            <div class="menu hidden absolute right-0 mt-1 w-28 bg-white border border-neutral-200 rounded-xl shadow-lg z-10 py-1">
              <button data-action="edit" data-id="${c.id}" class="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100">Edit</button>
              <button data-action="delete" data-id="${c.id}" class="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100">Delete</button>
            </div>
          </div>
        </td>
      </tr>`;
    });
}


async function deleteCategory(id) {
    const ok = await confirmDelete('category');
    if (!ok) return;

    try {
        const response = await fetch(API + '/categories/' + id, { method: 'DELETE' });

        if (response.ok) {
            loadCategories();
            showSuccess('Category deleted');
        } else {
            const json = await response.json().catch(() => ({}));
            
            showError(json.message || 'Could not delete this category. It may still have products.');
        }
    } catch (err) {
        showError('Network error. Please check your connection.');
    }
}


function openEditCategory(id) {
    const c = allCategories.find((item) => String(item.id) === String(id));
    if (!c) return;

    catForm.reset();
    catForm.elements.id.value = c.id;
    catForm.elements.name.value = c.name ?? '';
    catModalTitle.textContent = 'Edit category';
    openCatModal();
}


catAddBtn.addEventListener('click', () => {
    catForm.reset();
    catForm.elements.id.value = '';
    catModalTitle.textContent = 'Add category';
    openCatModal();
});

catCancel.addEventListener('click', closeCatModal);

catRowsEl.addEventListener('click', (e) => {
    const menuBtn = e.target.closest('.menu-btn');

    if (menuBtn) {
        const menu = menuBtn.nextElementSibling;

        document.querySelectorAll('.menu').forEach((m) => {
            if (m !== menu) m.classList.add('hidden');
        });

        menu.classList.toggle('hidden');
        return;
    }

    const actionBtn = e.target.closest('[data-action]');

    if (actionBtn) {
        const id = actionBtn.dataset.id;
        const action = actionBtn.dataset.action;

        if (action === 'delete') deleteCategory(id);
        if (action === 'edit') openEditCategory(id);
    }
});


catForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(catForm);
    const name = (formData.get('name') || '').trim();

    if (!name) {
        catFormError.textContent = 'Category name is required.';
        catFormError.classList.remove('hidden');
        return;
    }
    catFormError.classList.add('hidden');

    const id = formData.get('id');
    const isEdit = Boolean(id);
    const url = isEdit ? API + '/categories/' + id : API + '/categories';
    const method = isEdit ? UPDATE_METHOD : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });

        const json = await response.json().catch(() => ({}));
        console.log(json);

        if (response.ok) {
            catForm.reset();
            closeCatModal();
            loadCategories();
            showSuccess(isEdit ? 'Category updated' : 'Category added');

            if (isEdit) reloadLoadedPages();
        } else {

            showError(json.message || 'Failed to save the category.');
        }
    } catch (err) {
        showError('Network error. Please check your connection.');
    }
});


async function deleteProduct(id) {
    const ok = await confirmDelete('product');
    if (!ok) return;

    try {
        const response = await fetch(API + '/products/' + id, {
            method: 'DELETE',
        });

        if (response.ok) {
            loadProducts();
            showSuccess('Product deleted');
        } else {
            const json = await response.json().catch(() => ({}));
            showError(json.message || 'Failed to delete the product.');
        }
    } catch (err) {
        showError('Network error. Please check your connection.');
    }
}

searchInput.addEventListener('input', () => {
    const text = searchInput.value.trim().toLowerCase();

    const filtered = allProducts.filter((p) =>
        p.name.toLowerCase().includes(text)
    );

    renderProducts(filtered);
});



addBtn.addEventListener('click', () => {
    form.reset();
    form.elements.id.value = '';
    modalTitle.textContent = 'Add product';
    openModal();
});

cancelBtn.addEventListener('click', () => {
    closeModal();
});



rowsEl.addEventListener('click', (e) => {
    const menuBtn = e.target.closest('.menu-btn');

    if (menuBtn) {
        const menu = menuBtn.nextElementSibling;

        document.querySelectorAll('.menu').forEach((m) => {
            if (m !== menu) m.classList.add('hidden');
        });

        menu.classList.toggle('hidden');
        return;
    }

    const actionBtn = e.target.closest('[data-action]');

    if (actionBtn) {
        const id = actionBtn.dataset.id;
        const action = actionBtn.dataset.action;

        if (action === 'delete') deleteProduct(id);
        if (action === 'edit') openEditForm(id);
    }
});


document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-btn')) {
        document.querySelectorAll('.menu').forEach((m) => m.classList.add('hidden'));
    }
});



form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const product = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: Number(formData.get('price')),
        quantity: Number(formData.get('quantity')),
        categoryId: formData.get('categoryId'),
    };


    const id = formData.get('id');
    const isEdit = Boolean(id);
    const url = isEdit ? API + '/products/' + id : API + '/products';
    const method = isEdit ? UPDATE_METHOD : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
        });

        const json = await response.json().catch(() => ({}));
        console.log(json);

        if (response.ok) {
            form.reset();
            closeModal();
            showSuccess(isEdit ? 'Product updated' : 'Product added');
            if (isEdit) reloadLoadedPages();
            else loadProducts(true);
        } else {

            showError(json.message || 'Failed to save the product.');
        }
    } catch (err) {
        showError('Network error. Please check your connection.');
    }
});


function renderProducts(products) {
    rowsEl.innerHTML = '';

    products.forEach((p) => {
        rowsEl.innerHTML += `
      <tr class="block md:table-row border border-neutral-200 rounded-xl p-3 mb-3 md:border-0 md:border-b md:rounded-none md:p-0 md:mb-0">
        <td class="block md:table-cell md:py-3">
          <div class="text-base font-medium md:text-sm md:font-normal">${p.name}</div>
        </td>
        <td data-label="Category" class="${cellClass}">${p.category.name}</td>
        <td data-label="Quantity" class="${cellClass}">${p.quantity}</td>
        <td data-label="Price" class="${cellClass}">$${p.price}</td>
        <td data-label="Created At" class="${cellClass}">${new Date(p.createdAt).toLocaleDateString()}</td>

        <td data-label="Action" class="${cellClass}">
          <div class="relative inline-block">
            <button class="menu-btn w-7 h-7 text-center rounded-full bg-neutral-100 hover:bg-neutral-200">...</button>

            <div class="menu hidden absolute right-0 mt-1 w-28 bg-white border border-neutral-200 rounded-xl shadow-lg z-10 py-1">
              <button data-action="edit" data-id="${p.id}" class="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100">Edit</button>
              <button data-action="delete" data-id="${p.id}" class="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100">Delete</button>
            </div>
          </div>
        </td>
      </tr>`;
    });
}


if (getToken()) showApp();
else showAuth();

window.addEventListener('load', () => {
    requestAnimationFrame(() => {
        document.body.style.visibility = 'visible';
        sidebar.classList.add('transition-transform');
    });
});