<script>
    import { onMount } from 'svelte';
    import { createWorker } from 'tesseract.js';
    
    let canvas;
    let ctx;
    let textArea;
    let ocrWorker;
    
    
    let isDrawing = false;
    let isTypingMode = false;
    let penWidth = 3;
    let pages = [];
    let currentPage = 0;
    let isProcessingOCR = false;
    let recognizedText = '';
    let showOCRResult = false;
    
    
    const initializeCanvas = () => {
        ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 800 * dpr;
        canvas.height = 400 * dpr;
        canvas.style.width = '800px';
        canvas.style.height = '400px';
        ctx.scale(dpr, dpr);
        
        setDrawingDefaults();
    };

    const setDrawingDefaults = () => {
        if (!ctx) return;
        ctx.lineWidth = penWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000000';
        ctx.globalCompositeOperation = 'source-over';
    };

    
    const initializeOCR = async () => {
        ocrWorker = await createWorker('eng');
        // //await ocrWorker.loadLanguage('eng');
        // await ocrWorker.reinitialize('eng');
    };
    const updatePageIndicator = ()=> currentPage+1;
    
    
    onMount(async () => {
        if (!canvas) return;
        initializeCanvas();
        
        const blankImageData = ctx.createImageData(canvas.width, canvas.height);
        pages = [{ 
            type: 'drawing', 
            content: blankImageData,
            recognizedText: ''
        }];

        await initializeOCR();

        return () => {
            if (ocrWorker) {
                ocrWorker.terminate();
            }
        };
    });

    
    const performOCR = async () => {
        if (!ctx || isProcessingOCR) return;
        
        isProcessingOCR = true;
        showOCRResult = true;

        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(imageData, 0, 0);

            const { data: { text } } = await ocrWorker.recognize(tempCanvas);
            recognizedText = text.trim();
            
            if (pages[currentPage]) {
                pages[currentPage].recognizedText = recognizedText;
            }
        } catch (error) {
            console.error('OCR Error:', error);
            recognizedText = 'Error processing text. Please try again.';
        } finally {
            isProcessingOCR = false;
        }
    };

    const copyRecognizedText = () => {
        if (recognizedText) {
            navigator.clipboard.writeText(recognizedText);
        }
    };

    const convertToTextPage = () => {
        if (!recognizedText) return;
        
        handleModeChange('text');
        if (textArea) {
            textArea.value = recognizedText;
        }
    };

    
    const getCanvasCoordinates = (e) => {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        if (e.clientX !== undefined) {
            return {
                x: ((e.clientX - rect.left) / rect.width) * canvas.width / dpr,
                y: ((e.clientY - rect.top) / rect.height) * canvas.height / dpr
            };
        }
        else if (e.touches && e.touches[0]) {
            return {
                x: ((e.touches[0].clientX - rect.left) / rect.width) * canvas.width / dpr,
                y: ((e.touches[0].clientY - rect.top) / rect.height) * canvas.height / dpr
            };
        }
        return { x: 0, y: 0 };
    };

    const startDrawing = (e) => {
        if (isTypingMode || !ctx) return;
        isDrawing = true;
        const coords = getCanvasCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
    };

    const draw = (e) => {
        if (!isDrawing || isTypingMode || !ctx) return;
        e.preventDefault();
        const coords = getCanvasCoordinates(e);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
    };

    const stopDrawing = () => {
        isDrawing = false;
        if (ctx) ctx.beginPath();
    };

    
    const createBlankImageData = () => {
        if (!ctx) return null;
        return ctx.createImageData(canvas.width, canvas.height);
    };

    const saveCurrentPage = () => {
        if (!pages[currentPage]) return;
        
        const page = pages[currentPage];
        if (page.type === 'drawing' && ctx) {
            try {
                page.content = ctx.getImageData(0, 0, canvas.width, canvas.height);
            } catch (e) {
                console.error('Error saving canvas data:', e);
                page.content = createBlankImageData();
            }
        } else if (page.type === 'text' && textArea) {
            page.content = textArea.value;
        }
    };

    const loadPage = () => {
        if (!pages[currentPage]) return;
        
        const page = pages[currentPage];
        if (page.type === 'drawing' && ctx) {
            try {
                if (page.content) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.putImageData(page.content, 0, 0);
                } else {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            } catch (e) {
                console.error('Error loading canvas data:', e);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        } else if (page.type === 'text' && textArea) {
            textArea.value = page.content || '';
        }
    };

    const addPage = () => {
        saveCurrentPage();
        const newPage = {
            type: isTypingMode ? 'text' : 'drawing',
            content: isTypingMode ? '' : createBlankImageData(),
            recognizedText: ''
        };
        pages = [...pages, newPage];
        currentPage = pages.length - 1;
        if (newPage.type === 'drawing') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        showOCRResult = false;
        recognizedText = '';
    };

    
    const handleModeChange = (type) => {
        saveCurrentPage();
        if (!pages[currentPage]) return;
        
        pages[currentPage].type = type;
        isTypingMode = type === 'text';
        type === 'text' ? switchToTyping() : switchToDrawing();
    };

    const switchToDrawing = () => {
        if (!ctx) return;
        isTypingMode = false;
        setDrawingDefaults();
        loadPage();
    };

    const switchToTyping = () => {
        if (!textArea) return;
        isTypingMode = true;
        loadPage();
    };

    
    const handlePageNavigation = (direction) => {
        saveCurrentPage();
        const newPage = Math.max(0, Math.min(pages.length - 1, currentPage + direction));
        if (newPage !== currentPage) {
            currentPage = newPage;
            loadPage();
        }
    };

    
    const activateEraser = () => {
        if (!ctx) return;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 20;
    };

    const setPenMode = () => {
        if (!ctx) return;
        setDrawingDefaults();
    };

    const clearCanvas = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    
    const exportNotes = async () => {
        saveCurrentPage();
        
        
    };

    const exportCurrentPage = async () => {
        saveCurrentPage();
        const page = pages[currentPage];
        
        if (page.type === 'drawing') {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(page.content, 0, 0);
            
            const link = document.createElement('a');
            link.download = `note_page${currentPage + 1}.png`;
            link.href = tempCanvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            const blob = new Blob([page.content || ''], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `note_page${currentPage + 1}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    
    $: if (ctx && penWidth) {
        ctx.lineWidth = penWidth;
    }
</script>

<div class="container">
    <h1>Multi-Page Note-Taking Application</h1>
    
    <div class="toolbar">
        <button 
            class:active={isTypingMode} 
            on:click={() => handleModeChange('text')}
        >
            <i class="fas fa-keyboard"></i> Typing Mode
        </button>
        <button 
            class:active={!isTypingMode} 
            on:click={() => handleModeChange('drawing')}
        >
            <i class="fas fa-pen"></i> Drawing Mode
        </button>
        
        {#if !isTypingMode}
            <label for="penColor">Pen Color:</label>
            <input 
                type="color" 
                id="penColor" 
                on:input={(e) => ctx && (ctx.strokeStyle = e.target.value)}
            >
            
            <label for="penSize">Pen Size:</label>
            <input 
                type="range" 
                id="penSize" 
                min="1" 
                max="20" 
                bind:value={penWidth}
            >
            
            <button on:click={activateEraser}>
                <i class="fas fa-eraser"></i> Eraser
            </button>
            <button on:click={setPenMode}>
                <i class="fas fa-pen"></i> Pen
            </button>
            <button on:click={clearCanvas}>
                <i class="fas fa-trash"></i> Clear
            </button>

            <div class="ocr-controls">
                <button 
                    on:click={performOCR}
                    disabled={isProcessingOCR}
                >
                    <i class="fas fa-font"></i>
                    {isProcessingOCR ? 'Processing...' : 'Recognize Text'}
                </button>
            </div>
        {/if}

        <div class="export-controls">
            <button on:click={exportCurrentPage}>
                <i class="fas fa-file-export"></i> Export Page
            </button>
            <button on:click={exportNotes}>
                <i class="fas fa-file-archive"></i> Export All
            </button>
        </div>
    </div>

    <div class="canvas-container">
        {#if !isTypingMode}
            <canvas 
                bind:this={canvas}
                on:mousedown={startDrawing}
                on:mousemove={draw}
                on:mouseup={stopDrawing}
                on:mouseleave={stopDrawing}
                on:touchstart|preventDefault={startDrawing}
                on:touchmove|preventDefault={draw}
                on:touchend={stopDrawing}
            ></canvas>
        {:else}
            <textarea 
                bind:this={textArea}
                placeholder="Start typing your notes here..."
            ></textarea>
        {/if}
    </div>
    {#if showOCRResult && recognizedText}
        <div class="ocr-result">
            <h3>Recognized Text:</h3>
            <div class="recognized-text">
                {recognizedText}
            </div>
            <div class="ocr-actions">
                <button on:click={copyRecognizedText}>
                    <i class="fas fa-copy"></i> Copy Text
                </button>
                <button on:click={convertToTextPage}>
                    <i class="fas fa-file-alt"></i> Convert to Text Page
                </button>
                <button on:click={() => showOCRResult = false}>
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    {/if}

    <div class="page-controls">
        <button 
            on:click={() => handlePageNavigation(-1)}
            disabled={currentPage === 0}
        >
            <i class="fas fa-arrow-left"></i> Previous
        </button>
        <span class="page-indicator">Page {updatePageIndicator()} of {pages.length}</span>
        <button 
            on:click={() => handlePageNavigation(1)}
            disabled={currentPage === pages.length - 1}
        >
            Next <i class="fas fa-arrow-right"></i>
        </button>
        <button on:click={addPage}>
            <i class="fas fa-plus"></i> Add Page
        </button>
    </div>
</div>

<style>
    .container {
        max-width: 900px;
        margin: 0 auto;
        padding: 20px;
    }

    h1 {
        text-align: center;
        color: #2c3e50;
        margin-bottom: 30px;
    }

    .toolbar {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 20px;
        padding: 10px;
        background: #f5f6fa;
        border-radius: 5px;
        align-items: center;
    }

    button {
        padding: 8px 15px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
    }

    button:hover:not(:disabled) {
        background: #2980b9;
        transform: translateY(-1px);
    }

    button:disabled {
        background: #bdc3c7;
        cursor: not-allowed;
        opacity: 0.7;
    }

    button.active {
        background: #2ecc71;
    }

    .canvas-container {
        border: 2px solid #bdc3c7;
        border-radius: 5px;
        margin-bottom: 20px;
        overflow: hidden;
    }

    canvas {
        touch-action: none;
        cursor: crosshair;
    }

    canvas, textarea {
        width: 100%;
        height: 400px;
        display: block;
    }

    textarea {
        padding: 10px;
        font-family: Arial, sans-serif;
        font-size: 16px;
        border: none;
        resize: none;
        line-height: 1.5;
    }

    textarea:focus {
        outline: none;
    }

    .page-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        margin-bottom: 20px;
    }

    .page-indicator {
        font-weight: bold;
        color: #2c3e50;
        min-width: 120px;
        text-align: center;
    }

    label {
        color: #2c3e50;
        font-weight: 500;
    }

    input[type="color"] {
        width: 40px;
        height: 30px;
        padding: 0;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    input[type="range"] {
        width: 100px;
    }
    .ocr-controls {
        margin-left: auto;
        display: flex;
        gap: 10px;
    }

    .ocr-result {
        margin-top: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 5px;
        border: 1px solid #dee2e6;
    }

    .recognized-text {
        margin: 10px 0;
        padding: 10px;
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        min-height: 100px;
        white-space: pre-wrap;
    }

    .ocr-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }

    button:disabled {
        background: #cbd5e0;
        cursor: not-allowed;
    }

    button:disabled:hover {
        transform: none;
    }
</style>