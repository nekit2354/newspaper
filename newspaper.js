import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
const pdfDocument = pdfjsLib.getDocument(
    './assets/газета макет.pdf'
).promise;

let renderTasks = new WeakMap();

async function renderPdfPage(canvas) {
    const pdf = await pdfDocument;
    const pageNumber = Number(canvas.dataset.page);
    const page = await pdf.getPage(pageNumber);

    const originalViewport = page.getViewport({ scale: 1 });
    const baseScale = (window.innerHeight * 0.93) / originalViewport.height;
    const baseViewport = page.getViewport({ scale: baseScale });

    const qualityScale = baseScale * scale * window.devicePixelRatio;
    const renderViewport = page.getViewport({ scale: qualityScale });

    const previousTask = renderTasks.get(canvas);

    if (previousTask) {
        previousTask.cancel();

        try {
            await previousTask.promise;
        } catch (error) {}
    }

    const tempCanvas = document.createElement('canvas');

    tempCanvas.width = Math.ceil(renderViewport.width);
    tempCanvas.height = Math.ceil(renderViewport.height);

    const context = tempCanvas.getContext('2d');

    const task = page.render({
        canvasContext: context,
        viewport: renderViewport
    });

    renderTasks.set(canvas, task);

    try {
        await task.promise;

        if (renderTasks.get(canvas) !== task) return;

        canvas.width = tempCanvas.width;
        canvas.height = tempCanvas.height;

        canvas.style.width = `${baseViewport.width}px`;
        canvas.style.height = `${baseViewport.height}px`;

        canvas.getContext('2d').drawImage(tempCanvas, 0, 0);

    } catch (error) {
        if (error.name !== 'RenderingCancelledException') {
            console.error(error);
        }
    }
}

async function renderNewspaper() {
    const canvases = document.querySelectorAll('.newspaper-pdf');

    await Promise.all(
        [...canvases].map(canvas => renderPdfPage(canvas))
    );
}

let renderTimer;

function schedulePdfRender() {
    clearTimeout(renderTimer);

    renderTimer = setTimeout(() => {
        renderNewspaper();
    }, 150);
}









let main = document.querySelector('.main');
let viewport;
let content;

/* ЗУМ */
let scale = 1;
let x = 0;
let y = 0;
let dragging = false;
let moved = false;
let startX = 0;
let startY = 0;
let startOffsetX = 0;
let startOffsetY = 0;

function updateZoom() {
    if (!content) return;
    content.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
}

function setupZoom() {
    viewport = main.querySelector('.zoom-viewport');
    content = main.querySelector('.zoom-content');

    viewport.addEventListener('wheel', (event) => {
        event.preventDefault();

        const rect = viewport.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const oldScale = scale;
        const step = event.deltaY < 0 ? 1.15 : 1 / 1.15;

        scale = Math.min(5, Math.max(1, scale * step));

        x = mouseX - (mouseX - x) * (scale / oldScale);
        y = mouseY - (mouseY - y) * (scale / oldScale);

        if (scale === 1) {
            x = 0;
            y = 0;
        }

        updateZoom();
        schedulePdfRender();
    }, { passive: false });

    viewport.addEventListener('mousedown', (event) => {
        if (event.button !== 0 || scale <= 1) return;

        dragging = true;
        startX = event.clientX;
        startY = event.clientY;
        startOffsetX = x;
        startOffsetY = y;

        viewport.classList.add('dragging');
        event.preventDefault();
    });

    viewport.addEventListener('click', (event) => {
        if (moved) {
            event.preventDefault();
            event.stopPropagation();
            moved = false;
        }
    }, true);

    viewport.addEventListener('dblclick', (event) => {
        event.preventDefault();
        resetZoom();
    });
}

document.addEventListener('mousemove', (event) => {
    if (!dragging) return;

    x = startOffsetX + event.clientX - startX;
    y = startOffsetY + event.clientY - startY;

    updateZoom();
});

document.addEventListener('mouseup', () => {
    dragging = false;
    if (viewport) {
        viewport.classList.remove('dragging');
    }
});

