(function () {
  "use strict";

  var MM_PER_INCH = 25.4;
  var POINTS_PER_INCH = 72;
  var POINTS_PER_MM = POINTS_PER_INCH / MM_PER_INCH;
  var PREVIEW_PADDING = 28;
  var DEFAULT_STATUS_MESSAGE = "Sube un PDF o una imagen para comenzar. El MVP asume que las medidas editables son el tamaño final de corte.";
  var SHEET_PRESETS = {
    "330x480": { label: "330 x 480 mm", widthMm: 330, heightMm: 480 },
    sra3: { label: "SRA3", widthMm: 320, heightMm: 450 },
    a3: { label: "A3", widthMm: 297, heightMm: 420 },
    a4: { label: "A4", widthMm: 210, heightMm: 297 },
    carta: { label: "Carta", widthMm: 216, heightMm: 279 },
    oficio: { label: "Oficio", widthMm: 216, heightMm: 330 },
    tabloid: { label: "Tabloid", widthMm: 279.4, heightMm: 431.8 },
    custom: null
  };

  var state = {
    pages: [createDefaultPageState(1)],
    activePageIndex: 0,
    nextPageId: 2,
    syncLayoutAcrossPages: false,
    previewZoom: 1
  };
  var els = {};
  var modalState = {
    resolve: null
  };
  var dragState = {
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0
  };

  document.addEventListener("DOMContentLoaded", function () {
    applyAppChrome();

    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }

    bindElements();
    bindEvents();
    renderAll();
  });

  function applyAppChrome() {
    document.title = "Utilidad: Imposiciones de Tarjetas | Web Nifty";

    var description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute("content", "Utilidad para crear imposiciones y montajes base de tarjetas y piezas gráficas.");
    }

    var shell = document.querySelector(".shell");
    if (shell && !shell.querySelector(".utility-topbar")) {
      var topbar = document.createElement("div");
      topbar.className = "utility-topbar";

      var backLink = document.createElement("a");
      backLink.className = "back-link";
      backLink.href = "/";
      backLink.textContent = "Volver al sitio";

      topbar.appendChild(backLink);
      shell.insertBefore(topbar, shell.firstChild);
    }

    var eyebrow = document.querySelector(".hero-main .eyebrow");
    if (eyebrow) {
      eyebrow.textContent = "Web Nifty · Utilidades";
    }

    var heading = document.querySelector(".hero-main h1");
    if (heading) {
      heading.textContent = "Utilidad: Imposiciones de Tarjetas";
    }

    var heroCopy = document.querySelector(".hero-copy");
    if (heroCopy) {
      heroCopy.textContent = "Carga un PDF o una imagen, detecta sus medidas, ajusta la pieza, arma la grilla y exporta una imposición base con corte simple o corte doble para pruebas y producción gráfica.";
    }
  }

  function bindElements() {
    els.fileInput = document.getElementById("fileInput");
    els.fileType = document.getElementById("fileType");
    els.pageCount = document.getElementById("pageCount");
    els.fileName = document.getElementById("fileName");
    els.pageSelect = document.getElementById("pageSelect");
    els.pageSelectField = document.getElementById("pageSelectField");
    els.sourceTypeBadge = document.getElementById("sourceTypeBadge");
    els.applyLayoutToAll = document.getElementById("applyLayoutToAll");
    els.pageTabs = document.getElementById("pageTabs");
    els.pageTabsHint = document.getElementById("pageTabsHint");
    els.addPage = document.getElementById("addPage");
    els.removePage = document.getElementById("removePage");
    els.pieceWidth = document.getElementById("pieceWidth");
    els.pieceHeight = document.getElementById("pieceHeight");
    els.keepRatio = document.getElementById("keepRatio");
    els.imageDpi = document.getElementById("imageDpi");
    els.bleedMm = document.getElementById("bleedMm");
    els.resetDetectedSize = document.getElementById("resetDetectedSize");
    els.sheetPreset = document.getElementById("sheetPreset");
    els.sheetWidth = document.getElementById("sheetWidth");
    els.sheetHeight = document.getElementById("sheetHeight");
    els.unlockSpacing = document.getElementById("unlockSpacing");
    els.sheetMargin = document.getElementById("sheetMargin");
    els.sheetGap = document.getElementById("sheetGap");
    els.fillPage = document.getElementById("fillPage");
    els.exportPdf = document.getElementById("exportPdf");
    els.cols = document.getElementById("cols");
    els.rows = document.getElementById("rows");
    els.editCutMarks = document.getElementById("editCutMarks");
    els.cutMarksFields = document.getElementById("cutMarksFields");
    els.markOffset = document.getElementById("markOffset");
    els.markLength = document.getElementById("markLength");
    els.cutTypeInputs = Array.prototype.slice.call(document.querySelectorAll('input[name="cutType"]'));
    els.footprintValue = document.getElementById("footprintValue");
    els.totalPiecesValue = document.getElementById("totalPiecesValue");
    els.coverageValue = document.getElementById("coverageValue");
    els.statusMessage = document.getElementById("statusMessage");
    els.canvasWrap = document.querySelector(".canvas-wrap");
    els.previewCanvas = document.getElementById("previewCanvas");
    els.detectedSizeValue = document.getElementById("detectedSizeValue");
    els.usableAreaValue = document.getElementById("usableAreaValue");
    els.gridValue = document.getElementById("gridValue");
    els.fitValue = document.getElementById("fitValue");
    els.zoomOut = document.getElementById("zoomOut");
    els.zoomIn = document.getElementById("zoomIn");
    els.zoomValue = document.getElementById("zoomValue");
    els.modalBackdrop = document.getElementById("modalBackdrop");
    els.modalTitle = document.getElementById("modalTitle");
    els.modalBody = document.getElementById("modalBody");
    els.modalPrimary = document.getElementById("modalPrimary");
    els.modalSecondary = document.getElementById("modalSecondary");
  }

  function bindEvents() {
    els.fileInput.addEventListener("change", handleFileSelected);
    els.pageSelect.addEventListener("change", function (event) {
      var pageState = getActivePage();
      var pageNumber = clampInteger(readNumber(event.target.value, 1), 1, pageState.source.pageCount);
      pageState.source.pageIndex = pageNumber;
      if (pageState.source.kind === "pdf") {
        loadPdfPage(pageState, pageNumber, false, true);
      }
    });
    els.applyLayoutToAll.addEventListener("change", function () {
      state.syncLayoutAcrossPages = state.pages.length > 1 && !!els.applyLayoutToAll.checked;
      renderAll();
    });
    els.pageTabs.addEventListener("click", function (event) {
      var button = event.target.closest("[data-page-index]");
      if (button) {
        switchToPage(clampInteger(readNumber(button.getAttribute("data-page-index"), 0), 0, state.pages.length - 1));
      }
    });
    els.addPage.addEventListener("click", addBlankPage);
    els.removePage.addEventListener("click", removeActivePage);
    els.zoomOut.addEventListener("click", function () {
      adjustPreviewZoom(-0.25);
    });
    els.zoomIn.addEventListener("click", function () {
      adjustPreviewZoom(0.25);
    });
    els.modalPrimary.addEventListener("click", function () {
      closeModal("primary");
    });
    els.modalSecondary.addEventListener("click", function () {
      closeModal("secondary");
    });
    els.modalBackdrop.addEventListener("click", function (event) {
      if (event.target === els.modalBackdrop) {
        closeModal("dismiss");
      }
    });
    els.canvasWrap.addEventListener("mousedown", handlePreviewDragStart);
    els.pieceWidth.addEventListener("input", function () {
      var pageState = getActivePage();
      var nextWidth = Math.max(0, readNumber(els.pieceWidth.value, pageState.piece.widthMm));
      if (pageState.piece.keepRatio) {
        var ratio = getAspectRatio(pageState);
        pageState.piece.widthMm = nextWidth;
        pageState.piece.heightMm = nextWidth / ratio;
      } else {
        pageState.piece.widthMm = nextWidth;
      }
      renderAll();
    });
    els.pieceHeight.addEventListener("input", function () {
      var pageState = getActivePage();
      var nextHeight = Math.max(0, readNumber(els.pieceHeight.value, pageState.piece.heightMm));
      if (pageState.piece.keepRatio) {
        var ratio = getAspectRatio(pageState);
        pageState.piece.heightMm = nextHeight;
        pageState.piece.widthMm = nextHeight * ratio;
      } else {
        pageState.piece.heightMm = nextHeight;
      }
      renderAll();
    });
    els.keepRatio.addEventListener("change", function () {
      getActivePage().piece.keepRatio = !!els.keepRatio.checked;
      renderAll();
    });
    els.imageDpi.addEventListener("input", function () {
      var pageState = getActivePage();
      pageState.piece.imageDpi = Math.max(30, readNumber(els.imageDpi.value, 300));
      if (pageState.source.kind === "image") {
        updateImageDetectedSize(pageState);
        useDetectedPieceSize(pageState);
      } else {
        renderAll();
      }
    });
    els.bleedMm.addEventListener("input", function () {
      getActivePage().piece.bleedMm = Math.max(0, readNumber(els.bleedMm.value, 0));
      renderAll();
    });
    els.resetDetectedSize.addEventListener("click", function () {
      useDetectedPieceSize(getActivePage());
      setStatus("Se aplicó el tamaño detectado a la pieza editable.", "success");
    });
    els.sheetPreset.addEventListener("change", function () {
      var pageState = getActivePage();
      var presetKey = els.sheetPreset.value;
      pageState.sheet.preset = presetKey;
      if (SHEET_PRESETS[presetKey]) {
        pageState.sheet.widthMm = SHEET_PRESETS[presetKey].widthMm;
        pageState.sheet.heightMm = SHEET_PRESETS[presetKey].heightMm;
      }
      renderAll();
    });
    els.sheetWidth.addEventListener("input", function () {
      var pageState = getActivePage();
      pageState.sheet.widthMm = Math.max(0, readNumber(els.sheetWidth.value, pageState.sheet.widthMm));
      pageState.sheet.preset = "custom";
      renderAll();
    });
    els.sheetHeight.addEventListener("input", function () {
      var pageState = getActivePage();
      pageState.sheet.heightMm = Math.max(0, readNumber(els.sheetHeight.value, pageState.sheet.heightMm));
      pageState.sheet.preset = "custom";
      renderAll();
    });
    els.unlockSpacing.addEventListener("change", function () {
      getActivePage().sheet.spacingUnlocked = !!els.unlockSpacing.checked;
      renderAll();
    });
    els.sheetMargin.addEventListener("input", function () {
      getActivePage().sheet.marginMm = Math.max(0, readNumber(els.sheetMargin.value, getActivePage().sheet.marginMm));
      renderAll();
    });
    els.sheetGap.addEventListener("input", function () {
      getActivePage().sheet.gapMm = Math.max(0, readNumber(els.sheetGap.value, getActivePage().sheet.gapMm));
      renderAll();
    });
    els.cols.addEventListener("input", function () {
      getActivePage().layout.cols = clampInteger(readNumber(els.cols.value, getActivePage().layout.cols), 1, 999);
      renderAll();
    });
    els.rows.addEventListener("input", function () {
      getActivePage().layout.rows = clampInteger(readNumber(els.rows.value, getActivePage().layout.rows), 1, 999);
      renderAll();
    });
    els.editCutMarks.addEventListener("change", function () {
      getActivePage().marks.customEnabled = !!els.editCutMarks.checked;
      renderAll();
    });
    els.markOffset.addEventListener("input", function () {
      getActivePage().marks.offsetMm = Math.max(0, readNumber(els.markOffset.value, getActivePage().marks.offsetMm));
      renderAll();
    });
    els.markLength.addEventListener("input", function () {
      getActivePage().marks.lengthMm = Math.max(0.5, readNumber(els.markLength.value, getActivePage().marks.lengthMm));
      renderAll();
    });
    els.cutTypeInputs.forEach(function (input) {
      input.addEventListener("change", function () {
        if (input.checked) {
          getActivePage().layout.cutType = input.value;
          renderAll();
        }
      });
    });
    els.fillPage.addEventListener("click", function () {
      autofillGrid(getActivePage());
      renderAll();
      setStatus("Se recalculó la grilla para llenar la hoja con la huella actual.", "success");
    });
    els.exportPdf.addEventListener("click", function () {
      promptAndExportPdf().catch(function (error) {
        console.error(error);
        setStatus(error.message || "No se pudo completar la exportación.", "error");
      });
    });
    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeModal("dismiss");
      }
    });
    window.addEventListener("mousemove", handlePreviewDragMove);
    window.addEventListener("mouseup", handlePreviewDragEnd);
    window.addEventListener("resize", debounce(renderAll, 80));
  }

  function createDefaultPageState(id) {
    return {
      id: id,
      label: "Página " + id,
      source: {
        kind: "none",
        name: "",
        objectUrl: null,
        pdfDoc: null,
        previewAsset: null,
        fileBytes: null,
        fileMimeType: "",
        pageCount: 1,
        pageIndex: 1,
        naturalAspectRatio: 90 / 55,
        detectedWidthMm: 90,
        detectedHeightMm: 55,
        imagePixelWidth: 0,
        imagePixelHeight: 0
      },
      piece: {
        widthMm: 90,
        heightMm: 55,
        keepRatio: true,
        imageDpi: 300,
        bleedMm: 3
      },
      marks: {
        offsetMm: 3,
        lengthMm: 4,
        customEnabled: false
      },
      sheet: {
        preset: "330x480",
        widthMm: 330,
        heightMm: 480,
        marginMm: 8,
        gapMm: 0,
        spacingUnlocked: false
      },
      layout: {
        cols: 3,
        rows: 7,
        cutType: "simple"
      },
      status: {
        message: DEFAULT_STATUS_MESSAGE,
        tone: "neutral"
      },
      renderToken: 0
    };
  }

  function getActivePage() {
    return state.pages[state.activePageIndex];
  }

  function switchToPage(index) {
    state.activePageIndex = clampInteger(index, 0, state.pages.length - 1);
    renderAll();
  }

  function addBlankPage() {
    state.pages.push(createDefaultPageState(state.nextPageId));
    state.nextPageId += 1;
    syncPageLabels();
    state.activePageIndex = state.pages.length - 1;
    renderAll();
    setStatus("Se agregó una nueva pestaña lista para cargar otra página o archivo.", "success");
  }

  function removeActivePage() {
    if (state.pages.length <= 1) {
      return;
    }

    var removedPage = state.pages.splice(state.activePageIndex, 1)[0];
    clearSourceUrls(removedPage);
    state.activePageIndex = Math.max(0, Math.min(state.activePageIndex, state.pages.length - 1));
    syncPageLabels();
    renderAll();
    setStatus("Se eliminó la pestaña actual.", "success");
  }

  function ensurePagesCount(totalPages) {
    while (state.pages.length < totalPages) {
      state.pages.push(createDefaultPageState(state.nextPageId));
      state.nextPageId += 1;
    }
    syncPageLabels();
  }

  function syncPageLabels() {
    state.pages.forEach(function (pageState, index) {
      pageState.label = "Página " + (index + 1);
    });
  }

  function applyPageOneLayoutToAll() {
    if (!state.syncLayoutAcrossPages || state.pages.length < 2) {
      return;
    }
    var firstPage = state.pages[0];
    for (var index = 1; index < state.pages.length; index += 1) {
      state.pages[index].piece = clonePlainObject(firstPage.piece);
      state.pages[index].marks = clonePlainObject(firstPage.marks);
      state.pages[index].sheet = clonePlainObject(firstPage.sheet);
      state.pages[index].layout = clonePlainObject(firstPage.layout);
    }
  }

  function isLayoutEditingLocked() {
    return state.syncLayoutAcrossPages && state.pages.length > 1 && state.activePageIndex > 0;
  }

  async function handleFileSelected(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    var pageState = getActivePage();
    clearSourceUrls(pageState);
    setStatus("Procesando archivo fuente...", "neutral");

    try {
      if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
        await loadPdf(file, state.activePageIndex);
      } else if (file.type.indexOf("image/") === 0) {
        await loadImage(file, pageState);
        setStatus("Imagen cargada. El tamaño físico se calculó según el DPI configurado.", "success", pageState);
      } else {
        throw new Error("Formato no soportado. Usa PDF o imagen.");
      }
    } catch (error) {
      console.error(error);
      setStatus(error.message || "No se pudo cargar el archivo.", "error", pageState);
    }

    renderAll();
  }

  function clearSourceUrls(pageState) {
    if (pageState.source.objectUrl) {
      URL.revokeObjectURL(pageState.source.objectUrl);
      pageState.source.objectUrl = null;
    }
  }

  async function loadImage(file, pageState) {
    clearSourceUrls(pageState);
    var objectUrl = URL.createObjectURL(file);
    var image = await loadHtmlImage(objectUrl);
    var buffer = await file.arrayBuffer();
    var stableBytes = new Uint8Array(buffer.slice(0));

    pageState.source.kind = "image";
    pageState.source.name = file.name;
    pageState.source.objectUrl = objectUrl;
    pageState.source.pdfDoc = null;
    pageState.source.previewAsset = image;
    pageState.source.fileBytes = stableBytes;
    pageState.source.fileMimeType = file.type || "image/png";
    pageState.source.pageCount = 1;
    pageState.source.pageIndex = 1;
    pageState.source.imagePixelWidth = image.naturalWidth;
    pageState.source.imagePixelHeight = image.naturalHeight;
    pageState.source.naturalAspectRatio = image.naturalWidth / image.naturalHeight;
    updateImageDetectedSize(pageState);
    useDetectedPieceSize(pageState);
  }

  function updateImageDetectedSize(pageState) {
    if (!pageState.source.imagePixelWidth || !pageState.source.imagePixelHeight) {
      return;
    }
    pageState.source.detectedWidthMm = pixelsToMm(pageState.source.imagePixelWidth, pageState.piece.imageDpi);
    pageState.source.detectedHeightMm = pixelsToMm(pageState.source.imagePixelHeight, pageState.piece.imageDpi);
  }

  async function loadPdf(file, startIndex) {
    if (!window.pdfjsLib) {
      throw new Error("No se pudo cargar PDF.js. Verifica la conexión a internet para habilitar PDFs.");
    }

    var sourceBuffer = await file.arrayBuffer();
    var previewBytes = new Uint8Array(sourceBuffer.slice(0));
    var exportBytes = new Uint8Array(sourceBuffer.slice(0));
    var pdfDoc = await window.pdfjsLib.getDocument({ data: previewBytes }).promise;
    var createTabs = false;

    if (pdfDoc.numPages > 1) {
      createTabs = await openDecisionModal({
        title: "PDF multipágina detectado",
        body: "Este PDF tiene " + pdfDoc.numPages + " páginas. ¿Quieres crear pestañas automáticamente desde la actual? Se asignará una página del PDF a cada pestaña consecutiva.",
        primaryLabel: "Crear páginas",
        secondaryLabel: "Cargar solo la actual"
      });
    }

    if (createTabs) {
      await distributePdfAcrossPages(file.name, pdfDoc, exportBytes, startIndex);
      state.activePageIndex = startIndex;
      setStatus("Se prepararon " + pdfDoc.numPages + " pestañas a partir del PDF multipágina.", "success", state.pages[startIndex]);
      return;
    }

    await assignPdfToPage(state.pages[startIndex], file.name, pdfDoc, exportBytes, 1, true, true);
    setStatus("PDF cargado. Puedes elegir la página y ajustar el tamaño final de la pieza.", "success", state.pages[startIndex]);
  }

  async function distributePdfAcrossPages(fileName, pdfDoc, fileBytes, startIndex) {
    ensurePagesCount(startIndex + pdfDoc.numPages);
    for (var pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber += 1) {
      var targetPage = state.pages[startIndex + pageNumber - 1];
      clearSourceUrls(targetPage);
      await assignPdfToPage(targetPage, fileName, pdfDoc, fileBytes, pageNumber, true, false);
      setStatus("Se asignó la página " + pageNumber + " del PDF a esta pestaña.", "success", targetPage);
    }
  }

  async function assignPdfToPage(pageState, fileName, pdfDoc, fileBytes, pageNumber, applyDetectedSize, shouldRender) {
    pageState.source.kind = "pdf";
    pageState.source.name = fileName;
    pageState.source.pdfDoc = pdfDoc;
    pageState.source.previewAsset = null;
    pageState.source.fileBytes = fileBytes;
    pageState.source.fileMimeType = "application/pdf";
    pageState.source.pageCount = pdfDoc.numPages;
    pageState.source.pageIndex = pageNumber;
    pageState.source.imagePixelWidth = 0;
    pageState.source.imagePixelHeight = 0;
    pageState.source.objectUrl = null;

    await loadPdfPage(pageState, pageNumber, applyDetectedSize, shouldRender);
  }

  async function loadPdfPage(pageState, pageNumber, applyDetectedSize, shouldRender) {
    if (!pageState.source.pdfDoc) {
      return;
    }

    var token = ++pageState.renderToken;
    var page = await pageState.source.pdfDoc.getPage(pageNumber);
    var viewport = page.getViewport({ scale: 1 });
    var scale = 1400 / Math.max(viewport.width, viewport.height);
    var renderViewport = page.getViewport({ scale: Math.max(scale, 1) });
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    canvas.width = Math.ceil(renderViewport.width);
    canvas.height = Math.ceil(renderViewport.height);
    await page.render({ canvasContext: context, viewport: renderViewport }).promise;

    if (token !== pageState.renderToken) {
      return;
    }

    pageState.source.previewAsset = canvas;
    pageState.source.naturalAspectRatio = viewport.width / viewport.height;
    pageState.source.detectedWidthMm = pointsToMm(viewport.width);
    pageState.source.detectedHeightMm = pointsToMm(viewport.height);

    if (applyDetectedSize) {
      pageState.piece.widthMm = pageState.source.detectedWidthMm;
      pageState.piece.heightMm = pageState.source.detectedHeightMm;
    }

    if (shouldRender && getActivePage() === pageState) {
      renderAll();
    }
  }

  function useDetectedPieceSize(pageState) {
    pageState.piece.widthMm = pageState.source.detectedWidthMm;
    pageState.piece.heightMm = pageState.source.detectedHeightMm;
    renderAll();
  }

  function getAspectRatio(pageState) {
    if (pageState.source.naturalAspectRatio > 0) {
      return pageState.source.naturalAspectRatio;
    }
    return pageState.piece.widthMm / Math.max(pageState.piece.heightMm, 0.001);
  }

  function renderAll() {
    if (state.syncLayoutAcrossPages && state.pages.length > 1) {
      applyPageOneLayoutToAll();
    }
    syncInputsFromState();
    var pageState = getActivePage();
    var layout = computeLayout(pageState);
    updateStats(pageState, layout);
    drawPreview(pageState, layout);
  }

  function syncInputsFromState() {
    var pageState = getActivePage();
    var layoutLocked = isLayoutEditingLocked();

    els.fileInput.value = "";
    els.fileType.value = sourceTypeLabel(pageState);
    els.pageCount.value = pageState.source.kind === "none" ? "-" : String(pageState.source.pageCount);
    els.fileName.value = pageState.source.name || "-";
    els.sourceTypeBadge.textContent = pageState.source.kind === "none" ? "Sin archivo" : sourceTypeLabel(pageState);
    els.pageSelectField.classList.toggle("hidden", pageState.source.kind !== "pdf");
    syncPageSelect(pageState);
    syncTabsUi();

    els.pieceWidth.value = formatInputNumber(pageState.piece.widthMm);
    els.pieceHeight.value = formatInputNumber(pageState.piece.heightMm);
    els.keepRatio.checked = pageState.piece.keepRatio;
    els.imageDpi.value = formatInputNumber(pageState.piece.imageDpi, 0);
    els.bleedMm.value = formatInputNumber(pageState.piece.bleedMm);
    els.sheetPreset.value = pageState.sheet.preset;
    els.sheetWidth.value = formatInputNumber(pageState.sheet.widthMm);
    els.sheetHeight.value = formatInputNumber(pageState.sheet.heightMm);
    els.unlockSpacing.checked = pageState.sheet.spacingUnlocked;
    els.sheetMargin.value = formatInputNumber(pageState.sheet.marginMm);
    els.sheetGap.value = formatInputNumber(pageState.sheet.gapMm);
    els.cols.value = String(pageState.layout.cols);
    els.rows.value = String(pageState.layout.rows);
    els.editCutMarks.checked = !!pageState.marks.customEnabled;
    els.cutMarksFields.classList.toggle("hidden", !pageState.marks.customEnabled);
    els.markOffset.value = formatInputNumber(pageState.marks.offsetMm);
    els.markLength.value = formatInputNumber(pageState.marks.lengthMm);
    els.detectedSizeValue.textContent = formatSize(pageState.source.detectedWidthMm, pageState.source.detectedHeightMm);
    els.statusMessage.textContent = pageState.status.message;
    els.statusMessage.className = "status " + pageState.status.tone;
    els.exportPdf.textContent = state.pages.length > 1 ? "Exportar (" + state.pages.length + " páginas)" : "Exportar";
    els.zoomValue.textContent = Math.round(state.previewZoom * 100) + "%";
    els.applyLayoutToAll.disabled = state.pages.length < 2;
    els.applyLayoutToAll.checked = state.syncLayoutAcrossPages && state.pages.length > 1;
    els.removePage.classList.toggle("hidden", state.pages.length < 2);
    els.removePage.disabled = state.pages.length < 2;

    setDisabled([
      els.pieceWidth,
      els.pieceHeight,
      els.keepRatio,
      els.imageDpi,
      els.bleedMm,
      els.resetDetectedSize,
      els.sheetPreset,
      els.sheetWidth,
      els.sheetHeight,
      els.unlockSpacing,
      els.sheetMargin,
      els.sheetGap,
      els.cols,
      els.rows,
      els.editCutMarks,
      els.markOffset,
      els.markLength,
      els.fillPage
    ], layoutLocked);

    els.sheetMargin.disabled = layoutLocked || !pageState.sheet.spacingUnlocked;
    els.sheetGap.disabled = layoutLocked || !pageState.sheet.spacingUnlocked;
    els.markOffset.disabled = layoutLocked || !pageState.marks.customEnabled;
    els.markLength.disabled = layoutLocked || !pageState.marks.customEnabled;
    els.cutTypeInputs.forEach(function (input) {
      input.checked = input.value === pageState.layout.cutType;
      input.disabled = layoutLocked;
    });
  }

  function syncPageSelect(pageState) {
    if (pageState.source.kind !== "pdf") {
      els.pageSelect.innerHTML = "";
      return;
    }

    if (els.pageSelect.options.length !== pageState.source.pageCount) {
      var optionsHtml = "";
      for (var pageIndex = 1; pageIndex <= pageState.source.pageCount; pageIndex += 1) {
        optionsHtml += '<option value="' + pageIndex + '">Página ' + pageIndex + "</option>";
      }
      els.pageSelect.innerHTML = optionsHtml;
    }

    els.pageSelect.value = String(pageState.source.pageIndex);
  }

  function syncTabsUi() {
    els.pageTabs.innerHTML = state.pages.map(function (pageState, index) {
      var classes = index === state.activePageIndex ? "tab-button is-active" : "tab-button";
      return '<button type="button" class="' + classes + '" data-page-index="' + index + '">' + pageState.label + "</button>";
    }).join("");
    els.pageTabsHint.textContent = buildTabsHint();
  }

  function buildTabsHint() {
    if (state.pages.length === 1) {
      return "Trabaja por pestañas para crear un montaje multipágina.";
    }
    if (state.syncLayoutAcrossPages) {
      return "La configuración de la Página 1 se replica a todas las demás. En otras pestañas solo cambias el contenido.";
    }
    return "Cada pestaña puede tener su propio montaje y su propia fuente.";
  }

  function adjustPreviewZoom(delta) {
    var wrap = els.canvasWrap;
    var previousZoom = state.previewZoom;
    var nextZoom = clampNumber(state.previewZoom + delta, 1, 3);
    var centerX = wrap.scrollLeft + wrap.clientWidth / 2;
    var centerY = wrap.scrollTop + wrap.clientHeight / 2;

    if (nextZoom === previousZoom) {
      return;
    }

    state.previewZoom = nextZoom;
    renderAll();

    var scaleRatio = nextZoom / previousZoom;
    wrap.scrollLeft = Math.max(centerX * scaleRatio - wrap.clientWidth / 2, 0);
    wrap.scrollTop = Math.max(centerY * scaleRatio - wrap.clientHeight / 2, 0);
  }

  function handlePreviewDragStart(event) {
    if (event.button !== 0) {
      return;
    }

    dragState.active = true;
    dragState.startX = event.clientX;
    dragState.startY = event.clientY;
    dragState.scrollLeft = els.canvasWrap.scrollLeft;
    dragState.scrollTop = els.canvasWrap.scrollTop;
    els.canvasWrap.classList.add("is-dragging");
    event.preventDefault();
  }

  function handlePreviewDragMove(event) {
    if (!dragState.active) {
      return;
    }

    els.canvasWrap.scrollLeft = dragState.scrollLeft - (event.clientX - dragState.startX);
    els.canvasWrap.scrollTop = dragState.scrollTop - (event.clientY - dragState.startY);
  }

  function handlePreviewDragEnd() {
    if (!dragState.active) {
      return;
    }

    dragState.active = false;
    els.canvasWrap.classList.remove("is-dragging");
  }

  function openDecisionModal(options) {
    return openActionModal(options).then(function (result) {
      return result === "primary";
    });
  }

  function openActionModal(options) {
    return new Promise(function (resolve) {
      modalState.resolve = resolve;
      els.modalTitle.textContent = options.title || "Aviso";
      if (options.bodyHtml) {
        els.modalBody.innerHTML = options.bodyHtml;
      } else {
        els.modalBody.textContent = options.body || "";
      }
      els.modalPrimary.textContent = options.primaryLabel || "Aceptar";
      els.modalSecondary.textContent = options.secondaryLabel || "Cancelar";
      els.modalSecondary.classList.toggle("hidden", options.secondaryLabel === null);
      els.modalBackdrop.classList.remove("hidden");
      els.modalBackdrop.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    });
  }

  function closeModal(result) {
    if (!modalState.resolve) {
      return;
    }

    var resolve = modalState.resolve;
    modalState.resolve = null;
    els.modalBackdrop.classList.add("hidden");
    els.modalBackdrop.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    resolve(result);
  }

  function computeLayout(pageState) {
    var gapMm = getEffectiveGapMm(pageState);
    var bleedMm = pageState.layout.cutType === "double" ? pageState.piece.bleedMm : 0;
    var footprintWidthMm = pageState.piece.widthMm + bleedMm * 2;
    var footprintHeightMm = pageState.piece.heightMm + bleedMm * 2;
    var usableWidthMm = Math.max(pageState.sheet.widthMm - pageState.sheet.marginMm * 2, 0);
    var usableHeightMm = Math.max(pageState.sheet.heightMm - pageState.sheet.marginMm * 2, 0);
    var gridWidthMm = pageState.layout.cols * footprintWidthMm + Math.max(0, pageState.layout.cols - 1) * gapMm;
    var gridHeightMm = pageState.layout.rows * footprintHeightMm + Math.max(0, pageState.layout.rows - 1) * gapMm;
    var offsetXMm = pageState.sheet.marginMm + Math.max((usableWidthMm - gridWidthMm) / 2, 0);
    var offsetYMm = pageState.sheet.marginMm + Math.max((usableHeightMm - gridHeightMm) / 2, 0);
    var totalPieces = pageState.layout.cols * pageState.layout.rows;
    var fits = gridWidthMm <= usableWidthMm && gridHeightMm <= usableHeightMm;
    var coverage = pageState.sheet.widthMm * pageState.sheet.heightMm > 0 ? (gridWidthMm * gridHeightMm) / (pageState.sheet.widthMm * pageState.sheet.heightMm) : 0;

    return {
      bleedMm: bleedMm,
      footprintWidthMm: footprintWidthMm,
      footprintHeightMm: footprintHeightMm,
      usableWidthMm: usableWidthMm,
      usableHeightMm: usableHeightMm,
      gridWidthMm: gridWidthMm,
      gridHeightMm: gridHeightMm,
      offsetXMm: offsetXMm,
      offsetYMm: offsetYMm,
      gapMm: gapMm,
      totalPieces: totalPieces,
      fits: fits,
      coverage: coverage
    };
  }

  function updateStats(pageState, layout) {
    els.footprintValue.textContent = formatSize(layout.footprintWidthMm, layout.footprintHeightMm);
    els.totalPiecesValue.textContent = String(layout.totalPieces);
    els.coverageValue.textContent = Math.round(layout.coverage * 100) + "%";
    els.usableAreaValue.textContent = formatSize(layout.usableWidthMm, layout.usableHeightMm);
    els.gridValue.textContent = pageState.layout.cols + " x " + pageState.layout.rows;
    els.fitValue.textContent = layout.fits ? "Cabe" : "Excede";
    els.fitValue.style.color = layout.fits ? "var(--success)" : "var(--danger)";
  }

  function drawPreview(pageState, layout) {
    var canvas = els.previewCanvas;
    var ratio = window.devicePixelRatio || 1;
    var viewportWidth = els.canvasWrap.clientWidth || 900;
    var viewportHeight = els.canvasWrap.clientHeight || 620;
    var cssWidth = Math.max(viewportWidth * state.previewZoom, viewportWidth);
    var cssHeight = Math.max(viewportHeight * state.previewZoom, viewportHeight);

    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";
    canvas.width = Math.floor(cssWidth * ratio);
    canvas.height = Math.floor(cssHeight * ratio);

    var context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, cssWidth, cssHeight);

    var scene = createScene(pageState, cssWidth, cssHeight, layout);
    drawScene(context, scene, layout, pageState, { withBackdrop: true });
  }

  function createScene(pageState, widthPx, heightPx, layout) {
    var scale = Math.min(
      (widthPx - PREVIEW_PADDING * 2) / Math.max(pageState.sheet.widthMm, 1),
      (heightPx - PREVIEW_PADDING * 2) / Math.max(pageState.sheet.heightMm, 1)
    );
    var sheetWidthPx = pageState.sheet.widthMm * scale;
    var sheetHeightPx = pageState.sheet.heightMm * scale;
    return {
      scale: scale,
      widthPx: widthPx,
      heightPx: heightPx,
      sheetX: (widthPx - sheetWidthPx) / 2,
      sheetY: (heightPx - sheetHeightPx) / 2,
      sheetWidthPx: sheetWidthPx,
      sheetHeightPx: sheetHeightPx,
      marginPx: pageState.sheet.marginMm * scale,
      footprintWidthPx: layout.footprintWidthMm * scale,
      footprintHeightPx: layout.footprintHeightMm * scale,
      trimWidthPx: pageState.piece.widthMm * scale,
      trimHeightPx: pageState.piece.heightMm * scale,
      bleedPx: layout.bleedMm * scale
    };
  }

  function drawScene(context, scene, layout, pageState, options) {
    if (!options || options.withBackdrop !== false) {
      drawPreviewBackdrop(context, scene.widthPx, scene.heightPx);
    }

    context.save();
    context.fillStyle = "#ffffff";
    context.strokeStyle = layout.fits ? "rgba(22, 22, 22, 0.85)" : "rgba(155, 48, 48, 0.95)";
    context.lineWidth = 1.5;
    roundRect(context, scene.sheetX, scene.sheetY, scene.sheetWidthPx, scene.sheetHeightPx, 14);
    context.fill();
    if (!options || options.withSheetBorder !== false) {
      context.stroke();
    }
    if (!options || options.withSheetMargin !== false) {
      drawSheetMargin(context, scene, layout);
    }

    for (var row = 0; row < pageState.layout.rows; row += 1) {
      for (var col = 0; col < pageState.layout.cols; col += 1) {
        var originX = scene.sheetX + (layout.offsetXMm + col * (layout.footprintWidthMm + layout.gapMm)) * scene.scale;
        var originY = scene.sheetY + (layout.offsetYMm + row * (layout.footprintHeightMm + layout.gapMm)) * scene.scale;
        drawPiece(context, scene, layout, pageState, originX, originY, options);
      }
    }

    if (pageState.layout.cutType === "simple") {
      drawSimpleCutGrid(context, scene, layout, pageState, options);
    } else {
      drawDoubleCutOuterMarks(context, scene, layout, pageState);
    }

    if (!layout.fits) {
      context.fillStyle = "rgba(155, 48, 48, 0.08)";
      roundRect(context, scene.sheetX, scene.sheetY, scene.sheetWidthPx, scene.sheetHeightPx, 14);
      context.fill();
    }
    context.restore();
  }

  function drawPreviewBackdrop(context, widthPx, heightPx) {
    var background = context.createLinearGradient(0, 0, widthPx, heightPx);
    background.addColorStop(0, "#2f2b2a");
    background.addColorStop(1, "#161413");
    context.fillStyle = background;
    context.fillRect(0, 0, widthPx, heightPx);

    context.save();
    context.strokeStyle = "rgba(255,255,255,0.06)";
    context.lineWidth = 1;
    for (var x = 0; x < widthPx; x += 32) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, heightPx);
      context.stroke();
    }
    for (var y = 0; y < heightPx; y += 32) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(widthPx, y);
      context.stroke();
    }
    context.restore();
  }

  function drawSheetMargin(context, scene, layout) {
    context.save();
    context.setLineDash([6, 6]);
    context.strokeStyle = "rgba(56, 74, 91, 0.3)";
    context.lineWidth = 1;
    context.strokeRect(scene.sheetX + scene.marginPx, scene.sheetY + scene.marginPx, layout.usableWidthMm * scene.scale, layout.usableHeightMm * scene.scale);
    context.restore();
  }

  function drawPiece(context, scene, layout, pageState, originX, originY, options) {
    var trimX = originX + scene.bleedPx;
    var trimY = originY + scene.bleedPx;

    if (pageState.layout.cutType === "double" && scene.bleedPx > 0) {
      context.fillStyle = "rgba(197, 37, 37, 0.28)";
      context.fillRect(originX, originY, scene.footprintWidthPx, scene.footprintHeightPx);
    }

    if (pageState.source.previewAsset) {
      var targetX = pageState.layout.cutType === "double" ? originX : trimX;
      var targetY = pageState.layout.cutType === "double" ? originY : trimY;
      var targetWidth = pageState.layout.cutType === "double" ? scene.footprintWidthPx : scene.trimWidthPx;
      var targetHeight = pageState.layout.cutType === "double" ? scene.footprintHeightPx : scene.trimHeightPx;
      drawSourceAsset(context, pageState.source.previewAsset, targetX, targetY, targetWidth, targetHeight);
    } else {
      context.fillStyle = "rgba(185, 91, 44, 0.08)";
      context.fillRect(trimX, trimY, scene.trimWidthPx, scene.trimHeightPx);
    }

    if (pageState.layout.cutType === "double" && (!options || options.withTrimOutline !== false)) {
      context.save();
      context.strokeStyle = "#101010";
      context.lineWidth = 1.2;
      context.strokeRect(trimX, trimY, scene.trimWidthPx, scene.trimHeightPx);
      context.restore();
    }
  }

  function drawSimpleCutGrid(context, scene, layout, pageState, options) {
    var grid = getSimpleCutGrid(scene, layout, pageState);
    var mark = getMarkLengthPx(scene, pageState, 10, 20, 0.75);
    var offset = pageState.marks.offsetMm * scene.scale;

    if (!options || options.withCutGrid !== false) {
      context.save();
      context.strokeStyle = "#101010";
      context.lineWidth = 1.1;
      grid.verticals.forEach(function (x) {
        context.beginPath();
        context.moveTo(x, grid.top);
        context.lineTo(x, grid.bottom);
        context.stroke();
      });
      grid.horizontals.forEach(function (y) {
        context.beginPath();
        context.moveTo(grid.left, y);
        context.lineTo(grid.right, y);
        context.stroke();
      });
      context.restore();
    }

    context.save();
    context.strokeStyle = "#1f2732";
    context.lineWidth = 1;
    grid.verticals.forEach(function (x) {
      context.beginPath();
      context.moveTo(x, grid.top - offset - mark);
      context.lineTo(x, grid.top - offset);
      context.moveTo(x, grid.bottom + offset);
      context.lineTo(x, grid.bottom + offset + mark);
      context.stroke();
    });
    grid.horizontals.forEach(function (y) {
      context.beginPath();
      context.moveTo(grid.left - offset - mark, y);
      context.lineTo(grid.left - offset, y);
      context.moveTo(grid.right + offset, y);
      context.lineTo(grid.right + offset + mark, y);
      context.stroke();
    });
    context.restore();
  }

  function getSimpleCutGrid(scene, layout, pageState) {
    var left = scene.sheetX + (layout.offsetXMm + scene.bleedPx / scene.scale) * scene.scale;
    var top = scene.sheetY + (layout.offsetYMm + scene.bleedPx / scene.scale) * scene.scale;
    var stepX = (layout.footprintWidthMm + layout.gapMm) * scene.scale;
    var stepY = (layout.footprintHeightMm + layout.gapMm) * scene.scale;
    var verticals = [];
    var horizontals = [];
    var col;
    var row;

    for (col = 0; col < pageState.layout.cols; col += 1) {
      var pieceLeft = left + col * stepX;
      verticals.push(pieceLeft);
      verticals.push(pieceLeft + scene.trimWidthPx);
    }
    for (row = 0; row < pageState.layout.rows; row += 1) {
      var pieceTop = top + row * stepY;
      horizontals.push(pieceTop);
      horizontals.push(pieceTop + scene.trimHeightPx);
    }

    verticals = dedupePositions(verticals);
    horizontals = dedupePositions(horizontals);
    return {
      left: verticals[0],
      right: verticals[verticals.length - 1],
      top: horizontals[0],
      bottom: horizontals[horizontals.length - 1],
      verticals: verticals,
      horizontals: horizontals
    };
  }

  function drawSourceAsset(context, asset, x, y, width, height) {
    var sourceWidth = asset.naturalWidth || asset.width;
    var sourceHeight = asset.naturalHeight || asset.height;
    var targetRatio = width / height;
    var sourceRatio = sourceWidth / sourceHeight;
    var drawWidth = sourceWidth;
    var drawHeight = sourceHeight;
    var sourceX = 0;
    var sourceY = 0;

    if (sourceRatio > targetRatio) {
      drawWidth = sourceHeight * targetRatio;
      sourceX = (sourceWidth - drawWidth) / 2;
    } else {
      drawHeight = sourceWidth / targetRatio;
      sourceY = (sourceHeight - drawHeight) / 2;
    }

    context.drawImage(asset, sourceX, sourceY, drawWidth, drawHeight, x, y, width, height);
  }

  function getMarkLengthPx(scene, pageState, minPx, maxPx, marginFactor) {
    if (pageState.marks.customEnabled) {
      return Math.max(pageState.marks.lengthMm * scene.scale, 1);
    }

    return Math.max(minPx, Math.min(maxPx, scene.marginPx * marginFactor || 12));
  }

  function drawDoubleCutOuterMarks(context, scene, layout, pageState) {
    var grid = getDoubleCutGrid(scene, layout, pageState);
    var mark = getMarkLengthPx(scene, pageState, 10, 24, 0.9);
    var offset = pageState.marks.offsetMm * scene.scale;

    context.save();
    context.strokeStyle = "#1f2732";
    context.lineWidth = 1;
    grid.verticals.forEach(function (x) {
      context.beginPath();
      context.moveTo(x, grid.topOuter - offset - mark);
      context.lineTo(x, grid.topOuter - offset);
      context.moveTo(x, grid.bottomOuter + offset);
      context.lineTo(x, grid.bottomOuter + offset + mark);
      context.stroke();
    });
    grid.horizontals.forEach(function (y) {
      context.beginPath();
      context.moveTo(grid.leftOuter - offset - mark, y);
      context.lineTo(grid.leftOuter - offset, y);
      context.moveTo(grid.rightOuter + offset, y);
      context.lineTo(grid.rightOuter + offset + mark, y);
      context.stroke();
    });
    context.restore();
  }

  function getDoubleCutGrid(scene, layout, pageState) {
    var bleedLeft = scene.sheetX + layout.offsetXMm * scene.scale;
    var bleedTop = scene.sheetY + layout.offsetYMm * scene.scale;
    var stepX = (layout.footprintWidthMm + layout.gapMm) * scene.scale;
    var stepY = (layout.footprintHeightMm + layout.gapMm) * scene.scale;
    var verticals = [];
    var horizontals = [];
    var col;
    var row;

    for (col = 0; col < pageState.layout.cols; col += 1) {
      var pieceBleedLeft = bleedLeft + col * stepX;
      verticals.push(pieceBleedLeft + scene.bleedPx);
      verticals.push(pieceBleedLeft + scene.bleedPx + scene.trimWidthPx);
    }
    for (row = 0; row < pageState.layout.rows; row += 1) {
      var pieceBleedTop = bleedTop + row * stepY;
      horizontals.push(pieceBleedTop + scene.bleedPx);
      horizontals.push(pieceBleedTop + scene.bleedPx + scene.trimHeightPx);
    }

    return {
      leftOuter: bleedLeft,
      rightOuter: bleedLeft + layout.gridWidthMm * scene.scale,
      topOuter: bleedTop,
      bottomOuter: bleedTop + layout.gridHeightMm * scene.scale,
      verticals: dedupePositions(verticals),
      horizontals: dedupePositions(horizontals)
    };
  }

  function autofillGrid(pageState) {
    var layout = computeLayout(pageState);
    pageState.layout.cols = Math.max(1, Math.floor((layout.usableWidthMm + layout.gapMm) / Math.max(layout.footprintWidthMm + layout.gapMm, 0.001)));
    pageState.layout.rows = Math.max(1, Math.floor((layout.usableHeightMm + layout.gapMm) / Math.max(layout.footprintHeightMm + layout.gapMm, 0.001)));
  }

  function getFirstOverflowPageIndex() {
    for (var index = 0; index < state.pages.length; index += 1) {
      if (!computeLayout(state.pages[index]).fits) {
        return index;
      }
    }

    return -1;
  }

  async function confirmOverflowExportIfNeeded() {
    var overflowIndex = getFirstOverflowPageIndex();
    if (overflowIndex < 0) {
      return true;
    }

    state.activePageIndex = overflowIndex;
    renderAll();

    var decision = await openActionModal({
      title: "El montaje excede los márgenes",
      bodyHtml:
        '<div class="modal-option-list">' +
          '<p class="modal-estimate-note">La ' + state.pages[overflowIndex].label + ' excede el área útil definida por los márgenes de hoja.</p>' +
          '<p class="modal-estimate-note">Puedes volver a editar o exportar de todas maneras. La impresora final puede gestionar ese margen según su pinza o su modo de impresión.</p>' +
        "</div>",
      primaryLabel: "Exportar de todas maneras",
      secondaryLabel: "Volver a editar"
    });

    if (decision === "primary") {
      setStatus("Se exportará aunque el montaje exceda los márgenes configurados.", "warning");
      return true;
    }

    setStatus("Ajusta filas, columnas, márgenes o hoja antes de exportar.", "warning");
    return false;
  }

  async function promptAndExportPdf() {
    if (!await confirmOverflowExportIfNeeded()) {
      return;
    }

    var estimates = getExportEstimates();
    var rasterWarning = estimates.rasterBytes > 25 * 1024 * 1024
      ? '<div class="modal-warning"><strong>Advertencia:</strong> el rasterizado tendrá un archivo muy pesado. Estimado: ' + formatBytes(estimates.rasterBytes) + ".</div>"
      : "";
    var selection = await openActionModal({
      title: "Elegir formato de exportación",
      bodyHtml:
        '<div class="modal-option-list">' +
          '<div class="modal-option-item">' +
            '<strong>Vectorial</strong>' +
            '<p>Menor peso. Reutiliza el PDF fuente cuando el origen es PDF.</p>' +
            '<span>Estimado: ' + formatBytes(estimates.vectorBytes) + '.</span>' +
          "</div>" +
          '<div class="modal-option-item">' +
            '<strong>Rasterizado</strong>' +
            '<p>Conserva apariencia completa, pero genera archivos mucho más pesados.</p>' +
            '<span>Estimado: ' + formatBytes(estimates.rasterBytes) + '.</span>' +
          "</div>" +
          '<p class="modal-estimate-note">Peso estimado, puede variar según el contenido real del documento.</p>' +
          rasterWarning +
        "</div>",
      primaryLabel: "Exportar vectorial",
      secondaryLabel: "Exportar rasterizado"
    });

    if (selection === "primary") {
      await exportCurrentLayoutToVectorPdf();
      return;
    }

    if (selection === "secondary") {
      exportCurrentLayoutToPdf();
    }
  }

  function getExportEstimates() {
    var uniqueSources = {};
    var vectorBytes = 0;
    var rasterBytes = 0;

    state.pages.forEach(function (pageState) {
      var rasterWidth = Math.ceil(pageState.sheet.widthMm * 6);
      var rasterHeight = Math.ceil(pageState.sheet.heightMm * 6);
      rasterBytes += Math.round(rasterWidth * rasterHeight * 4 * 0.98);

      if (pageState.source.fileBytes && pageState.source.name) {
        var sourceKey = pageState.source.kind + ":" + pageState.source.name + ":" + pageState.source.pageCount + ":" + pageState.source.fileBytes.byteLength;
        if (!uniqueSources[sourceKey]) {
          uniqueSources[sourceKey] = true;
          vectorBytes += pageState.source.fileBytes.byteLength;
        }
      }
    });

    vectorBytes += state.pages.length * 25000;

    return {
      rasterBytes: rasterBytes,
      vectorBytes: vectorBytes
    };
  }

  function exportCurrentLayoutToPdf() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      setStatus("No se pudo cargar jsPDF. Verifica conexión a internet para exportar PDF.", "error");
      return;
    }

    setStatus(state.pages.length > 1 ? "Generando PDF rasterizado multipágina..." : "Generando PDF rasterizado...", "neutral");

    var JsPdf = window.jspdf.jsPDF;
    var firstPage = state.pages[0];
    var doc = new JsPdf({
      orientation: firstPage.sheet.widthMm >= firstPage.sheet.heightMm ? "landscape" : "portrait",
      unit: "mm",
      format: [firstPage.sheet.widthMm, firstPage.sheet.heightMm]
    });

    state.pages.forEach(function (pageState, index) {
      var layout = computeLayout(pageState);
      var exportScale = 6;
      var exportCanvas = document.createElement("canvas");
      var exportScene = {
        scale: exportScale,
        widthPx: Math.ceil(pageState.sheet.widthMm * exportScale),
        heightPx: Math.ceil(pageState.sheet.heightMm * exportScale),
        sheetX: 0,
        sheetY: 0,
        sheetWidthPx: Math.ceil(pageState.sheet.widthMm * exportScale),
        sheetHeightPx: Math.ceil(pageState.sheet.heightMm * exportScale),
        marginPx: pageState.sheet.marginMm * exportScale,
        footprintWidthPx: layout.footprintWidthMm * exportScale,
        footprintHeightPx: layout.footprintHeightMm * exportScale,
        trimWidthPx: pageState.piece.widthMm * exportScale,
        trimHeightPx: pageState.piece.heightMm * exportScale,
        bleedPx: layout.bleedMm * exportScale
      };
      exportCanvas.width = exportScene.widthPx;
      exportCanvas.height = exportScene.heightPx;

      var exportContext = exportCanvas.getContext("2d");
      exportContext.fillStyle = "#ffffff";
      exportContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      drawScene(exportContext, exportScene, layout, pageState, {
        withBackdrop: false,
        withSheetBorder: false,
        withSheetMargin: false,
        withTrimOutline: false,
        withCutGrid: false
      });

      if (index > 0) {
        doc.addPage([pageState.sheet.widthMm, pageState.sheet.heightMm], pageState.sheet.widthMm >= pageState.sheet.heightMm ? "landscape" : "portrait");
      }

      doc.addImage(exportCanvas.toDataURL("image/png"), "PNG", 0, 0, pageState.sheet.widthMm, pageState.sheet.heightMm);
    });

    doc.save(buildExportName("raster"));
    setStatus(state.pages.length > 1 ? "PDF multipágina exportado. Revisa cada hoja antes de producción." : "PDF exportado. Revisa el archivo descargado para validar medidas y marcas.", "success");
  }

  async function exportCurrentLayoutToVectorPdf() {
    if (!window.PDFLib || !window.PDFLib.PDFDocument) {
      setStatus("No se pudo cargar el motor vectorial. Verifica conexión a internet para exportar PDF vectorial.", "error");
      return;
    }

    setStatus(state.pages.length > 1 ? "Generando PDF vectorial multipágina..." : "Generando PDF vectorial...", "neutral");

    var PDFLib = window.PDFLib;
    var outputPdf = await PDFLib.PDFDocument.create();

    for (var pageIndex = 0; pageIndex < state.pages.length; pageIndex += 1) {
      var pageState = state.pages[pageIndex];
      var layout = computeLayout(pageState);
      var pdfPage = outputPdf.addPage([
        mmToPoints(pageState.sheet.widthMm),
        mmToPoints(pageState.sheet.heightMm)
      ]);
      var asset = await getVectorSourceAsset(outputPdf, pageState);

      drawVectorLayoutPage(pdfPage, pageState, layout, asset, PDFLib);
    }

    saveBytesAsFile(await outputPdf.save(), buildExportName("vector"));
    setStatus(
      state.pages.length > 1
        ? "PDF vectorial multipágina exportado. Revisa compatibilidad visual antes de producción."
        : "PDF vectorial exportado. Revisa compatibilidad visual antes de producción.",
      "success"
    );
  }

  async function getVectorSourceAsset(outputPdf, pageState) {
    if (pageState.source.kind === "pdf" && pageState.source.fileBytes) {
      var embeddedPages = await outputPdf.embedPdf(pageState.source.fileBytes, [pageState.source.pageIndex - 1]);
      return {
        kind: "pdf",
        value: embeddedPages[0]
      };
    }

    if (pageState.source.kind === "image" && pageState.source.fileBytes) {
      var mimeType = (pageState.source.fileMimeType || "").toLowerCase();
      if (mimeType.indexOf("png") >= 0) {
        return {
          kind: "image",
          value: await outputPdf.embedPng(pageState.source.fileBytes)
        };
      }

      if (mimeType.indexOf("jpeg") >= 0 || mimeType.indexOf("jpg") >= 0) {
        return {
          kind: "image",
          value: await outputPdf.embedJpg(pageState.source.fileBytes)
        };
      }

      return {
        kind: "image",
        value: await outputPdf.embedPng(await renderAssetToPngBytes(pageState.source.previewAsset))
      };
    }

    return {
      kind: "none",
      value: null
    };
  }

  function drawVectorLayoutPage(pdfPage, pageState, layout, asset, PDFLib) {
    var row;
    var col;

    for (row = 0; row < pageState.layout.rows; row += 1) {
      for (col = 0; col < pageState.layout.cols; col += 1) {
        var originXmm = layout.offsetXMm + col * (layout.footprintWidthMm + layout.gapMm);
        var originYmm = layout.offsetYMm + row * (layout.footprintHeightMm + layout.gapMm);
        drawVectorPlacedAsset(pdfPage, pageState, layout, asset, originXmm, originYmm);
      }
    }

    if (pageState.layout.cutType === "simple") {
      drawVectorSimpleCutMarks(pdfPage, pageState, layout, PDFLib);
    } else {
      drawVectorDoubleCutMarks(pdfPage, pageState, layout, PDFLib);
    }
  }

  function drawVectorPlacedAsset(pdfPage, pageState, layout, asset, originXmm, originYmm) {
    if (!asset || !asset.value) {
      return;
    }

    var targetXmm = pageState.layout.cutType === "double" ? originXmm : originXmm + layout.bleedMm;
    var targetYmm = pageState.layout.cutType === "double" ? originYmm : originYmm + layout.bleedMm;
    var targetWidthMm = pageState.layout.cutType === "double" ? layout.footprintWidthMm : pageState.piece.widthMm;
    var targetHeightMm = pageState.layout.cutType === "double" ? layout.footprintHeightMm : pageState.piece.heightMm;
    var drawOptions = {
      x: mmToPoints(targetXmm),
      y: bottomFromTopMm(pageState.sheet.heightMm, targetYmm, targetHeightMm),
      width: mmToPoints(targetWidthMm),
      height: mmToPoints(targetHeightMm)
    };

    if (asset.kind === "pdf") {
      pdfPage.drawPage(asset.value, drawOptions);
      return;
    }

    pdfPage.drawImage(asset.value, drawOptions);
  }

  function drawVectorSimpleCutMarks(pdfPage, pageState, layout, PDFLib) {
    var grid = getSimpleCutGridMm(layout, pageState);
    var markLengthMm = getMarkLengthMm(pageState, 4);
    var offsetMm = pageState.marks.offsetMm;
    var strokeColor = PDFLib.rgb(0.12, 0.15, 0.2);

    grid.verticals.forEach(function (xMm) {
      drawVectorLine(pdfPage, xMm, grid.top - offsetMm - markLengthMm, xMm, grid.top - offsetMm, strokeColor);
      drawVectorLine(pdfPage, xMm, grid.bottom + offsetMm, xMm, grid.bottom + offsetMm + markLengthMm, strokeColor);
    });

    grid.horizontals.forEach(function (yMm) {
      drawVectorLine(pdfPage, grid.left - offsetMm - markLengthMm, yMm, grid.left - offsetMm, yMm, strokeColor);
      drawVectorLine(pdfPage, grid.right + offsetMm, yMm, grid.right + offsetMm + markLengthMm, yMm, strokeColor);
    });
  }

  function drawVectorDoubleCutMarks(pdfPage, pageState, layout, PDFLib) {
    var grid = getDoubleCutGridMm(layout, pageState);
    var markLengthMm = getMarkLengthMm(pageState, 4);
    var offsetMm = pageState.marks.offsetMm;
    var strokeColor = PDFLib.rgb(0.12, 0.15, 0.2);

    grid.verticals.forEach(function (xMm) {
      drawVectorLine(pdfPage, xMm, grid.topOuter - offsetMm - markLengthMm, xMm, grid.topOuter - offsetMm, strokeColor);
      drawVectorLine(pdfPage, xMm, grid.bottomOuter + offsetMm, xMm, grid.bottomOuter + offsetMm + markLengthMm, strokeColor);
    });

    grid.horizontals.forEach(function (yMm) {
      drawVectorLine(pdfPage, grid.leftOuter - offsetMm - markLengthMm, yMm, grid.leftOuter - offsetMm, yMm, strokeColor);
      drawVectorLine(pdfPage, grid.rightOuter + offsetMm, yMm, grid.rightOuter + offsetMm + markLengthMm, yMm, strokeColor);
    });
  }

  function drawVectorLine(pdfPage, startXmm, startYTopMm, endXmm, endYTopMm, strokeColor) {
    pdfPage.drawLine({
      start: {
        x: mmToPoints(startXmm),
        y: topToPdfY(pdfPage.getHeight(), startYTopMm)
      },
      end: {
        x: mmToPoints(endXmm),
        y: topToPdfY(pdfPage.getHeight(), endYTopMm)
      },
      thickness: 0.7,
      color: strokeColor
    });
  }

  function getSimpleCutGridMm(layout, pageState) {
    var left = layout.offsetXMm + layout.bleedMm;
    var top = layout.offsetYMm + layout.bleedMm;
    var stepX = layout.footprintWidthMm + layout.gapMm;
    var stepY = layout.footprintHeightMm + layout.gapMm;
    var verticals = [];
    var horizontals = [];
    var col;
    var row;

    for (col = 0; col < pageState.layout.cols; col += 1) {
      var pieceLeft = left + col * stepX;
      verticals.push(pieceLeft);
      verticals.push(pieceLeft + pageState.piece.widthMm);
    }

    for (row = 0; row < pageState.layout.rows; row += 1) {
      var pieceTop = top + row * stepY;
      horizontals.push(pieceTop);
      horizontals.push(pieceTop + pageState.piece.heightMm);
    }

    verticals = dedupeNumericPositions(verticals, 0.01);
    horizontals = dedupeNumericPositions(horizontals, 0.01);

    return {
      left: verticals[0],
      right: verticals[verticals.length - 1],
      top: horizontals[0],
      bottom: horizontals[horizontals.length - 1],
      verticals: verticals,
      horizontals: horizontals
    };
  }

  function getDoubleCutGridMm(layout, pageState) {
    var bleedLeft = layout.offsetXMm;
    var bleedTop = layout.offsetYMm;
    var stepX = layout.footprintWidthMm + layout.gapMm;
    var stepY = layout.footprintHeightMm + layout.gapMm;
    var verticals = [];
    var horizontals = [];
    var col;
    var row;

    for (col = 0; col < pageState.layout.cols; col += 1) {
      var pieceBleedLeft = bleedLeft + col * stepX;
      verticals.push(pieceBleedLeft + layout.bleedMm);
      verticals.push(pieceBleedLeft + layout.bleedMm + pageState.piece.widthMm);
    }

    for (row = 0; row < pageState.layout.rows; row += 1) {
      var pieceBleedTop = bleedTop + row * stepY;
      horizontals.push(pieceBleedTop + layout.bleedMm);
      horizontals.push(pieceBleedTop + layout.bleedMm + pageState.piece.heightMm);
    }

    return {
      leftOuter: bleedLeft,
      rightOuter: bleedLeft + layout.gridWidthMm,
      topOuter: bleedTop,
      bottomOuter: bleedTop + layout.gridHeightMm,
      verticals: dedupeNumericPositions(verticals, 0.01),
      horizontals: dedupeNumericPositions(horizontals, 0.01)
    };
  }

  function getMarkLengthMm(pageState, fallbackMm) {
    return pageState.marks.lengthMm || fallbackMm;
  }

  function sourceTypeLabel(pageState) {
    if (pageState.source.kind === "pdf") {
      return "PDF";
    }
    if (pageState.source.kind === "image") {
      return "Imagen";
    }
    return "Sin archivo";
  }

  function buildExportName(variant) {
    var firstNamedPage = state.pages.find(function (pageState) {
      return !!pageState.source.name;
    });
    var sourceName = firstNamedPage ? firstNamedPage.source.name.replace(/\.[^.]+$/, "") : "imposicion";
    var suffix = variant === "vector" ? "-vectorial" : variant === "raster" ? "-raster" : "";
    return state.pages.length > 1
      ? sourceName + "-montaje-" + state.pages.length + "-paginas" + suffix + ".pdf"
      : sourceName + "-" + state.pages[0].layout.cutType + "-" + state.pages[0].layout.cols + "x" + state.pages[0].layout.rows + suffix + ".pdf";
  }

  function setStatus(message, tone, pageState) {
    var targetPage = pageState || getActivePage();
    targetPage.status.message = message;
    targetPage.status.tone = tone || "neutral";
    if (targetPage === getActivePage()) {
      els.statusMessage.textContent = message;
      els.statusMessage.className = "status " + targetPage.status.tone;
    }
  }

  function loadHtmlImage(url) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () {
        resolve(image);
      };
      image.onerror = function () {
        reject(new Error("No se pudo abrir la imagen seleccionada."));
      };
      image.src = url;
    });
  }

  function renderAssetToPngBytes(asset) {
    return new Promise(function (resolve, reject) {
      if (!asset) {
        reject(new Error("No se pudo preparar la imagen para exportación vectorial."));
        return;
      }

      var canvas = document.createElement("canvas");
      canvas.width = asset.naturalWidth || asset.width;
      canvas.height = asset.naturalHeight || asset.height;
      canvas.getContext("2d").drawImage(asset, 0, 0);

      canvas.toBlob(function (blob) {
        if (!blob) {
          reject(new Error("No se pudo convertir la imagen a PNG."));
          return;
        }

        blob.arrayBuffer().then(function (buffer) {
          resolve(new Uint8Array(buffer));
        }).catch(reject);
      }, "image/png");
    });
  }

  function saveBytesAsFile(bytes, filename) {
    var blob = new Blob([bytes], { type: "application/pdf" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function pixelsToMm(pixels, dpi) {
    return pixels / dpi * MM_PER_INCH;
  }

  function mmToPoints(mm) {
    return mm * POINTS_PER_MM;
  }

  function topToPdfY(pageHeightPts, topMm) {
    return pageHeightPts - mmToPoints(topMm);
  }

  function bottomFromTopMm(sheetHeightMm, topMm, boxHeightMm) {
    return mmToPoints(sheetHeightMm - topMm - boxHeightMm);
  }

  function pointsToMm(points) {
    return points / POINTS_PER_INCH * MM_PER_INCH;
  }

  function formatSize(widthMm, heightMm) {
    return formatInputNumber(widthMm) + " x " + formatInputNumber(heightMm) + " mm";
  }

  function formatInputNumber(value, decimals) {
    var maxDecimals = typeof decimals === "number" ? decimals : 1;
    return Number(value).toFixed(maxDecimals).replace(/\.0$/, "");
  }

  function formatBytes(bytes) {
    if (bytes >= 1024 * 1024) {
      return formatInputNumber(bytes / (1024 * 1024), 1) + " MB";
    }

    if (bytes >= 1024) {
      return formatInputNumber(bytes / 1024, 0) + " KB";
    }

    return Math.round(bytes) + " B";
  }

  function getEffectiveGapMm(pageState) {
    return pageState.layout.cutType === "simple" ? 0 : pageState.sheet.gapMm;
  }

  function setDisabled(elements, disabled) {
    elements.forEach(function (element) {
      element.disabled = disabled;
    });
  }

  function clonePlainObject(object) {
    return JSON.parse(JSON.stringify(object));
  }

  function clampInteger(value, min, max) {
    return Math.min(max, Math.max(min, Math.round(value)));
  }

  function clampNumber(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function readNumber(value, fallback) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function debounce(fn, delay) {
    var timeout;
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(fn, delay);
    };
  }

  function roundRect(context, x, y, width, height, radius) {
    var r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  function dedupePositions(values) {
    var sorted = values.slice().sort(function (a, b) {
      return a - b;
    });
    var epsilon = 0.75;
    return sorted.filter(function (value, index) {
      return index === 0 || Math.abs(value - sorted[index - 1]) > epsilon;
    });
  }

  function dedupeNumericPositions(values, epsilon) {
    var threshold = typeof epsilon === "number" ? epsilon : 0.01;
    var sorted = values.slice().sort(function (a, b) {
      return a - b;
    });

    return sorted.filter(function (value, index) {
      return index === 0 || Math.abs(value - sorted[index - 1]) > threshold;
    });
  }
})();
