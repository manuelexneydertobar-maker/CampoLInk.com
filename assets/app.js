document.addEventListener('DOMContentLoaded', function() {

    // =========================================================
    // 1. Lógica de Navegación y Scroll Suave
    // =========================================================

    // Manejo de redirección simple con data-go
    document.querySelectorAll('[data-go]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-go');
            if (targetPage) {
                window.location.href = targetPage;
            }
        });
    });
    
    // Smooth scroll para enlaces dentro de la misma página (#ID)
    document.querySelectorAll('.nav a, .footer a').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Resta la altura del header fijo (72px)
                    const offsetTop = targetElement.offsetTop - 72;
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                }
            }
        });
    });

    // =========================================================
    // 2. Lógica del Modal de Inicio de Sesión / Registro
    // =========================================================
    
    const loginModal = document.getElementById('login-modal');
    const openLoginBtns = document.querySelectorAll('[id="open-login-modal"]');
    const closeBtn = document.querySelector('#login-modal .close-btn');
    const showRegisterBtn = document.getElementById('show-register');
    const modalTitle = document.getElementById('modal-title');
    const registerFields = document.getElementById('register-fields');
    const loginForm = document.getElementById('login-form');

    // Utilidades de accesibilidad para el modal
    function getFocusableElements(container) {
        if (!container) return [];
        return Array.from(container.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'))
            .filter(el => !el.hasAttribute('disabled'));
    }

    let lastFocusedBeforeModal = null;
    let focusableInModal = [];
    let firstFocusable = null;
    let lastFocusable = null;

    function openModal() {
        if (!loginModal) return;
        lastFocusedBeforeModal = document.activeElement;
        // set ARIA attributes
        loginModal.style.display = 'flex';
        loginModal.setAttribute('role', 'dialog');
        loginModal.setAttribute('aria-modal', 'true');
        loginModal.setAttribute('aria-hidden', 'false');

        // enhance close button accessibility
        if (closeBtn) {
            closeBtn.setAttribute('role', 'button');
            closeBtn.setAttribute('tabindex', '0');
            closeBtn.setAttribute('aria-label', 'Cerrar ventana de inicio de sesión');
        }

        // Focus management
        focusableInModal = getFocusableElements(loginModal);
        firstFocusable = focusableInModal[0] || closeBtn;
        lastFocusable = focusableInModal[focusableInModal.length - 1] || closeBtn;
        if (firstFocusable) firstFocusable.focus();

        // Keydown handlers: Escape to close, Tab trap
        document.addEventListener('keydown', modalKeydownHandler);
    }

    function closeModal() {
        if (!loginModal) return;
        loginModal.style.display = 'none';
        loginModal.setAttribute('aria-hidden', 'true');
        // Restablecer a Iniciar Sesión al cerrar
        if (modalTitle) modalTitle.textContent = 'Iniciar Sesión';
        if (registerFields) registerFields.style.display = 'none';

        document.removeEventListener('keydown', modalKeydownHandler);
        if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') lastFocusedBeforeModal.focus();
    }

    function modalKeydownHandler(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            closeModal();
            return;
        }
        if (e.key === 'Tab') {
            // trap focus inside modal
            if (!focusableInModal || focusableInModal.length === 0) return;
            const focusedIndex = focusableInModal.indexOf(document.activeElement);
            if (e.shiftKey) {
                // shift + tab
                if (document.activeElement === firstFocusable || focusedIndex === 0) {
                    e.preventDefault();
                    (lastFocusable || firstFocusable).focus();
                }
            } else {
                // tab
                if (document.activeElement === lastFocusable || focusedIndex === focusableInModal.length - 1) {
                    e.preventDefault();
                    (firstFocusable || lastFocusable).focus();
                }
            }
        }
    }

    // Abrir Modal: soporta múltiples botones con el mismo id (por simplicidad en el markup)
    if (openLoginBtns && openLoginBtns.length && loginModal) {
        openLoginBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        });
    }

    // Cerrar modal con botón y click fuera
    if (closeBtn && loginModal) {
        closeBtn.addEventListener('click', () => {
            closeModal();
        });
        // permitir cerrar con Enter/Space si el closeBtn recibe foco
        closeBtn.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                closeModal();
            }
        });
        window.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                closeModal();
            }
        });
    }

    // Cambiar a formulario de Registro (simulado)
    if(showRegisterBtn) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isRegister = modalTitle && modalTitle.textContent.includes('Iniciar');
            
            if (modalTitle) modalTitle.textContent = isRegister ? 'Crear Cuenta (Rápido)' : 'Iniciar Sesión';
            if(registerFields) registerFields.style.display = isRegister ? 'block' : 'none';
            showRegisterBtn.textContent = isRegister ? 'Inicia Sesión' : 'Regístrate';
            
            const pText = showRegisterBtn.closest('p');
            if(pText && pText.firstChild) pText.firstChild.textContent = isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? ';
        });
    }

    // Simular envío de formulario (para demostración)
    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('¡Autenticación simulada exitosa! Bienvenido a CampoLink.');
            closeModal();
            // Redirigir a index.html después de un login exitoso (ejemplo)
            // window.location.href = 'index.html';
        });
    }

    // =========================================================
    // 3. Lógica del Chat Widget
    // =========================================================
    // El widget flotante redirige a la página de chat
    const openChatBtn = document.getElementById('open-chat-btn');
    if(openChatBtn) {
        openChatBtn.addEventListener('click', () => {
            window.location.href = 'chat.html';
        });
    }

    // =========================================================
    // 3b. Lógica del Carrito (persistencia y modal)
    // =========================================================
    const cartButtons = document.querySelectorAll('.cart-icon, #open-cart-modal');
    const CART_ITEMS_KEY = 'campolink_cart_items';

    function getCartItems() {
        try {
            const raw = localStorage.getItem(CART_ITEMS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }

    function setCartItems(items) {
        try { localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(items)); } catch (e) {}
        // update simple count display
        const total = items.reduce((s, it) => s + (it.qty || 0), 0);
        document.querySelectorAll('#cart-count').forEach(el => {
            el.textContent = String(total);
            // show/hide badge depending on count
            if (total > 0) {
                el.style.display = 'inline-flex';
            } else {
                el.style.display = 'none';
            }
        });
    }

    function getCartCount() {
        const items = getCartItems();
        return items.reduce((s, it) => s + (it.qty || 0), 0);
    }

    // Modal del carrito (si existe en DOM)
    const cartModal = document.getElementById('cart-modal');

    function renderCartModal() {
        const items = getCartItems();
        const container = document.getElementById('cart-items-container');
        const emptyMsg = document.getElementById('cart-empty-message');
        const totalEl = document.getElementById('cart-total');

        if (!container || !totalEl) return;
        container.innerHTML = '';

        if (!items || items.length === 0) {
            if (emptyMsg) emptyMsg.style.display = 'block';
            container.appendChild(emptyMsg || document.createElement('div'));
            totalEl.textContent = '$0';
            return;
        }

        if (emptyMsg) emptyMsg.style.display = 'none';

        // Render each item
        items.forEach(it => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.style.alignItems = 'center';
            row.style.padding = '8px 0';
            row.innerHTML = `
                <div style="flex:1">
                    <div style="font-weight:600">${it.name}</div>
                    <div style="color:var(--muted); font-size:0.9em">Cantidad: <span class="cart-item-qty">${it.qty}</span></div>
                </div>
                <div style="display:flex; gap:8px; align-items:center; margin-left:8px">
                    <button class="btn secondary cart-decrease" data-id="${it.id}" style="padding:6px 8px">-</button>
                    <button class="btn secondary cart-increase" data-id="${it.id}" style="padding:6px 8px">+</button>
                    <button class="btn secondary cart-remove" data-id="${it.id}" style="padding:6px 8px; background:#dc3545; border-color:#dc3545">Eliminar</button>
                </div>
            `;
            container.appendChild(row);
        });

        // update total (simple: show total qty because no prices stored)
        const totalQty = items.reduce((s, it) => s + (it.qty || 0), 0);
        totalEl.textContent = `$${totalQty}`; // placeholder: quantity as $ for demo

        // attach handlers for increase/decrease/remove
        container.querySelectorAll('.cart-increase').forEach(b => b.addEventListener('click', (e) => {
            const id = b.getAttribute('data-id');
            modifyItemQty(id, 1);
            renderCartModal();
        }));
        container.querySelectorAll('.cart-decrease').forEach(b => b.addEventListener('click', (e) => {
            const id = b.getAttribute('data-id');
            modifyItemQty(id, -1);
            renderCartModal();
        }));
        container.querySelectorAll('.cart-remove').forEach(b => b.addEventListener('click', (e) => {
            const id = b.getAttribute('data-id');
            removeItem(id);
            renderCartModal();
        }));
    }

    function modifyItemQty(id, delta) {
        const items = getCartItems();
        const idx = items.findIndex(x => String(x.id) === String(id));
        if (idx === -1) return;
        items[idx].qty = Math.max(0, (items[idx].qty || 0) + delta);
        if (items[idx].qty === 0) items.splice(idx, 1);
        setCartItems(items);
    }

    function removeItem(id) {
        let items = getCartItems();
        items = items.filter(x => String(x.id) !== String(id));
        setCartItems(items);
    }

    // click en botones del icono del carrito: abrir modal si existe, si no mostrar panel overlay
    if (cartButtons && cartButtons.length) {
        cartButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (cartModal) {
                    renderCartModal();
                    cartModal.style.display = 'flex';
                } else {
                    // fallback to small overlay panel
                    renderCartPanel();
                    cartPanel.style.display = (cartPanel.style.display === 'none' || !cartPanel.style.display) ? 'block' : 'none';
                }
            });
        });
    }

    // =========================================================
    // 5. Lógica del Carrito de Compras (Base de datos actualizada)
    // =========================================================

    const productDatabase = [
        { id: '1', name: 'Tomate Chonto Premium', price: 2500, unit: 'Kg', img: 'img/tomate.jpg', category: 'Vegetales y Hortalizas', city: 'Sibate' },
        { id: '2', name: 'Fresa Orgánica', price: 5800, unit: 'Bandeja (500g)', img: 'img/naranja.jpg', category: 'Frutas', city: 'Soacha' },
        { id: '3', name: 'Papa Pastusa Tuberosa', price: 1950, unit: 'Kg', img: 'img/verduras.jpg', category: 'Tuberculos y Raices', city: 'Sibate' },
        { id: '4', name: 'Queso Campesino Artesanal', price: 9500, unit: 'Unidad', img: 'img/manzana.jpg', category: 'Lacteos y Derivados', city: 'Soacha' },
        { id: '5', name: 'Papa Criolla', price: 3200, unit: 'Kg', img: 'img/verduras.jpg', category: 'Tuberculos y Raices', city: 'Sibate' },
        { id: '6', name: 'Acelga Fresca', price: 1200, unit: 'Kg', img: 'img/acelga.jpg', category: 'Vegetales y Hortalizas', city: 'Sibate' },
        { id: '7', name: 'Ají Picante', price: 2200, unit: 'Kg', img: 'img/aji.jpg', category: 'Vegetales y Hortalizas', city: 'Soacha' },
        { id: '8', name: 'Arequipe Artesanal', price: 7800, unit: 'Frasco', img: 'img/arequipe.jpg', category: 'Lacteos y Derivados', city: 'Soacha' },
        { id: '9', name: 'Arracacha Blanca', price: 2100, unit: 'Kg', img: 'img/arracachablanca.jpg', category: 'Tuberculos y Raices', city: 'Sibate' },
        { id: '10', name: 'Brócoli', price: 3400, unit: 'Kg', img: 'img/brocoli.jpg', category: 'Vegetales y Hortalizas', city: 'Soacha' },
        { id: '11', name: 'Café Tostado', price: 15000, unit: 'Kg', img: 'img/cafe.jpg', category: 'Granos y Tostados', city: 'Sibate' },
        { id: '12', name: 'Camote', price: 1700, unit: 'Kg', img: 'img/camote.jpg', category: 'Tuberculos y Raices', city: 'Soacha' },
        { id: '13', name: 'Cebolla', price: 1600, unit: 'Kg', img: 'img/cebolla.jpg', category: 'Vegetales y Hortalizas', city: 'Sibate' },
        { id: '14', name: 'Chocolate Artesanal', price: 12000, unit: 'Tableta', img: 'img/chocolate.jpg', category: 'Lacteos y Derivados', city: 'Soacha' },
        { id: '15', name: 'Granadilla', price: 2200, unit: 'Unidad', img: 'img/granadilla.jpg', category: 'Frutas', city: 'Sibate' },
        { id: '16', name: 'Huevos (Docena)', price: 8500, unit: 'Docena', img: 'img/huevos.jpg', category: 'Granos y Tostados', city: 'Soacha' },
        { id: '17', name: 'Lechuga', price: 900, unit: 'Unidad', img: 'img/lechuga.jpg', category: 'Vegetales y Hortalizas', city: 'Sibate' },
        { id: '18', name: 'Mermelada Artesanal', price: 9500, unit: 'Frasco', img: 'img/mermelada.jpg', category: 'Lacteos y Derivados', city: 'Soacha' },
        { id: '19', name: 'Miel Pura', price: 18000, unit: 'Frasco', img: 'img/miel.jpg', category: 'Lacteos y Derivados', city: 'Sibate' },
        { id: '20', name: 'Mora', price: 4200, unit: 'Kg', img: 'img/mora.jpg', category: 'Frutas', city: 'Soacha' },
        { id: '21', name: 'Naranja', price: 900, unit: 'Kg', img: 'img/naranja.jpg', category: 'Frutas', city: 'Sibate' },
        { id: '22', name: 'Pan Casero', price: 4000, unit: 'Paquete', img: 'img/pan_casero.jpg', category: 'Frutas', city: 'Soacha' },
        { id: '23', name: 'Papa Sabanera', price: 1700, unit: 'Kg', img: 'img/papasabanera.jpg', category: 'Tuberculos y Raices', city: 'Sibate' },
        { id: '24', name: 'Tomate de Árbol', price: 2800, unit: 'Kg', img: 'img/tomatearbol.jpg', category: 'Frutas', city: 'Soacha' },
        { id: '25', name: 'Uchuva', price: 6000, unit: 'Kg', img: 'img/uchuva.jpg', category: 'Frutas', city: 'Sibate' },
        { id: '26', name: 'Verduras Mixtas', price: 2500, unit: 'Kg', img: 'img/verduras.jpg', category: 'Vegetales y Hortalizas', city: 'Soacha' },
        { id: '27', name: 'Yuca Frita', price: 3500, unit: 'Paquete', img: 'img/yucafrita.jpg', category: 'Vegetales y Hortalizas', city: 'Soacha' },
    ];

    // Elements used by the cart UI
    const toastEl = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    const toastCount = document.getElementById('toast-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartEmptyMessage = document.getElementById('cart-empty-message');
    const cartTotalElement = document.getElementById('cart-total');

    // currency formatter
    const formatCurrency = (amount) => {
        try { return '$' + new Intl.NumberFormat('es-CO').format(amount); } catch(e) { return '$' + amount; }
    };

    // Render price-aware cart into modal container
    function renderCart() {
        const items = getCartItems();
        let total = 0;
        let totalItems = 0;

        if (!cartItemsContainer || !cartTotalElement) return;

        cartItemsContainer.innerHTML = '';

        if (!items || items.length === 0) {
            if (cartEmptyMessage) {
                cartEmptyMessage.style.display = 'block';
                cartItemsContainer.appendChild(cartEmptyMessage);
            }
            cartTotalElement.textContent = formatCurrency(0);
            updateCartCount(0);
            return;
        }

        if (cartEmptyMessage) cartEmptyMessage.style.display = 'none';

        items.forEach(it => {
            const product = productDatabase.find(p => String(p.id) === String(it.id));
            const name = it.name || (product && product.name) || 'Producto';
            const qty = it.qty || 1;
            const price = (product && product.price) ? product.price : 0;
            const img = (product && product.img) ? product.img : 'img/placeholder.jpg';

            const itemTotal = price * qty;
            total += itemTotal;
            totalItems += qty;

            const row = document.createElement('div');
            row.className = 'cart-item';
            row.setAttribute('data-product-id', String(it.id));
            row.innerHTML = `
                <img src="${img}" alt="${name}" class="cart-item-image">
                <div class="cart-item-info">
                    <h4>${name}</h4>
                    <p class="price">${formatCurrency(itemTotal)} <small style="color:var(--muted); font-weight:400;">(${formatCurrency(price)}/${product ? product.unit : ''})</small></p>
                </div>
                <div class="quantity-controls">
                    <button class="change-qty-btn" data-action="decrease" data-id="${it.id}">-</button>
                    <span class="item-quantity">${qty}</span>
                    <button class="change-qty-btn" data-action="increase" data-id="${it.id}">+</button>
                </div>
                <button class="remove-item-btn" data-id="${it.id}"><i class="fas fa-times-circle"></i></button>
            `;

            cartItemsContainer.appendChild(row);
        });

        cartTotalElement.textContent = formatCurrency(total);
        updateCartCount(totalItems);

        // Attach delegation handlers are handled elsewhere by event listeners on container
    }

    // Update simple badge count
    function updateCartCount(count) {
        const finalCount = (typeof count === 'number') ? count : getCartItems().reduce((s, it) => s + (it.qty || 0), 0);
        document.querySelectorAll('#cart-count').forEach(el => {
            el.textContent = String(finalCount);
            if (finalCount > 0) {
                el.style.display = 'inline-flex';
                // small bounce animation
                el.classList.add('bounce');
                setTimeout(() => el.classList.remove('bounce'), 300);
            } else {
                el.style.display = 'none';
            }
        });
    }

    // Add to cart (uses storage helpers)
    function addToCart(productId, productName) {
        const items = getCartItems();
        const idx = items.findIndex(x => String(x.id) === String(productId));
        if (idx === -1) {
            items.push({ id: String(productId), name: String(productName), qty: 1 });
        } else {
            items[idx].qty = (items[idx].qty || 0) + 1;
        }
        setCartItems(items);
        renderCart();
        showToast(`¡${productName} añadido!`);
    }

    function changeQuantity(productId, action) {
        const items = getCartItems();
        const idx = items.findIndex(i => String(i.id) === String(productId));
        if (idx === -1) return;
        if (action === 'increase') items[idx].qty = (items[idx].qty || 0) + 1;
        else if (action === 'decrease') items[idx].qty = (items[idx].qty || 0) - 1;
        if (items[idx].qty <= 0) items.splice(idx, 1);
        setCartItems(items);
        renderCart();
    }

    function removeItemFromCart(productId) {
        let items = getCartItems();
        items = items.filter(i => String(i.id) !== String(productId));
        setCartItems(items);
        renderCart();
        showToast('Producto eliminado del carrito.');
    }

    // Mejor implementación de toast (compatible con .toast-notification.show)
    function showToast(message, type = 'success') {
        if (!toastEl || !toastMsg || !toastCount) {
            console.error('Elementos del toast no encontrados en el DOM.');
            return;
        }

        // 1) Actualizar contenido y contador
        toastMsg.textContent = message;
        const totalCount = getCartItems().reduce((s, it) => s + (it.qty || 0), 0);
        toastCount.textContent = String(totalCount);

        // 2) Ajustar icono y colores según tipo
        const toastIcon = toastEl.querySelector('.toast-icon');
        const toastSummary = toastEl.querySelector('.toast-cart-summary');
        const rootStyles = getComputedStyle(document.documentElement);

        if (toastIcon) {
            toastIcon.classList.remove('fa-check-circle', 'fa-times-circle');
            if (type === 'removed') {
                toastIcon.classList.add('fa-times-circle');
                const red = rootStyles.getPropertyValue('--red-alert') || '#f44336';
                toastIcon.style.color = red.trim();
                if (toastSummary) toastSummary.style.backgroundColor = 'rgba(244, 67, 54, 0.12)';
            } else {
                toastIcon.classList.add('fa-check-circle');
                const green = rootStyles.getPropertyValue('--green-primary') || '#4CAF50';
                toastIcon.style.color = green.trim();
                if (toastSummary) toastSummary.style.backgroundColor = rootStyles.getPropertyValue('--green-light') || '';
            }
        }

        // 3) Mostrar el toast usando la clase .show (CSS controla la animación)
        toastEl.classList.add('show');

        // 4) Auto-ocultar con manejo de timeouts para evitar superposiciones
        if (toastEl.hideTimeout) clearTimeout(toastEl.hideTimeout);
        toastEl.hideTimeout = setTimeout(() => {
            toastEl.classList.remove('show');
            // limpiar estilos temporales (si aplicamos alguno)
            if (toastSummary) toastSummary.style.backgroundColor = '';
        }, 3000);
    }

    // Wire up add-to-cart buttons (products page)
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const id = this.getAttribute('data-product-id');
            const name = this.getAttribute('data-product-name') || this.textContent.trim();
            addToCart(id, name);

            // feedback on button
            const original = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Añadido';
            this.disabled = true;
            setTimeout(() => { this.innerHTML = original; this.disabled = false; }, 1400);
        });
    });

    // Open cart button handler (ensure render before open)
    const openCartModalBtn = document.getElementById('open-cart-modal');
    if (openCartModalBtn && cartModal) {
        openCartModalBtn.addEventListener('click', (e) => {
            e.preventDefault(); renderCart(); cartModal.style.display = 'flex';
        });
    }

    // Delegate clicks inside cart items container for qty changes and remove
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.change-qty-btn');
            const rem = e.target.closest('.remove-item-btn');
            if (btn) {
                const id = btn.getAttribute('data-id');
                const action = btn.getAttribute('data-action');
                changeQuantity(id, action === 'increase' ? 'increase' : 'decrease');
            } else if (rem) {
                const id = rem.getAttribute('data-id');
                removeItemFromCart(id);
            }
        });
    }

    // Ensure UI reflects stored cart on load
    renderCart();

    // Modal close / finalize handlers
    if (cartModal) {
        document.querySelectorAll('[data-close-modal="cart"]').forEach(b => b.addEventListener('click', () => { cartModal.style.display = 'none'; }));
        window.addEventListener('click', (e) => { if (e.target === cartModal) cartModal.style.display = 'none'; });
        const finalizeBtn = document.getElementById('cart-finalize');
        if (finalizeBtn) finalizeBtn.addEventListener('click', () => {
            alert('Finalizar pedido (simulado). Se contactará al vendedor para coordinar.');
            setCartItems([]);
            renderCart();
            cartModal.style.display = 'none';
        });
    }

    // =========================================================
    // 4. Lógica de Slider (página de inicio)
    // =========================================================
    const slides = document.querySelectorAll('.slider .slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        slides[0].classList.add('active'); // Asegura que el primero inicie activo
        const changeSlide = () => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        };
        // Iniciar slider (cada 5 segundos)
        setInterval(changeSlide, 5000);
    }

    // =========================================================
    // 6. Lógica de Filtros, Buscador y Contador de Productos
    // =========================================================
    
    // Elementos del DOM
    const productsContainer = document.querySelector('.products');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const cityFilter = document.getElementById('city-filter');
    const productCountElement = document.getElementById('product-count');
    const loadMoreBtn = document.getElementById('load-more-btn');

    // Paginación "Mostrar más"
    const initialVisible = 4; // mostrar 4 productos al inicio
    const batchSize = 4; // cuántos agregar por clic
    let currentVisible = initialVisible;

    // Función principal de renderizado y filtrado
    const renderFilteredProducts = () => {
        if (!productsContainer) return []; // Salir si no estamos en productos.html

        const searchTerm = (searchInput ? searchInput.value : '').trim().toLowerCase();
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
        const selectedCity = cityFilter ? cityFilter.value : 'all';
        let visibleCount = 0;
        const matchedCards = [];

        // Helper: extract searchable fields from a card, falling back to DOM when DB entry missing
        function extractCardData(card) {
            const addBtn = card.querySelector('.add-to-cart-btn');
            const pid = addBtn?.dataset.productId;

            if (pid) {
                const prod = productDatabase.find(p => String(p.id) === String(pid));
                if (prod) return { id: String(prod.id), name: prod.name || '', category: prod.category || '', city: prod.city || '', price: prod.price || 0 };
            }

            // Fallback: read from the card DOM
            const nameEl = card.querySelector('.product-title, .product-name, h3, h4');
            const name = nameEl ? nameEl.textContent.trim() : '';

            // category may be in an element or in data-category on the card or button
            let category = '';
            const catEl = card.querySelector('.product-category') || card.querySelector('[data-category]');
            if (catEl) category = (catEl.dataset?.category || catEl.textContent || '').trim();
            if (!category && card.dataset && card.dataset.category) category = card.dataset.category;

            // city/location
            let city = '';
            const cityEl = card.querySelector('.product-city') || card.querySelector('[data-city]');
            if (cityEl) city = (cityEl.dataset?.city || cityEl.textContent || '').trim();
            if (!city && card.dataset && card.dataset.city) city = card.dataset.city;

            // price: try to parse numeric characters
            let price = 0;
            const priceEl = card.querySelector('.price, .product-price, [data-price]');
            if (priceEl) {
                const raw = (priceEl.dataset?.price) ? String(priceEl.dataset.price) : priceEl.textContent;
                const digits = String(raw).replace(/[^\d]/g, '');
                price = digits ? parseInt(digits, 10) : 0;
            }

            return { id: pid || null, name, category, city, price };
        }

        productsContainer.querySelectorAll('.product-card').forEach(card => {
            const data = extractCardData(card);
            if (!data) {
                card.style.display = 'none';
                return;
            }

            const nameLower = (data.name || '').toLowerCase();
            const cardText = (card.textContent || '').toLowerCase();

            // Search: match against name, price (numbers), or any visible text in the card
            const matchesSearch = !searchTerm || nameLower.includes(searchTerm) || String(data.price).includes(searchTerm) || cardText.includes(searchTerm);

            const matchesCategory = selectedCategory === 'all' || (data.category || '').toLowerCase() === selectedCategory.toLowerCase();
            const matchesCity = selectedCity === 'all' || (data.city || '').toLowerCase() === selectedCity.toLowerCase();

            if (matchesSearch && matchesCategory && matchesCity) {
                matchedCards.push(card);
            } else {
                card.style.display = 'none';
            }
        });

        // 4. Aplicar límite de visualización (mostrar hasta currentVisible)
        matchedCards.forEach((card, idx) => {
            if (idx < currentVisible) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // 5. Actualizar Contador y mostrar mensaje si no hay resultados
        if (productCountElement) {
            productCountElement.textContent = matchedCards.length; // mostrar cuántas coinciden (total)
        }
        const noResultsEl = document.getElementById('no-results-message');
        if (noResultsEl) {
            noResultsEl.style.display = (matchedCards.length === 0) ? 'block' : 'none';
        }

        // 6. Mostrar u ocultar el botón "Cargar más"
        if (loadMoreBtn) {
            if (matchedCards.length > currentVisible) loadMoreBtn.style.display = 'inline-block';
            else loadMoreBtn.style.display = 'none';
        }

        // Devolver las tarjetas coincidentes para que llamantes puedan aplicar animaciones adicionales
        return matchedCards;
    };

    // 5. Inicializar y Asignar Event Listeners
    if (productsContainer) {
        // Inicializar el renderizado al cargar la página
        const initialMatched = renderFilteredProducts() || [];
        // Añadir clase .init-anim SOLO a las tarjetas que se muestren inicialmente
        initialMatched.slice(0, currentVisible).forEach((card, i) => {
            // usa delay para cascada inicial
            card.classList.add('init-anim');
            card.style.animationDelay = (i * 80) + 'ms';
            setTimeout(() => { card.style.animationDelay = ''; card.classList.remove('init-anim'); }, 700);
        });

        // Asignar eventos de cambio/teclado: al cambiar filtros, resetear el límite visible
        searchInput?.addEventListener('input', () => { currentVisible = initialVisible; renderFilteredProducts(); });
        categoryFilter?.addEventListener('change', () => { currentVisible = initialVisible; renderFilteredProducts(); });
        cityFilter?.addEventListener('change', () => { currentVisible = initialVisible; renderFilteredProducts(); });

        // Manejar botón "Cargar más productos" (aplica delays en las nuevas tarjetas para cascada)
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const prevVisible = currentVisible;
                currentVisible = currentVisible + batchSize;

                // Renderizar y recibir la lista de tarjetas que coinciden
                const matched = renderFilteredProducts() || [];

                // Seleccionar las tarjetas que acaban de hacerse visibles
                const newlyShown = matched.slice(prevVisible, currentVisible);
                newlyShown.forEach((card, i) => {
                    // Asigna un pequeño delay incremental para crear la cascada
                    const delayMs = i * 80; // milisegundos
                    card.classList.add('init-anim');
                    card.style.animationDelay = delayMs + 'ms';
                    // Limpiar después de la animación para no interferir con futuras acciones
                    setTimeout(() => {
                        card.style.animationDelay = '';
                        card.classList.remove('init-anim');
                    }, 700);
                });

                // smooth scroll slightly down to reveal new items
                try { window.scrollBy({ top: 200, behavior: 'smooth' }); } catch (err) {}
            });
        }
    }
});