function resetZoom() {
    scale = 1;
    x = 0;
    y = 0;
    dragging = false;
    updateZoom();
    schedulePdfRender();
}



showPage1();


//РАЗВОРОТ 1
function showPage1() {
    main.innerHTML = `
        <div class="skip_page" style="justify-content: end; margin-right: 1%;">
            <button class="to_start" disabled>⏮</button>
            <button class="back_page" disabled>◀</button>
        </div>
        <div class="zoom-viewport">
            <div class="zoom-content">
                <div class="img1">
                    <img src="./assets/gazeta_maket_1.jpg" alt="page_1" style="height: 93dvh;">
                    <button class="btn1"></button>
                    <button class="btn1_1"></button>
                    <button class="btn2"></button>
                    <button class="btn3"></button>
                    <button class="btn3_1"></button>
                    <button class="btn3_2"></button>
                    <button class="btn3_3"></button>
                    <button class="btn_photo_1"></button>
                    <button class="btn_photo_2"></button>
                    <button class="btn_photo_3"></button>
                </div>
                <div class="img2">
                    <img src="./assets/gazeta_maket_1.jpg" alt="page_2" style="height: 93dvh;">
                    <button class="btn4"></button>
                    <button class="btn4_1"></button>
                    <button class="btn5"></button>
                    <button class="btn6"></button>
                    <button class="btn6_1"></button>
                    <button class="btn6_2"></button>
                    <button class="btn6_3"></button>
                    <button class="btn_photo_4"></button>
                    <button class="btn_photo_5"></button>
                    <button class="btn_photo_6"></button>
                </div>
            </div>
        </div>
        <div class="skip_page" style="justify-content: start; margin-left: 1%;">
            <button class="next_page">▶</button>
            <button class="to_end">⏭</button>
        </div>
    `;
    setupZoom();
    resetZoom();
    //renderNewspaper();

    document.querySelector('.btn1').addEventListener('click', () => {
        currentBuilding = 0;
        showPhoto(0, true);
    });
    document.querySelector('.btn1_1').addEventListener('click', () => {
        currentBuilding = 0;
        showPhoto(0, true);
    });
    document.querySelector('.btn2').addEventListener('click', () => { showPhoto(2); });
    document.querySelector('.btn3').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn3_1').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn3_2').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn3_3').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn_photo_1').addEventListener('click', () => { showPhoto(3) });
    document.querySelector('.btn_photo_2').addEventListener('click', () => { showPhoto(4) });
    document.querySelector('.btn_photo_3').addEventListener('click', () => { showPhoto(5) });

    document.querySelector('.btn4').addEventListener('click', () => {
        currentBuilding = 0;
        showPhoto(0, true);
    });
    document.querySelector('.btn4_1').addEventListener('click', () => {
        currentBuilding = 0;
        showPhoto(0, true);
    });
    document.querySelector('.btn5').addEventListener('click', () => { showPhoto(2); });
    document.querySelector('.btn6').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn6_1').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn6_2').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn6_3').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn_photo_4').addEventListener('click', () => { showPhoto(3) });
    document.querySelector('.btn_photo_5').addEventListener('click', () => { showPhoto(4) });
    document.querySelector('.btn_photo_6').addEventListener('click', () => { showPhoto(5) });

    document.querySelector('.to_end').addEventListener('click', () => { showPage3(); });
    document.querySelector('.next_page').addEventListener('click', () => { showPage2(); });
}


