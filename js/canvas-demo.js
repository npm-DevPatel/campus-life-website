/* ===========================
   HTML5 CANVAS API DEMO
   IST4035 - Upload 1
   =========================== */

/**
 * Demonstrates HTML5 Canvas API usage
 * Creates an animated welcome banner with gradient background
 * and decorative elements
 * 
 * @module canvas-demo
 */

/**
 * Initializes and renders the canvas animation
 * Called when the DOM is loaded
 */
function initCanvasDemo() {
    const canvas = document.getElementById('welcomeCanvas');
    
    // Check if canvas element exists and browser supports canvas
    if (!canvas || !canvas.getContext) {
        console.warn('Canvas API not supported or canvas element not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    let animationFrame;
    let offset = 0;
    
    /**
     * Draws gradient background on canvas
     * Creates a horizontal linear gradient from primary to primary-dark
     * 
     * @param {CanvasRenderingContext2D} context - Canvas 2D context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    function drawBackground(context, width, height) {
        const gradient = context.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#1e40af');    // Primary blue
        gradient.addColorStop(1, '#1e3a8a');    // Primary dark blue
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
    }
    
    /**
     * Draws animated text in the center of canvas
     * Text position has subtle vertical movement using sine wave
     * 
     * @param {CanvasRenderingContext2D} context - Canvas 2D context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {number} animOffset - Animation offset for movement calculation
     */
    function drawAnimatedText(context, width, height, animOffset) {
        context.fillStyle = 'white';
        context.font = 'bold 36px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Calculate y position with subtle bounce animation
        const yPosition = height / 2 + Math.sin(animOffset * 0.05) * 5;
        
        context.fillText('Campus Life Hub', width / 2, yPosition);
    }
    
    /**
     * Draws decorative animated circles
     * Circles have pulsing animation with different phases
     * 
     * @param {CanvasRenderingContext2D} context - Canvas 2D context
     * @param {number} width - Canvas width
     * @param {number} animOffset - Animation offset for size calculation
     */
    function drawDecorativeCircles(context, width, animOffset) {
        context.fillStyle = 'rgba(255, 255, 255, 0.2)';
        
        // Draw 3 circles with different animation phases
        for (let i = 0; i < 3; i++) {
            const x = (width / 4) * (i + 1);
            const baseRadius = 10;
            const pulseAmount = Math.sin(animOffset * 0.1 + i * Math.PI / 3) * 5;
            const radius = baseRadius + pulseAmount;
            
            context.beginPath();
            context.arc(x, 25, radius, 0, Math.PI * 2);
            context.fill();
        }
    }
    
    /**
     * Main animation loop
     * Uses requestAnimationFrame for smooth 60fps animation
     * Clears and redraws canvas on each frame
     */
    function animate() {
        // Clear entire canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw all canvas elements
        drawBackground(ctx, canvas.width, canvas.height);
        drawAnimatedText(ctx, canvas.width, canvas.height, offset);
        drawDecorativeCircles(ctx, canvas.width, offset);
        
        // Increment offset for next frame
        offset++;
        
        // Request next animation frame
        animationFrame = requestAnimationFrame(animate);
    }
    
    /**
     * Stops the animation loop
     * Called when page is unloaded or canvas is removed
     */
    function stopAnimation() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    }
    
    // Start animation
    animate();
    
    // Clean up animation when page unloads
    window.addEventListener('beforeunload', stopAnimation);
    
    // Log for evidence/debugging
    console.log('Canvas demo initialized:', {
        width: canvas.width,
        height: canvas.height,
        contextType: ctx ? '2d' : 'not available'
    });
}

// Export for use in main.js (preparing for module pattern in Upload 2)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initCanvasDemo };
}