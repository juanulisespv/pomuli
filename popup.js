// Popup JavaScript para la extensión Pomodoro
document.addEventListener('DOMContentLoaded', () => {
    const openSidebarBtn = document.getElementById('openSidebar');
    
    if (openSidebarBtn) {
        openSidebarBtn.addEventListener('click', async () => {
            try {
                // Abrir el side panel en la ventana actual
                await chrome.sidePanel.open({ 
                    windowId: chrome.windows.WINDOW_ID_CURRENT 
                });
                
                // Cerrar el popup
                window.close();
                
            } catch (error) {
                console.error('Error abriendo side panel:', error);
                
                // Fallback: intentar sin especificar windowId
                try {
                    await chrome.sidePanel.open({});
                    window.close();
                } catch (fallbackError) {
                    console.error('Error en fallback:', fallbackError);
                }
            }
        });
    }
});