//РАЗВОРОТ 2
function showPage2() {
    main.innerHTML = `
        <div class="skip_page" style="justify-content: end; margin-right: 1%;">
            <button class="to_start">⏮</button>
            <button class="back_page">◀</button>
        </div>
        <div class="zoom-viewport">
            <div class="zoom-content">
                <div class="img1">
                    <img src="./assets/gazeta_maket_1.jpg" alt="page_1" style="height: 93dvh;">
                    <button class="btn1"></button>
                    <button class="btn1_1"></button>
                    <button class="btn2"></button>
                    <button class="btn3"></button>
                    <button class="btn3_1"></button>
                    <button class="btn3_2"></button>
                    <button class="btn3_3"></button>
                    <button class="btn_photo_1"></button>
                    <button class="btn_photo_2"></button>
                    <button class="btn_photo_3"></button>
                </div>
                <div class="img2">
                    <img src="./assets/gazeta_maket_1.jpg" alt="page_2" style="height: 93dvh;">
                    <button class="btn4"></button>
                    <button class="btn4_1"></button>
                    <button class="btn5"></button>
                    <button class="btn6"></button>
                    <button class="btn6_1"></button>
                    <button class="btn6_2"></button>
                    <button class="btn6_3"></button>
                    <button class="btn_photo_4"></button>
                    <button class="btn_photo_5"></button>
                    <button class="btn_photo_6"></button>
                </div>
            </div>
        </div>
        <div class="skip_page" style="justify-content: start; margin-left: 1%;">
            <button class="next_page">▶</button>
            <button class="to_end">⏭</button>
        </div>
    `;
    setupZoom();
    resetZoom();
    //renderNewspaper();

    document.querySelector('.btn1').addEventListener('click', () => {
        currentBuilding = 0;
        showPhoto(0, true);
    });
    document.querySelector('.btn1_1').addEventListener('click', () => {
        currentBuilding = 0;
        showPhoto(0, true);
    });
    document.querySelector('.btn2').addEventListener('click', () => { showPhoto(2); });
    document.querySelector('.btn3').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn3_1').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn3_2').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn3_3').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn_photo_1').addEventListener('click', () => { showPhoto(3) });
    document.querySelector('.btn_photo_2').addEventListener('click', () => { showPhoto(4) });
    document.querySelector('.btn_photo_3').addEventListener('click', () => { showPhoto(5) });

    document.querySelector('.btn4').addEventListener('click', () => {
        currentBuilding = 0;
        showPhoto(0, true);
    });
    document.querySelector('.btn4_1').addEventListener('click', () => {
        currentBuilding = 0;
        showPhoto(0, true);
    });
    document.querySelector('.btn5').addEventListener('click', () => { showPhoto(2); });
    document.querySelector('.btn6').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn6_1').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn6_2').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn6_3').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn_photo_4').addEventListener('click', () => { showPhoto(3) });
    document.querySelector('.btn_photo_5').addEventListener('click', () => { showPhoto(4) });
    document.querySelector('.btn_photo_6').addEventListener('click', () => { showPhoto(5) });

    document.querySelector('.to_start').addEventListener('click', () => { showPage1(); });
    document.querySelector('.back_page').addEventListener('click', () => { showPage1(); });
    document.querySelector('.to_end').addEventListener('click', () => { showPage3(); });
    document.querySelector('.next_page').addEventListener('click', () => { showPage3(); });
}


