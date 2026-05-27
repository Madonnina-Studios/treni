/* ==========================================================================
   BINARI ITALIANI - ENGINE JS
   Motore logico, animazioni fluide ed interazioni dinamiche
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
     1. Gestione Menu Hamburger & Mobile Nav
     -------------------------------------------------------------------------- */
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('open');
      navMenu.classList.toggle('open');
      
      // Impedisci scroll del body quando il menu è aperto
      if (navMenu.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // Chiudi il menu quando si clicca su un link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuBtn.classList.remove('open');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }


  /* --------------------------------------------------------------------------
     2. Scroll Spy & Effetto Header Ridotto
     -------------------------------------------------------------------------- */
  const header = document.querySelector('.main-header');
  const sections = document.querySelectorAll('section');

  const scrollHandler = () => {
    const scrollPos = window.scrollY;

    // Aggiungi background scuro all'header dopo 50px di scroll
    if (scrollPos > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Evidenzia link attivo durante lo scroll
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120; // offset per altezza header
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', scrollHandler);
  scrollHandler(); // Inizializzazione immediata


  /* --------------------------------------------------------------------------
     3. Intersection Observer per Animazioni al Scroll (Solo Desktop)
     -------------------------------------------------------------------------- */
  const animatedElements = document.querySelectorAll('.scroll-reveal');

  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target); // Ferma l'ascolto una volta animato
        }
      });
    }, observerOptions);

    animatedElements.forEach(element => {
      revealObserver.observe(element);
    });
  } else {
    // Fallback in caso di mancanza di supporto all'observer
    animatedElements.forEach(element => {
      element.classList.add('active');
    });
  }


  /* --------------------------------------------------------------------------
     4. Gestione Filtro Linee Ferroviarie
     -------------------------------------------------------------------------- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.line-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Aggiorna stato attivo dei pulsanti
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filterValue = button.getAttribute('data-filter');

      cards.forEach(card => {
        const cardRegion = card.getAttribute('data-region');
        
        if (filterValue === 'all' || cardRegion === filterValue) {
          card.classList.remove('filtered-out');
          // Ritardo leggero per permettere un'animazione fluida di comparsa
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          // Nascondi dopo la transizione CSS
          setTimeout(() => {
            card.classList.add('filtered-out');
          }, 300);
        }
      });
    });
  });


  /* --------------------------------------------------------------------------
     5. Mappa Interattiva d'Italia (SVG & Data Binding)
     -------------------------------------------------------------------------- */
  // Database delle tratte collegate alle regioni
  const regionDatabase = {
    piemonte: {
      name: "Piemonte",
      linesCount: 1,
      km: 52,
      lines: [
        { name: "Ferrovia Vigezzina-Centovalli", desc: "La ferrovia alpina del foliage (Domodossola - Locarno)" }
      ]
    },
    lombardia: {
      name: "Lombardia",
      linesCount: 1,
      km: 61,
      lines: [
        { name: "Ferrovia del Bernina", desc: "Patrimonio UNESCO, sale fino a 2253m (Tirano - St. Moritz)" }
      ]
    },
    toscana: {
      name: "Toscana",
      linesCount: 1,
      km: 80,
      lines: [
        { name: "Ferrovia della Garfagnana", desc: "Tratta Lucca-Aulla tra ponti storici e borghi medievali" }
      ]
    },
    abruzzo: {
      name: "Abruzzo",
      linesCount: 1,
      km: 128,
      lines: [
        { name: "Transiberiana d'Italia", desc: "Storica ferrovia dei parchi nazionali (Sulmona - Carpinone)" }
      ]
    },
    sicilia: {
      name: "Sicilia",
      linesCount: 1,
      km: 110,
      lines: [
        { name: "Ferrovia Circumetnea", desc: "Giro panoramico attorno al cratere dell'Etna su roccia vulcanica" }
      ]
    }
  };

  const mapRegions = document.querySelectorAll('.interactive-region');
  const railPaths = document.querySelectorAll('.map-rail-line');
  const infoPanel = document.getElementById('map-info-panel');
  const panelRegionName = document.getElementById('panel-region-name');
  const panelContent = document.getElementById('panel-region-content');

  // Riferimenti elementi interni del pannello
  const welcomeText = panelContent.querySelector('.panel-welcome-text');
  const statsDiv = panelContent.querySelector('.panel-stats');
  const statLines = document.getElementById('panel-stat-lines');
  const statKm = document.getElementById('panel-stat-km');
  const linesListDiv = document.getElementById('panel-lines-list');
  const linesUl = document.getElementById('panel-lines-ul');

  let pinnedRegion = null; // Memorizza la regione bloccata al click

  // Funzione per aggiornare il pannello informativo
  const updateInfoPanel = (regionId) => {
    const data = regionDatabase[regionId];

    if (data) {
      welcomeText.style.display = 'none';
      statsDiv.style.display = 'grid';
      linesListDiv.style.display = 'block';

      panelRegionName.textContent = data.name;
      statLines.textContent = data.linesCount;
      statKm.textContent = `${data.km} km`;

      // Svuota e ricrea lista linee
      linesUl.innerHTML = '';
      data.lines.forEach(line => {
        const li = document.createElement('li');
        li.innerHTML = `${line.name} <span>Attiva</span>`;
        linesUl.appendChild(li);
      });
    } else {
      // Regione non percorsa
      welcomeText.style.display = 'block';
      statsDiv.style.display = 'none';
      linesListDiv.style.display = 'none';

      // Ottieni nome regione formattato
      const prettyName = regionId.charAt(0).toUpperCase() + regionId.slice(1).replace('valledaosta', "Valle d'Aosta").replace('emiliaromagna', 'Emilia-Romagna').replace('trentino', 'Trentino-A.A.').replace('friuli', 'Friuli-V.G.');
      panelRegionName.textContent = prettyName;
      welcomeText.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: var(--text-muted); font-size: 2rem; margin-bottom: 0.8rem; display: block;"></i> Nessuna tratta registrata in questa regione per il momento. I progetti futuri includono esplorazioni lungo le linee secondarie locali.`;
    }
  };

  // Funzione per ripulire l'evidenziazione temporanea dei binari
  const clearRailHighlights = () => {
    railPaths.forEach(path => path.classList.remove('highlighted'));
  };

  // Funzione per evidenziare i binari legati alla regione
  const highlightRailsForRegion = (regionId) => {
    railPaths.forEach(path => {
      if (path.getAttribute('data-linked-region') === regionId) {
        path.classList.add('highlighted');
      }
    });
  };

  mapRegions.forEach(region => {
    const regionId = region.getAttribute('data-region');

    // Hover mouse (Desktop)
    region.addEventListener('mouseenter', () => {
      if (pinnedRegion) return; // Non sovrascrivere se c'è un pin attivo
      
      clearRailHighlights();
      highlightRailsForRegion(regionId);
      updateInfoPanel(regionId);
    });

    region.addEventListener('mouseleave', () => {
      if (pinnedRegion) return; // Mantieni le info del pin attivo
      
      clearRailHighlights();
      // Ripristina stato iniziale di benvenuto
      panelRegionName.textContent = "Regioni Esplorate";
      welcomeText.style.display = 'block';
      welcomeText.textContent = "Passa il cursore su una delle regioni evidenziate in arancione per scoprire i percorsi effettuati, oppure selezionale direttamente sul tuo smartphone.";
      statsDiv.style.display = 'none';
      linesListDiv.style.display = 'none';
    });

    // Click o Tap (Mobile e Desktop per bloccare la visualizzazione)
    region.addEventListener('click', (e) => {
      e.stopPropagation(); // Evita di propagare al body

      mapRegions.forEach(r => r.classList.remove('selected'));
      clearRailHighlights();

      if (pinnedRegion === regionId) {
        // Deseleziona se ricliccato
        pinnedRegion = null;
        panelRegionName.textContent = "Regioni Esplorate";
        welcomeText.style.display = 'block';
        welcomeText.textContent = "Passa il cursore su una delle regioni evidenziate in arancione per scoprire i percorsi effettuati, oppure selezionale direttamente sul tuo smartphone.";
        statsDiv.style.display = 'none';
        linesListDiv.style.display = 'none';
      } else {
        // Seleziona nuova regione
        pinnedRegion = regionId;
        region.classList.add('selected');
        highlightRailsForRegion(regionId);
        updateInfoPanel(regionId);
      }
    });
  });

  // Cliccare fuori dalla mappa resetta la selezione bloccata
  document.body.addEventListener('click', () => {
    pinnedRegion = null;
    mapRegions.forEach(r => r.classList.remove('selected'));
    clearRailHighlights();
    panelRegionName.textContent = "Regioni Esplorate";
    welcomeText.style.display = 'block';
    welcomeText.textContent = "Passa il cursore su una delle regioni evidenziate in arancione per scoprire i percorsi effettuati, oppure selezionale direttamente sul tuo smartphone.";
    statsDiv.style.display = 'none';
    linesListDiv.style.display = 'none';
  });


  /* --------------------------------------------------------------------------
     6. Gestione Carosello Automatico (Treni e Curiosità)
     -------------------------------------------------------------------------- */
  const scroller = document.getElementById('carousel-scroller');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const indicatorsContainer = document.getElementById('carousel-indicators');
  
  if (scroller && prevBtn && nextBtn) {
    const slides = scroller.querySelectorAll('.carousel-slide');
    const dots = indicatorsContainer.querySelectorAll('.dot');
    let currentIndex = 0;
    const slideCount = slides.length;
    let autoplayInterval;

    const getSlideWidth = () => {
      return scroller.querySelector('.carousel-slide').offsetWidth;
    };

    // Funzione per navigare ad un indice specifico
    const scrollToSlide = (index) => {
      if (index < 0) index = slideCount - 1;
      if (index >= slideCount) index = 0;
      
      currentIndex = index;
      const slideWidth = getSlideWidth();
      
      scroller.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth'
      });
      
      updateIndicators(index);
    };

    // Aggiorna lo stato visivo dei pallini indicatori
    const updateIndicators = (activeIndex) => {
      dots.forEach((dot, idx) => {
        if (idx === activeIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    };

    // Pulsanti Avanti/Indietro
    prevBtn.addEventListener('click', () => {
      stopAutoplay();
      scrollToSlide(currentIndex - 1);
      startAutoplay();
    });

    nextBtn.addEventListener('click', () => {
      stopAutoplay();
      scrollToSlide(currentIndex + 1);
      startAutoplay();
    });

    // Clicca sui singoli pallini
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        stopAutoplay();
        const slideIndex = parseInt(e.target.getAttribute('data-slide'));
        scrollToSlide(slideIndex);
        startAutoplay();
      });
    });

    // Autoplay Timer
    const startAutoplay = () => {
      autoplayInterval = setInterval(() => {
        scrollToSlide(currentIndex + 1);
      }, 4000); // Cambia ogni 4 secondi
    };

    const stopAutoplay = () => {
      clearInterval(autoplayInterval);
    };

    // Pausa autoplay su hover del mouse (Desktop)
    scroller.addEventListener('mouseenter', stopAutoplay);
    scroller.addEventListener('mouseleave', startAutoplay);
    
    // Pausa su touch (Mobile)
    scroller.addEventListener('touchstart', stopAutoplay, {passive: true});
    scroller.addEventListener('touchend', startAutoplay, {passive: true});

    // Gestione swipe manuale per aggiornare i pallini in tempo reale
    let isScrolling;
    scroller.addEventListener('scroll', () => {
      // Debounce dello scroll event per evitare ricalcoli eccessivi
      window.clearTimeout(isScrolling);
      isScrolling = setTimeout(() => {
        const slideWidth = getSlideWidth();
        const scrollPosition = scroller.scrollLeft;
        // Calcola l'indice approssimato della slide visibile
        const exactIndex = scrollPosition / slideWidth;
        const roundedIndex = Math.round(exactIndex);
        
        // Aggiorna l'indice corrente se differisce per evitare loop infiniti
        if (roundedIndex !== currentIndex && roundedIndex >= 0 && roundedIndex < slideCount) {
          currentIndex = roundedIndex;
          updateIndicators(roundedIndex);
        }
      }, 100);
    });

    // Ridimensionamento schermo ricalcola la posizione corretta
    window.addEventListener('resize', () => {
      // Mantiene la slide attiva centrata durante il resize
      scrollToSlide(currentIndex);
    });

    // Inizia Autoplay all'avvio
    startAutoplay();
  }


  /* --------------------------------------------------------------------------
     7. Lightbox Galleria Fotografica
     -------------------------------------------------------------------------- */
  const galleryItems = document.querySelectorAll('.gallery-item');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const caption = item.getAttribute('data-caption');
      const placeholderText = item.querySelector('.placeholder-text-gallery').innerHTML;
      const tag = item.querySelector('.gallery-tag').textContent;

      // Crea dinamicamente la struttura modale del Lightbox
      const lightbox = document.createElement('div');
      lightbox.classList.add('lightbox-modal');
      
      lightbox.innerHTML = `
        <button class="modal-close-btn" id="lightbox-close" aria-label="Chiudi"><i class="fa-solid fa-xmark"></i></button>
        <div class="lightbox-content-container">
          <div class="image-placeholder lightbox-placeholder">
            <i class="fa-solid fa-camera" style="font-size: 4rem; color: var(--accent-orange); margin-bottom: 1rem;"></i>
            <span style="font-size: 1rem; color: var(--text-gray);">${placeholderText}</span>
          </div>
        </div>
        <div class="lightbox-caption">
          <span style="color: var(--accent-orange); font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase; display: block; margin-bottom: 0.3rem;">[${tag}]</span>
          ${caption}
        </div>
      `;

      document.body.appendChild(lightbox);
      document.body.style.overflow = 'hidden'; // blocca lo scroll

      // Forza il rendering per avviare la transizione CSS di apertura
      setTimeout(() => lightbox.classList.add('open'), 10);

      // Funzione di chiusura
      const closeLightbox = () => {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(() => lightbox.remove(), 400); // Rimuove dal DOM dopo l'effetto di dissolvenza
      };

      // Listener per chiusura
      lightbox.querySelector('#lightbox-close').addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
      });
      
      // ESC key per chiusura
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          closeLightbox();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);
    });
  });


  /* --------------------------------------------------------------------------
     8. Database Diari di Viaggio & Gestione Modale Lettura
     -------------------------------------------------------------------------- */
  const diaryDatabase = {
    "diary-1": {
      title: "Il richiamo dell'autunno alpino: due giorni a bordo della Vigezzina",
      subtitle: "Un viaggio slow tra i boschi di castagni e le vette della Val Vigezzo",
      date: "15 Ottobre 2025",
      readTime: "6 min lettura",
      author: "Scritto da Davide",
      content: `
        <p class="diary-lead">Il viaggio lento per eccellenza ha il suono ritmico delle ruote di metallo sulle giunzioni delle rotaie a scartamento ridotto. C'è qualcosa di magico nell'autunno alpino, specialmente quando lo si osserva dal finestrino abbassato di un elettrotreno che si inerpica lungo pendenze vertiginose.</p>
        
        <h3>L'Inizio della Salita da Domodossola</h3>
        <p>La mia avventura comincia alla stazione ipogea di Domodossola. Fuori, una pioggerella fine rende lucido l'asfalto, ma l'interno del convoglio è caldo e profuma di legno e resine montane. Appena il capotreno fischia e i motori elettrici ronzano vigorosi, entriamo nella prima galleria elicoidale, sbucando subito dopo in un paesaggio che sembra dipinto a mano. La valle comincia a restringersi, costringendo il binario a serpeggiare aggrappato alle pareti rocciose della Val d'Ossola.</p>
        
        <blockquote>"Viaggiare in treno significa riappropriarsi del tempo. Non c'è fretta, non c'è una destinazione da conquistare con rabbia, solo il susseguirsi calmo dei pini dorati."</blockquote>
        
        <h3>Ponti Sospesi sul Vuoto delle Centovalli</h3>
        <p>Oltrepassato il confine svizzero, la ferrovia entra ufficialmente nel territorio delle Centovalli. Qui la natura si fa selvaggia e gli ingegneri ferroviari degli anni '20 hanno compiuto veri miracoli tecnologici. Attraversiamo viadotti ad arco in pietra che scavalcano forre profonde oltre cento metri. Guardando in basso si scorge l'acqua spumeggiante del torrente Melezza che brilla tra la roccia scura. Ogni fermata è una piccola stazione rurale, talvolta costituita solo da una pensilina in legno coperta di foglie rosse di vite canadese.</p>
        
        <h3>L'Arrivo a Locarno e il Ritorno</h3>
        <p>Giunto a Locarno, sulle sponde del Lago Maggiore, la luce del tardo pomeriggio si riflette dorata sull'acqua. Ho percorso appena 52 chilometri, ma la sensazione è quella di aver attraversato un intero continente. Il viaggio di ritorno, effettuato al tramonto, trasforma la ferrovia in un tunnel d'oro e arancione, lasciando impressa nella mente la certezza che le linee ferroviarie storiche siano una delle più grandi opere d'arte erette dall'uomo.</p>
      `
    },
    "diary-2": {
      title: "Tra lava e pistacchio: il periplo solitario dell'Etna a scartamento ridotto",
      subtitle: "Centodieci chilometri di binari nel silenzio basaltico del vulcano attivo",
      date: "24 Agosto 2025",
      readTime: "8 min lettura",
      author: "Scritto da Davide",
      content: `
        <p class="diary-lead">Il calore della Sicilia orientale si fa sentire già di prima mattina. Ma la vera attrazione non è il mare azzurro, bensì quel tracciato ferroviario storico che circonda, come un anello metallico, il vulcano attivo più alto d'Europa.</p>
        
        <h3>La Vecchia Littorina Diesel</h3>
        <p>Alla stazione di Catania Borgo non ci sono treni aerodinamici o aria condizionata centralizzata. C'è una vecchia automotrice diesel Fiat, con la sua inconfondibile cassa squadrata e i sedili in finta pelle marrone che hanno accolto generazioni di pendolari e viaggiatori solitari. Quando il motore diesel si avvia con un sussulto metallico, l'aria profuma di gasolio e aranci. Comincia così un periplo lento che ci porterà a sfiorare i mille metri d'altitudine.</p>
        
        <h3>Dentro il Silenzio Nero della Lava</h3>
        <p>Oltrepassati i sobborghi catanesi, il paesaggio cambia drasticamente. La terra nera vulcanica prende il sopravvento. I binari corrono in mezzo a colate laviche storiche del 1981 e del 2002. La sensazione è aliena: rocce basaltiche contorte dai riflessi argentei si estendono a perdita d'occhio, interrotte solo da cespugli gialli di ginestra dell'Etna e da muri a secco in pietra lavica eretti con precisione millimetrica. In mezzo a questo deserto di pietra, la ferrovia sembra un miracolo di caparbietà umana.</p>
        
        <blockquote>"La Circumetnea non è una linea per chi ha fretta. È un viaggio sensoriale dove il fischio del treno si perde nel silenzio solenne del vulcano fumante."</blockquote>
        
        <h3>La Capitale del Pistacchio: Bronte</h3>
        <p>Una delle fermate più suggestive è Bronte. Qui il binario attraversa sterminati pistacchieti abbarbicati sulla roccia vulcanica. L'odore dolce dei frutti si mischia al profumo arido della terra arsa dal sole. Scendo per una breve sosta, accolto dal capostazione che indossa ancora la classica divisa storica. Risalire sul treno e completare il viaggio scendendo verso Riposto, con il mar Ionio che appare all'improvviso all'orizzonte, è la perfetta conclusione di un road trip unico al mondo.</p>
      `
    },
    "diary-3": {
      title: "Ghiaccio e vette appenniniche: la Transiberiana d'Italia sotto la bufera",
      subtitle: "Attraversare il cuore innevato dell'Abruzzo a bordo di carrozze Centoporte in legno",
      date: "18 Gennaio 2026",
      readTime: "10 min lettura",
      author: "Scritto da Davide",
      content: `
        <p class="diary-lead">Spesso si pensa che per vivere l'avventura ferroviaria dei grandi ghiacci si debba andare in Siberia o in Canada. Invece, nel cuore degli Appennini abruzzesi, esiste una linea storica che d'inverno regala tempeste di neve e valichi innevati degni del grande nord.</p>
        
        <h3>Il Fascino delle Carrozze in Legno Centoporte</h3>
        <p>A Sulmona la temperatura è scesa sotto lo zero. Sui binari storici attende un convoglio straordinario: la locomotiva storica a vapore Gr. 740 sbuffa nuvole bianche che si fondono con la nebbia mattutina. Le carrozze al seguito sono le storiche 'Centoporte' degli anni '30. All'interno, le pareti in legno massiccio tirato a lucido e le vecchie targhette in ottone ci riportano indietro di un secolo. Il riscaldamento, alimentato dal vapore proveniente direttamente dalla locomotiva, emana un calore asciutto e rassicurante.</p>
        
        <h3>La Scalata degli Altopiani Maggiori</h3>
        <p>Appena lasciata Sulmona, la pendenza si fa severa. Saliamo costantemente superando gole scavate dal vento e viadotti innevati. All'altezza di Cansano, la pioggia si trasforma in una fitta nevicata. Quando raggiungiamo la stazione di Rivisondoli-Pescocostanzo, a ben 1268 metri di quota, il paesaggio è completamente sepolto da oltre un metro di soffice neve bianca. La visibilità è ridotta, e solo il faro anteriore della vaporiera fende la bufera appenninica.</p>
        
        <blockquote>"Sentire il calore del radiatore a vapore sotto il sedile in legno mentre fuori infuria la tormenta è una delle sensazioni di comfort più primordiali che un viaggiatore possa sperimentare."</blockquote>
        
        <h3>L'Arrivo a Castel di Sangro</h3>
        <p>Il viaggio si conclude a Castel di Sangro dopo aver attraversato paesaggi montani vergini e parchi protetti dove non esistono strade. Questa ferrovia, salvata dall'abbandono grazie all'impegno di associazioni storiche e di Fondazione FS, dimostra come il patrimonio ferroviario italiano non sia solo passato, ma un patrimonio vivo in grado di regalare emozioni pure che nessun'autostrada potrà mai eguagliare.</p>
      `
    }
  };

  const modal = document.getElementById('diary-modal');
  const modalBody = document.getElementById('modal-body-content');
  const modalClose = document.getElementById('modal-close');
  const modalOverlay = document.getElementById('modal-overlay');
  const openButtons = document.querySelectorAll('.open-diary-btn');

  if (modal && modalBody) {
    const openModal = (diaryId) => {
      const data = diaryDatabase[diaryId];
      if (!data) return;

      // Popola il modale con i testi del database
      modalBody.innerHTML = `
        <div class="modal-diary-header">
          <span class="modal-diary-meta"><i class="fa-solid fa-feather"></i> ${data.author} | <i class="fa-regular fa-calendar"></i> ${data.date}</span>
          <h2 class="modal-diary-title">${data.title}</h2>
          <p class="modal-diary-subtitle">${data.subtitle}</p>
          <div class="modal-diary-divider"></div>
        </div>
        <div class="modal-diary-placeholder-img image-placeholder">
          <i class="fa-solid fa-book-open" style="font-size: 3rem; color: var(--accent-orange); margin-bottom: 0.8rem;"></i>
          <span style="font-size: 0.85rem; color: var(--text-gray);">Spazio per l'immagine del diario: <code>images/${diaryId}_large.jpg</code></span>
        </div>
        <div class="modal-diary-content">
          ${data.content}
        </div>
      `;

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // Blocca lo scroll della pagina
    };

    const closeModal = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = ''; // Ripristina scroll
    };

    // Collega i bottoni dei diari
    openButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const diaryId = btn.getAttribute('data-diary-id');
        openModal(diaryId);
      });
    });

    // Chiudi al click sulla croce o sull'overlay scuro
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Chiudi con il tasto ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });
  }

});
