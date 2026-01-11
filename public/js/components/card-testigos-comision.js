(() => {
  const selector = '[data-component="CardTestigosComision"]';

  function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < (window.innerHeight || document.documentElement.clientHeight) && rect.bottom >= 0;
  }

  document.querySelectorAll(selector).forEach(el => {
    const cardId = el.dataset.cardId;
    const countEl = el.querySelector(`#count-${cardId}`);
    const countAuxiliarEl = el.querySelector(`#count-testigos-comision-auxiliar-${cardId}`);
    const countZonalEl = el.querySelector(`#count-testigos-comision-zonal-${cardId}`);
    const countMunicipalEl = el.querySelector(`#count-testigos-comision-municipal-${cardId}`);
    const countGeneralEl = el.querySelector(`#count-testigos-comision-general-${cardId}`);
    const countCneEl = el.querySelector(`#count-testigos-comision-cne-${cardId}`);
    let currentEleccion = null;
    let lastFetchedEleccion = null;

    const fetchData = async (eleccionId) => {
      if (!eleccionId) return;
      try {
        const res = await fetch(`/api/board-origin/${eleccionId}/card/testigos-comision`);
        const json = await res.json();

        console.log(json, 'testigos comision');
        
        if (json.success) {
          const { total, auxiliar, zonal, municipal, general, cne } = json.data.count;
          countEl.textContent = total.toLocaleString('es-CO');
          countAuxiliarEl.textContent = auxiliar.toLocaleString('es-CO');
          countZonalEl.textContent = zonal.toLocaleString('es-CO');
          countMunicipalEl.textContent = municipal.toLocaleString('es-CO');
          countGeneralEl.textContent = general.toLocaleString('es-CO');
          countCneEl.textContent = cne.toLocaleString('es-CO');
        } else {
          console.error('Error fetching card data', json);
        }
      } catch (err) {
        console.error('Error fetching card data', err);
      }
    };

    const onEleccionSelected = (e) => {
      currentEleccion = e.detail.id;
      // If visible, fetch immediately
      if (isInViewport(el)) {
        if (lastFetchedEleccion !== currentEleccion) {
          fetchData(currentEleccion);
          lastFetchedEleccion = currentEleccion;
        }
      }
    };

    document.addEventListener('eleccion:selected', onEleccionSelected);

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (currentEleccion && lastFetchedEleccion !== currentEleccion) {
            fetchData(currentEleccion);
            lastFetchedEleccion = currentEleccion;
          }
        }
      });
    }, { threshold: 0.25 });

    io.observe(el);
  });
})();