//РАЗВОРОТ 3
function showPage3() {
    main.innerHTML = `
        <div class="skip_page" style="justify-content: end; margin-right: 1%;">
            <button class="to_start">⏮</button>
            <button class="back_page">◀</button>
        </div>
        <div class="zoom-viewport">
            <div class="zoom-content">
                <div class="img1">
                    <canvas class="newspaper-pdf" data-page="1" style="height: 93dvh;"></canvas>
                    <button class="btn1"></button>
                    <button class="btn1_1"></button>
                    <button class="btn2"></button>
                    <button class="btn3"></button>
                    <button class="btn3_1"></button>
                    <button class="btn3_2"></button>
                    <button class="btn3_3"></button>
                    <button class="btn_photo_1"></button>
                    <button class="btn_photo_2"></button>
                    <button class="btn_photo_3"></button>
                </div>
                <div class="img2">
                    <canvas class="newspaper-pdf" data-page="1" style="height: 93dvh;"></canvas>
                    <button class="btn4"></button>
                    <button class="btn4_1"></button>
                    <button class="btn5"></button>
                    <button class="btn6"></button>
                    <button class="btn6_1"></button>
                    <button class="btn6_2"></button>
                    <button class="btn6_3"></button>
                    <button class="btn_photo_4"></button>
                    <button class="btn_photo_5"></button>
                    <button class="btn_photo_6"></button>
                </div>
            </div>
        </div>
        <div class="skip_page" style="justify-content: start; margin-left: 1%;">
            <button class="next_page" disabled>▶</button>
            <button class="to_end" disabled>⏭</button>
        </div>
    `;
    setupZoom();
    resetZoom();
    renderNewspaper();

    document.querySelector('.btn1').addEventListener('click', () => {
        currentBuilding = 0;
        showPhoto(0, true);
    });
    document.querySelector('.btn1_1').addEventListener('click', () => {
        currentBuilding = 0;
        showPhoto(0, true);
    });
    document.querySelector('.btn2').addEventListener('click', () => { showPhoto(2); });
    document.querySelector('.btn3').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn3_1').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn3_2').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn3_3').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn_photo_1').addEventListener('click', () => { showPhoto(3) });
    document.querySelector('.btn_photo_2').addEventListener('click', () => { showPhoto(4) });
    document.querySelector('.btn_photo_3').addEventListener('click', () => { showPhoto(5) });

    document.querySelector('.btn4').addEventListener('click', () => {
        currentBuilding = 0;
        showPhoto(0, true);
    });
    document.querySelector('.btn4_1').addEventListener('click', () => {
        currentBuilding = 0;
        showPhoto(0, true);
    });
    document.querySelector('.btn5').addEventListener('click', () => { showPhoto(2); });
    document.querySelector('.btn6').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn6_1').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn6_2').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn6_3').addEventListener('click', () => { showPhoto(1); });
    document.querySelector('.btn_photo_4').addEventListener('click', () => { showPhoto(3) });
    document.querySelector('.btn_photo_5').addEventListener('click', () => { showPhoto(4) });
    document.querySelector('.btn_photo_6').addEventListener('click', () => { showPhoto(5) });

    document.querySelector('.to_start').addEventListener('click', () => { showPage1(); });
    document.querySelector('.back_page').addEventListener('click', () => { showPage2(); });
}

//ПОКАЗ КАРТИНОК
const buildings = [
    './assets/karta_1.jpg',
    './assets/2 - universiti.jpg',
    './assets/3 - ХИМИК Советская ул., 1А.jpg',
    './assets/kartinka_otkrytaya_Montazhnaya_oblast_1_kopia_2.jpg',
    './assets/kartinka_otkrytaya_Montazhnaya_oblast_1_kopia.jpg',
    './assets/kartinka_otkrytaya_Montazhnaya_oblast_1.jpg',
];
const hermitageGallery = [0, 1, 2];
let currentBuilding = 0;

function showPhoto(index, gallery = false) {
    let oldOverlay = document.querySelector('.photo-overlay');
    if (oldOverlay) {
        oldOverlay.remove();
    }

    let galleryIndex = hermitageGallery.indexOf(index);
    main.insertAdjacentHTML(`beforeend`, `
        <div class="photo-overlay">
            <div class="photo-container">
                ${gallery && galleryIndex > 0 ? '<button class="back">◀</button>' : ''}

                <div style="position: relative;">
                    <img src="${buildings[index]}" class="photo">
                    <button class="close">✗</button>
                </div>

                ${gallery && galleryIndex < hermitageGallery.length - 1 ? '<button class="next">▶</button>' : ''}
            </div>
        </div>
        `);
    let overlay = document.querySelector('.photo-overlay');

    overlay.querySelector('.close').addEventListener('click', () => {
        overlay.remove();
    });

    let next = overlay.querySelector('.next');
    if (next) {
        next.addEventListener('click', () => {
            currentBuilding = hermitageGallery[galleryIndex + 1];
            showPhoto(currentBuilding, true);
        });
    }

    let back = overlay.querySelector('.back');
    if (back) {
        back.addEventListener('click', () => {
            currentBuilding = hermitageGallery[galleryIndex - 1];
            showPhoto(currentBuilding, true);
        });
    }
}