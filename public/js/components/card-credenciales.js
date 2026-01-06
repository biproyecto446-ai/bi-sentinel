(() => {
  const selector = '[data-component="CardCredenciales"]';

  function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < (window.innerHeight || document.documentElement.clientHeight) && rect.bottom >= 0;
  }

  document.querySelectorAll(selector).forEach(el => {
    const cardId = el.dataset.cardId;
    const countEl = el.querySelector(`#count-${cardId}`);
    let currentEleccion = null;
    let lastFetchedEleccion = null;

    const fetchData = async (eleccionId) => {
      if (!eleccionId) return;
      try {
        const res = await fetch(`/api/board-origin/${eleccionId}/card/credenciales`);
        const json = await res.json();
        if (json.success) {
          countEl.textContent = json.data.count.toLocaleString('es-CO');
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
