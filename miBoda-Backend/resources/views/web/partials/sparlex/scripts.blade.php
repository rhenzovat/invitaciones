<script>
(function () {
    function hideSpinner() {
        var el = document.getElementById('spinner');
        if (el) el.classList.remove('show');
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideSpinner);
    } else {
        hideSpinner();
    }
    window.addEventListener('load', hideSpinner);
})();
</script>
<script defer src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"></script>
<script defer src="{{ asset('temp02/lib/easing/easing.min.js') }}"></script>
<script defer src="{{ asset('temp02/lib/owlcarousel/owl.carousel.min.js') }}"></script>
<script defer src="{{ asset('temp02/js/main.js') }}"></script>
<script defer src="{{ asset('temp02/js/navbar-split.js') }}"></script>
@include('web.partials.sparlex.whatsapp_config')
<script defer src="{{ asset('temp02/js/whatsapp-float.js') }}"></script>
<script defer charset="UTF-8" src="{{ asset('temp02/js/whatsapp-reserva.js') }}"></script>
<script defer src="{{ asset('temp02/js/custom-cursor.js') }}"></script>
<script defer src="{{ asset('temp02/js/site-search.js') }}"></script>
