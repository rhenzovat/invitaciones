<div class="modal fade" id="searchModal" tabindex="-1" aria-hidden="true" data-bs-keyboard="true">
    <div class="modal-dialog modal-fullscreen">
        <div class="modal-content rm-search-modal">
            <div class="rm-search-overlay" id="siteSearchOverlay">
                <button type="button" class="rm-search-close btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                <form id="siteSearchForm" action="{{ route('site.search') }}" method="GET" class="rm-search-form input-group">
                    <input
                        type="search"
                        name="q"
                        id="siteSearchInput"
                        class="form-control p-3"
                        placeholder="Buscar masajes, servicios, precios, publicaciones..."
                        autocomplete="off"
                        required
                        aria-label="Término de búsqueda"
                    >
                    <button type="submit" class="input-group-text p-3 border-0 bg-primary text-white" aria-label="Buscar">
                        <i class="fa fa-search"></i>
                    </button>
                </form>
                <p class="rm-search-hint">Presiona <kbd>Esc</kbd> o haz clic fuera para cerrar</p>
            </div>
        </div>
    </div>
</div>
